const log = require("./lib/log");
const clear = require("clear");
const files = require("./lib/files");
const inquirer = require("./lib/inquirer");
const github = require("./lib/github");
const fs = require("fs");

async function getGithubToken() {
  // Fetch token from config store
  let token = github.getStoredGithubToken();
  if (token) {
    return token;
  }

  // No token found, use credentials to access GitHub account
  token = await github.getPersonalAccessToken();

  return token;
}

async function handleBlogPostUserInput() {
  const {
    title,
    description,
    date,
    tags
  } = await inquirer.askBlogPostDetails();
  const formatTitle = title
    .toLowerCase()
    .split(" ")
    .join("-");

  if (files.directoryExists(formatTitle)) {
    log.error("This folder already exists! Try a new one or exit with CTRL+C.");
    handleBlogPostUserInput();
  } else {
    files.createDirectory(formatTitle);
  }

  return Promise.resolve({
    title,
    formatTitle,
    description,
    date,
    tags
  });
}

async function main() {
  clear();

  log.print("Create Blog Post", { color: "yellow", isTitle: true });
  log.print(
    `A simple CLI tool to create a blog post based on Gatsby blog starter. 
      Make sure to run this from the root of your project.`,
    { color: "blue" }
  );

  if (!files.isDirectoryGitRepo()) {
    log.errorAndExit(
      "This is not your root directory or it's not a valid git repo."
    );
  }

  let token;
  try {
    token = await getGithubToken();
    github.githubAuth(token);
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

  const {
    title,
    formatTitle,
    description,
    date,
    tags
  } = await handleBlogPostUserInput();
  // files.createPostTemplate(title, formatTitle, description, date, tags);
  // specify the path to the file, and create a buffer with characters we want to write
  let path = `${formatTitle}/${formatTitle}.md`;

  // open the file in writing mode, adding a callback function where we do the actual writing
  fs.open(path, "w", function(err, fd) {
    if (err) {
      throw "could not open file: " + err;
    }

    // write the contents of the buffer, from position 0 to the end, to the file descriptor returned in opening our file
    fs.write(
      fd,
      "Those who wish to follow me\nI welcome with my hands\nAnd the red sun sinks at last",
      null,
      "utf8",
      function(err) {
        if (err) throw "error writing file: " + err;
        fs.close(fd, async function() {
          console.log("wrote the file successfully");
          await github.checkoutNewBranch(formatTitle);
          await github.add(`${formatTitle}/${formatTitle}.md`);
          await github.commit();
          await github.push(formatTitle);
          await github.submitPr(formatTitle);
        });
      }
    );
  });
}

main();
