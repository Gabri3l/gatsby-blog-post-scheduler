const inquirer = require("inquirer");
const moment = require("moment");

module.exports = {
  askBlogPostDetails: () =>
    inquirer.prompt([
      {
        name: "title",
        type: "input",
        message: `Post title (e.g. "How to fry water in 1 easy step!"):`,
        default: `aaa-${Math.floor(Math.random() * 100)}`,
        validate: value => (value === "" ? "Please enter a valid title." : true)
      },
      {
        name: "description",
        type: "input",
        message: `Post brief description (e.g. "A simple recipe anyone can recreate"):`,
        default: "hello there",
        validate: value =>
          value.length > 150
            ? "Please enter a description shorter than 150 chars."
            : true
      },
      {
        name: "date",
        type: "input",
        message: `Post date (e.g. "2020-03-26" or "2020-03-26 14:00:00"):`,
        default: "2020-01-26 14:00:00",
        filter: value => `${value.replace(" ", "T")}.000Z`,
        validate: value =>
          moment(value).isValid() ? true : "Please provide a valid date."
      },
      {
        name: "tags",
        type: "input",
        message: `Comma separated tags (e.g. "JavaScript, Algorithms"):`
      }
    ]),
  askGithubCredentials: () =>
    inquirer.prompt([
      {
        name: "username",
        type: "input",
        message: "Enter your GitHub username or e-mail address:",
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return "Please enter your username or e-mail address.";
          }
        }
      },
      {
        name: "password",
        type: "password",
        message: "Enter your password:",
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return "Please enter your password.";
          }
        }
      }
    ]),
  getTwoFactorAuthenticationCode: () =>
    inquirer.prompt({
      name: "twoFactorAuthenticationCode",
      type: "input",
      message: "Enter your two-factor authentication code:",
      validate: function(value) {
        if (value.length) {
          return true;
        } else {
          return "Please enter your two-factor authentication code.";
        }
      }
    })
};
