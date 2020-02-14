const CLI = require("clui");
const Configstore = require("configstore");
const git = require("simple-git/promise");
const { Octokit } = require("@octokit/rest");
const Spinner = CLI.Spinner;
const { createBasicAuth } = require("@octokit/auth-basic");

const inquirer = require("./inquirer");
const pkg = require("../package.json");

const conf = new Configstore(pkg.name);

let octokit;

module.exports = {
  getInstance: () => {
    return octokit;
  },

  getStoredGithubToken: () => {
    return conf.get("github.token");
  },

  getPersonalAccessToken: async () => {
    const credentials = await inquirer.askGithubCredentials();
    const status = new Spinner("Authenticating you, please wait...");

    status.start();

    const auth = createBasicAuth({
      username: credentials.username,
      password: credentials.password,
      async on2Fa() {
        status.stop();
        const res = await inquirer.getTwoFactorAuthenticationCode();
        status.start();
        return res.twoFactorAuthenticationCode;
      },
      token: {
        scopes: ["user", "public_repo", "repo", "repo:status"],
        note:
          "create-gatsby-blog-post, the command-line tool for initalizing a blog post"
      }
    });

    try {
      const res = await auth();

      if (res.token) {
        conf.set("github.token", res.token);
        return res.token;
      } else {
        throw new Error("GitHub token was not found in the response");
      }
    } finally {
      status.stop();
    }
  },

  githubAuth: token => {
    octokit = new Octokit({
      auth: token
    });
  },

  checkoutNewBranch: async branch => {
    try {
      return await git(__dirname)
        .silent(true)
        .checkoutLocalBranch(branch);
    } catch (err) {
      console.log(err.message);
    }
  },

  commitChanges: async () => {
    try {
      return await git(__dirname)
        .silent(true)
        .raw(["commit", "-am", "post: add blog post initial draft"]);
    } catch (err) {
      console.log(err.message);
    }
  },

  pushChanges: async branch => {
    try {
      return await git(__dirname)
        .silent(true)
        .raw(["push", "-u", "origin", branch]);
    } catch (err) {
      console.log(err.message);
    }
  },

  submitPr: async branch => {
    const {
      data: { login }
    } = await octokit.users.getAuthenticated();
    try {
      console.log(__dirname);
      await octokit.pulls.create({
        owner: login,
        repo: "create-gatsby-blog-post",
        title: branch,
        head: `${login}:${branch}`,
        body: "/schedule lol",
        base: "master"
      });
    } catch (error) {
      console.log(error.message);
    }
  }
};
