// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

// Launch script
loadScript('https://assets.adobedtm.com/2d251f50426c/e52f833be42a/launch-bdb68bbb4cf5-development.min.js');

// Append to window.dataLayer
// Add page title, page name, and page URL to window.dataLayer
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'pageLoad',
  page: {
    pageName: document.title,
    pageTitle: document.title,
    pagePath: window.location.href,
    locale: document.documentElement.lang,
  },
});
