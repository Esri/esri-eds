import { readdir, readFileSync } from 'fs';
import { extname, join, basename } from 'path';
import { stdout } from 'process';

const directoryPath = './tools/importer/svgs'; // Replace with your folder path

const additionalSvgs = [
  {
    name: 'contact-email-48',
    contents: '<svg id="icon-ui-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path style="fill:#48E2CB;" d="M26.508 34.149H4.433l13.092-12.484 5.483 4.92 5.481-4.918 5.222 4.988c.288-.1.581-.189.879-.267l-5.503-5.257L42.108 9.445v17.518c.272.12.54.247.8.386v-18.8l-.004-.449H3.508l-.4.049v26.8h23.194c.061-.27.126-.538.206-.8zm15.01-25.25l-18.51 16.612L4.498 8.9zm-37.61.546l13.02 11.685-13.02 12.414zm33.6 19.537a8.518 8.518 0 1 0 0 17.036v-.8a7.718 7.718 0 1 1 7.718-7.718v2.03a1.63 1.63 0 0 1-3.26 0v-6.765h-.799v2.199a4.455 4.455 0 1 0 .045 5.013 2.427 2.427 0 0 0 4.814-.448V37.5a8.527 8.527 0 0 0-8.518-8.518zm0 12.177a3.659 3.659 0 1 1 3.659-3.659 3.663 3.663 0 0 1-3.659 3.659z" id="icon-ui-svg--base"></path></svg>',
  },
];

readdir(directoryPath, (err, files) => {
  if (err) {
    console.log(`Unable to scan directory: ${err}`);
    return;
  }

  const svgFiles = files.filter((file) => extname(file) === '.svg');
  const svgArray = additionalSvgs;

  svgFiles.forEach((file) => {
    const filePath = join(directoryPath, file);
    const fileContents = readFileSync(filePath, 'utf8');
    const fileName = basename(file, '.svg');
    svgArray.push({ name: fileName, contents: fileContents });
  });

  // write to stdout as js
  const jsDataStr = `export default ${JSON.stringify(svgArray, null, 2)}\n`;
  stdout.write(jsDataStr);
});
