const process = require('process');
const fs = require('fs');
const path = require('path');

const directoryPath = './svgs'; // Replace with your folder path

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.log(`Unable to scan directory: ${err}`);
    return;
  }

  const svgFiles = files.filter((file) => path.extname(file) === '.svg');
  const svgArray = [];

  svgFiles.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(file, '.svg');
    svgArray.push({ name: fileName, contents: fileContents });
  });

  // write to stdout as js
  const jsDataStr = `export default ${JSON.stringify(svgArray, null, 2)}\n`;
  process.stdout.write(jsDataStr);
});
