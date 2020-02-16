const chalk = require("chalk");
const figlet = require("figlet");

module.exports = {
  error: m => {
    console.log(chalk.red(m));
  },
  errorAndExit: (m, exitCode = null) => {
    console.log(chalk.red(m));
    if (exitCode === null) {
      process.exit();
    } else {
      process.exit(exitCode);
    }
  },
  print: (m, { color, isTitle } = { color: "white", isTitle: false }) => {
    if (isTitle) {
      if (chalk[color] === undefined) {
        throw new Error("The color you picked does not exist.");
      }
      console.log(
        chalk[color](figlet.textSync(m, { horizontalLayout: "fitted" }))
      );
    } else {
      console.log(chalk[color](m));
    }
  }
};
