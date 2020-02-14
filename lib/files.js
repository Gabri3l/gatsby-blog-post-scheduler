const fs = require("fs");
const path = require("path");

module.exports = {
  getCurrentDirectoryBase: () => {
    return path.basename(process.cwd());
  },

  directoryExists: filePath => {
    return fs.existsSync(filePath);
  },

  isDirectoryGitRepo: () => {
    return fs.existsSync(".git");
  },

  createDirectory: dir => {
    return fs.mkdirSync(dir);
  },

  createPostTemplate: (title, fileName, desc, date, tags, cb) => {
    fs.writeFile(
      `${fileName}/${fileName}.md`,
      `---\ntitle: "${title}"\ndescription: "${desc}"\ndate: "${date}"\ntags: ${tags}\npublished: true\n---`,
      cb
    );
  }
};
