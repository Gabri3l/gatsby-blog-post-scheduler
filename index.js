#!/usr/bin/env node

const log = require("./lib/log");
const { Spinner } = require("clui");
const clear = require("clear");
const path = require("path");
const files = require("./lib/files");
const inquirer = require("./lib/inquirer");
const github = require("./lib/github");

const BLOG_POSTS_PATH = path.join("content", "blog");

async function handleBlogPostUserInput() {
  const {
    title,
    description,
    date,
    tags
  } = await inquirer.askBlogPostDetails();
  const urlFormatTitle = title
    .toLowerCase()
    .split(" ")
    .join("-");

  files.createDirectory(path.join(BLOG_POSTS_PATH, urlFormatTitle));

  return Promise.resolve({
    title,
    urlFormatTitle,
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
  }

  try {
    await github.authenticateUser();

    const {
      title,
      urlFormatTitle,
      description,
      date,
      tags
    } = await handleBlogPostUserInput();
    const newBlogPostFilePath = path.join(
      BLOG_POSTS_PATH,
      urlFormatTitle,
      `index.md`
    );
    files.createPostTemplate(
      title,
      newBlogPostFilePath,
      description,
      date,
      tags
    );
    const status = new Spinner(
      `Committing your changes to branch ${urlFormatTitle}...`
    );
    status.start();
    await github.checkoutNewBranch(urlFormatTitle);
    await github.add(newBlogPostFilePath);
    await github.commit();
    await github.push(urlFormatTitle);
    status.stop();
    await github.submiatPr(urlFormatTitle, date.split(" ")[0]);
  } catch (error) {
    log.error(error.message);
  }
}

main();
