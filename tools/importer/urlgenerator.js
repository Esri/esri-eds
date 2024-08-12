import { stdout } from 'process';
import languages from './languages.js';
import enUrls from './en_urls.js';
import { writeFileSync } from 'fs';

const urlsByLanguage = [];

languages.forEach((language) => {
  console.log('languages', language);
  enUrls.forEach(({ Theme, URL}) => {

    const newUrl = URL.replace('/en-us/', `/${language}/`);

    urlsByLanguage.push({
      Theme,
      URL: newUrl,
    });
  });
});

const jsDataStr = `export default ${JSON.stringify(urlsByLanguage, null, 2)}\n`;
writeFileSync('urls.js', jsDataStr);

// write to a txt file with only the urls to importer-urls.txt
const urls = urlsByLanguage.map(({ URL }) => URL).join('\n');
writeFileSync('importer-urls.txt', urls);
