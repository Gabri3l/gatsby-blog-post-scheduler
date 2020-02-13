const log = require("./lib/log");
const clear = require("clear");
const files = require("./lib/files");
const inquirer = require("./lib/inquirer");

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

  const {
    title,
    formatTitle,
    description,
    date,
    tags
  } = await handleBlogPostUserInput();
  files.createPostTemplate(title, formatTitle, description, date, tags);
}

main();
