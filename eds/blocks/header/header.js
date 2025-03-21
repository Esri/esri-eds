import {
  getMetadata,
  loadCSS,
  loadScript,
} from '../../scripts/aem.js';
import ffetch from '../../scripts/ffetch.js';
import { link, script } from '../../scripts/dom-helpers.js';

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

async function createBreadcrumbs() {
  const breadcrumbs = getMetadata('breadcrumbs')
    .split(',')
    .map((breadcrumb) => breadcrumb.trim());

  const filteredBreadcrumbs = (await ffetch('/breadcrumbs.json').all()).filter((entry) => {
    for (let i = 0; i < breadcrumbs.length && breadcrumbs[i] !== ''; i += 1) {
      const level = entry[`level_${i + 1}`];
      if (!level) {
        return true;
      }

      if (level !== breadcrumbs[i]) {
        return false;
      }
    }

    return true;
  });
  const breadcrumbsPathByLength = filteredBreadcrumbs
    .map((entry) => {
      // count how many entries prefixed with level_ have a value !== ''
      const { length } = Object.keys(entry).filter((key) => key.startsWith('level_') && entry[key] !== '');
      const { path } = entry;

      return { length, path };
    })
    .reduce((acc, { length, path }) => {
      const position = length - 1;
      if (acc.length >= position) {
        // resize acc to be able to add the new entry
        acc.length = position + 1;
      }

      acc[position] = path;

      return acc;
    }, []);

  const urlSegments = window.location.pathname.split('/')
    .slice(2);

  const language = getMetadata('og:locale');
  window.gnav_jsonPath = `https://www.esri.com/content/experience-fragments/esri-sites/${language}/site-settings/global-navigation-config/2022-nav-config.25.json`;
  const urlPrefix = `/${language}`;
  let accUrl = '';
  const accBreadcrumbs = [];

  let lastBreadcrumbsDictionaryElement;
  const breadcrumbsSchema = breadcrumbs.map((breadcrumb, index) => {
    accUrl += `/${urlSegments[index]}`;
    accBreadcrumbs.push(breadcrumb);

    const breadcrumbsDictionaryElement = breadcrumbsPathByLength[index];

    let breadcrumbsSchemaUrl = accUrl;
    if (breadcrumbsDictionaryElement) {
      lastBreadcrumbsDictionaryElement = breadcrumbsDictionaryElement;
      breadcrumbsSchemaUrl = breadcrumbsDictionaryElement;
    } else if (lastBreadcrumbsDictionaryElement) {
      breadcrumbsSchemaUrl = lastBreadcrumbsDictionaryElement;
    }
    const position = index + 1;
    return {
      '@type': 'ListItem',
      position,
      name: breadcrumb,
      item: urlPrefix + breadcrumbsSchemaUrl,
    };
  });

  document.head.appendChild(script(
    {
      type: 'application/ld+json',
      id: 'breadcrumbs',
    },
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbsSchema,
    }),
  ));
}

function createSchema() {
  const schema = {
    '@context': 'http://schema.org',
    '@type': 'WebPage',
    name: document.title,
    sourceOrganization: {
      '@type': 'Organization',
      name: 'Esri',
    },
    url: document.querySelector('link[rel="canonical"]').href,
    image: getMetadata('og:image'),
    inLanguage: {
      '@type': 'Language',
      name: getMetadata('og:locale'),
    },
    description: document.querySelector('meta[name="description"]').content,
  };

  const jsonElement = document.createElement('script');
  jsonElement.type = 'application/ld+json';
  jsonElement.classList.add('schema-graph');

  jsonElement.innerHTML = JSON.stringify(schema);
  document.head.appendChild(jsonElement);
}

/**
 * Loads and decorates the header, mainly the navigation.
 *
 * This function performs the following steps:
 * 1. Creates the schema for the webpage.
 * 2. Creates breadcrumbs for the webpage.
 * 3. Sets the locale and text direction based on metadata.
 * 4. Alternates headers based on the current page URL.
 * 5. Loads the global navigation script and CSS.
 *
 * @param {Element} block The header block element
 * @returns {Promise<void>} A promise that resolves when the header is fully decorated.
 */
export default async function decorate() {
  createSchema();
  await createBreadcrumbs();
  setLocaleAndDirection();
  await alternateHeaders()
    .then(async () => {
      await Promise.all([
        loadScript('https://webapps-cdn.esri.com/CDN/components/global-nav/js/gn.js'),
        loadCSS('https://webapps-cdn.esri.com/CDN/components/global-nav/css/gn.css'),
      ]);
    });
}
