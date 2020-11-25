const fs = require("fs");
const path = require("path");

function isValid(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return e;
  }

  return null;
}

function validateFile(filePath) {
  const data = fs.readFileSync(filePath, "utf8");
  const error = isValid(data);

  if (error) {
    console.error("Error in file: ", filePath);
    console.error(error);
    process.exit(1);
  }
}

const localesPath = "./src/lib/strings/locales";

const dirs = fs.readdirSync(localesPath);
dirs.forEach((dir) => {
  const files = fs.readdirSync(path.join(localesPath, dir));
  files.forEach((file) => {
    validateFile(path.join(localesPath, dir, file));
  });
});
