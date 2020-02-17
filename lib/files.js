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

  createPostTemplate: (title, fileName, desc, date, tags) => {
    let formatDate = date.includes(":")
      ? `${date.replace(" ", "T")}.000Z`
      : `${date}T12:00:00.000Z`;
    return fs.writeFileSync(
      `content/blog/${fileName}/${fileName}.md`,
      `---\ntitle: "${title}"\ndescription: "${desc}"\ndate: "${formatDate}"\ntags: ${tags}\npublished: true\n---`
    );
  }
};
