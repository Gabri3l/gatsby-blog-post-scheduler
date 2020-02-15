const { Spinner } = require("clui");
const Configstore = require("configstore");
const git = require("simple-git/promise");
const { Octokit } = require("@octokit/rest");
const { createBasicAuth } = require("@octokit/auth-basic");

const inquirer = require("./inquirer");
const log = require("./log");
const pkg = require("../package.json");
const files = require("./files");
const conf = new Configstore(pkg.name);

let octokit = null;

function getInstance() {
  if (octokit === null) {
    log.error("You need to authenticate a user first.");
  } else {
    return octokit;
  }
}

async function getToken() {
  return conf.get("github.token") || (await getPersonalAccessToken());
}

async function getPersonalAccessToken() {
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
}

function githubAuth(token) {
  octokit = new Octokit({
    auth: token
  });
}

async function authenticateUser() {
  try {
    githubAuth(await getToken());
  } catch (err) {
    if (err) {
      switch (err.status) {
        case 401:
          log.error(
            "Couldn't log you in. Please provide correct credentials/token."
          );
          break;
        case 422:
          log.error(
            "There is already a remote repository or token with the same name"
          );
          break;
        default:
          log.error(err);
      }
    }
  }
}

function checkoutNewBranch(branch) {
  try {
    return git(__dirname)
      .silent(true)
      .checkoutLocalBranch(branch);
  } catch (err) {
    console.log(err.message);
  }
}

function add(filename) {
  try {
    return git(__dirname)
      .silent(true)
      .add(filename);
  } catch (err) {
    console.log(err.message);
  }
}

function commit() {
  try {
    return git(__dirname)
      .silent(true)
      .commit("post: add blog post initial draft");
  } catch (err) {
    console.log(err.message);
  }
}

function push(branch) {
  try {
    return git(__dirname)
      .silent(true)
      .raw(["push", "-u", "origin", branch]);
  } catch (err) {
    console.log(err.message);
  }
}

async function submitPr(branch, scheduleDate) {
  const {
    data: { login }
  } = await octokit.users.getAuthenticated();
  try {
    await octokit.pulls.create({
      owner: login,
      repo: files.getCurrentDirectoryBase(),
      title: branch,
      head: `${login}:${branch}`,
      body: `/schedule ${scheduleDate}`,
      base: "master"
    });
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  authenticateUser,
  getInstance,
  getPersonalAccessToken,
  githubAuth,
  checkoutNewBranch,
  add,
  commit,
  push,
  submitPr
};
