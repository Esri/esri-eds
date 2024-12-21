import fs from 'fs';

// Read the JSON file
fs.readFile('tools/importer/pending-icons.txt', 'utf8', (readErr, data) => {
  if (readErr) {
    console.error('Error reading file:', readErr);
    return;
  }

  console.log('Raw data:', data); // Log the raw data

  try {
    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Stringify the JSON data with proper escaping
    const escapedJsonData = JSON.stringify(jsonData, null, 2);

    // Write the escaped JSON data back to the file
    fs.writeFile('tools/importer/pending-icons.txt', escapedJsonData, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error writing file:', writeErr);
      } else {
        console.log('File successfully updated with escaped control characters.');
      }
    });
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
  }
});
