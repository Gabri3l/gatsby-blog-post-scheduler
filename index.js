#!/usr/bin/env node

const log = require("./lib/log");
const clear = require("clear");
const path = require("path");
const files = require("./lib/files");
const inquirer = require("./lib/inquirer");
const github = require("./lib/github");

const BLOG_POSTS_PATH = path.join(__dirname, "content", "blog");

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

  files.createDirectory(path.join(BLOG_POSTS_PATH, formatTitle));

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
    `A simple CLI tool to create and schedule a blog post based on Gatsby blog starter.
      Make sure to run this from the root of your project.`,
    { color: "blue" }
  );

  if (!files.isDirectoryGitRepo()) {
    log.errorAndExit(
      "This is not your root directory or it's not a valid git repo."
    );
  } else {
    log.print("Found a .git folder, great!", { color: "blue" });
  }

  try {
    await github.authenticateUser();

    const {
      title,
      formatTitle,
      description,
      date,
      tags
    } = await handleBlogPostUserInput();
    const newBlogPostFilePath = path.join(
      BLOG_POSTS_PATH,
      formatTitle,
      `${formatTitle}.md`
    );
    files.createPostTemplate(
      title,
      newBlogPostFilePath,
      description,
      date,
      tags
    );
    await github.checkoutNewBranch(formatTitle);
    await github.add(newBlogPostFilePath);
    await github.commit();
    await github.push(formatTitle);
    await github.submitPr(formatTitle, date.split(" ")[0]);
  } catch (error) {
    log.error(error.message);
  }
}

main();
