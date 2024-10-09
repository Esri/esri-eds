import { loadCSS, loadScript, getMetadata } from '../../scripts/aem.js';
import ffetch from '../../scripts/ffetch.js';
import { link } from '../../scripts/dom-helpers.js';

/**
  * Use getMetadata to get the locale of the page
  * * Update the html lang attribute to the locale
  * If the language is Arabic, Hebrew or Kuwaiti Arabic, set the direction to rtl
  */
function setLocaleAndDirection() {
  const locale = getMetadata('og:locale') || 'en-us';
  const dir = (locale === 'ar-sa' || locale === 'he-il' || locale === 'ar-kw') ? 'rtl' : 'ltr';
  document.querySelector('html').setAttribute('dir', dir);

  const lang = (locale === 'en-us') ? 'en' : locale;
  document.querySelector('html').setAttribute('lang', lang);
}

/**
 * get all entries from the index
 * create alternate langauge links for each entry
 */
async function alternateHeaders() {
  // get current page url, parse and remove the protocol and domain
  const url = window.location.href;
  const origin = '/en-us';
  const path = url.replace(window.location.origin, '');
  // parse path to remove the /xx-xx/ from the beginning
  const pathArray = path.split('/');
  const pathArrayLength = pathArray.length;
  let pathArrayString = '';

  for (let i = 0; i < pathArrayLength; i += 1) {
    if (i !== 1 || !/^[a-z]{2}-[a-z]{2}$/.test(pathArray[i])) {
      if (pathArray[i] !== '') {
        pathArrayString += `/${pathArray[i]}`;
      }
    }
  }

  const entries = await ffetch('/query-index.json')
    .all();

  const head = document.querySelector('head');
  entries
    .map((entry) => {
      if (entry.path.includes(pathArrayString)) {
        const match = entry.path.match(/^\/([a-z]{2}-[a-z]{2})\//);
        if (match) {
          return [entry, match[1]];
        }
      }

      return null;
    })
    .filter((entry) => entry !== null)
    .forEach(([entry, hreflang]) => {
      // <link rel="alternate" hreflang="en" href="https://www.example.com/en/page.html" />
      // create alternate links for all matching entries
      head.appendChild(link({
        rel: 'alternate',
        hreflang,
        href: window.location.origin + entry.path,
      }));
    });

  // add x-default alternate link
  const xDefaultLink = document.createElement('link');
  xDefaultLink.rel = 'alternate';
  xDefaultLink.hreflang = 'x-default';
  xDefaultLink.setAttribute('href', window.location.origin + origin + pathArrayString);
  head.appendChild(xDefaultLink);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate() {
  setLocaleAndDirection();
  await alternateHeaders().then(async () => {
    window.gnav_jsonPath = '/2022-nav-config.25.json';
    await Promise.all([loadScript('https://webapps-cdn.esri.com/CDN/components/global-nav/js/gn.js'), loadCSS('https://webapps-cdn.esri.com/CDN/components/global-nav/css/gn.css')]);
  });
}
