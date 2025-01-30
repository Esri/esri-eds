#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const csv = require('csv-parser');

const csvFilePath = path.join(__dirname, 'import-report.csv');

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    const iconsContent = row.icons;
    if (iconsContent) {
      const icons = JSON.parse(iconsContent);

      const iconsEntries = Object.entries(icons);
      for (let i = 0; i < iconsEntries.length; i += 1) {
        const [key, value] = iconsEntries[i];
        const fileName = `${key}.svg`; // Generate a unique file name
        const filePath = path.join(__dirname, 'icons', fileName);
        fs.writeFile(filePath, value, (err) => {
          if (err) {
            console.error(`Error writing file ${fileName}:`, err);
          } else {
            console.log(`File ${fileName} created successfully.`);
          }
        });
      }
    }
  })
  .on('end', () => {
    console.log('CSV file successfully processed.');
  })
  .on('error', (err) => {
    console.error('Error reading CSV file:', err);
  });
