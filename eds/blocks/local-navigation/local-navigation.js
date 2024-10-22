import { domEl } from '../../scripts/dom-helpers.js';

/**
 * return url with current domain if different from the json data provide page origin
 * @param {string} url The page url
 */
function updateURL(url) {
  const ISLOCAL = /localhost/gm;
  const currDomain = ISLOCAL.test(window.location.href) ? 'http://localhost:3000' : '';
  return url.replace(/^https?:\/\/[^/]+/, currDomain);
}

/**
 * return the last folder in the url path
 * @param {string} href The current page url
 */
function currPg(href) {
  const cleanUrl = href.split(/[?#]/)[0];
  const parts = cleanUrl.split('/');
  const lastFolder = parts.filter((part) => part !== '').pop();
  return lastFolder;
}

/**
 * Create a new anchor tag for navigation title and append to the nav if json data provided
 * @param {Object, Element} value The navigation title and url, block The header block element
 */
function navigationTitle(value, block) {
  const updatedUrl = updateURL(value.titlelink);
  const navTitle = block.querySelector('.navigation-title');
  const aHref = domEl('a', { href: updatedUrl });
  aHref.innerHTML = `${value.title}`;
  navTitle.appendChild(aHref);
}

/**
 * Create a new list item for page title and append to the nav tag ul
 * @param {Object, Element} pgObj The page title and page url.
 */
function appendPageTitle(pgObj, block) {
  const updatedUrl = updateURL(pgObj.pageLink);
  const navTagUL = block.querySelector('ul');
  const li = domEl('li', { class: 'page-title', id: pgObj.pageTitle });
  const aHref = domEl('a', { href: updatedUrl });
  const currPageTitle = currPg(window.location.href);
  aHref.innerHTML = `${pgObj.pageTitle}`;
  aHref.setAttribute('aria-current', 'false');
  if (currPageTitle === pgObj.pageTitle.toLowerCase()) {
    aHref.setAttribute('aria-current', 'true');
  }
  li.appendChild(aHref);
  navTagUL.appendChild(li);
}

/**
 * For document authored paged title only 'function docAuthPageTitle()'.
 * Normalize url path, replace origin if different current origin.
 * @param {JSON, Element} xmlData The api returned xmlData page folder json schema.
 */
function parseXML(xmlData, block) {
  for (let i = 0; i < xmlData.length; i += 1) {
    Object.entries(xmlData[i]).forEach(([key, value]) => {
      if (key === 'main') {
        navigationTitle(value, block);
      }
      if (key === 'pageTitle') {
        appendPageTitle(xmlData[i], block);
      }
    });
  }
}

/**
 * For document authored paged title only 'function docAuthPageTitle()'.
 * Normalize url path, replace origin if different current origin.
 * @param {Element} block The header block element
 */
function normalizeUrlPath(urlPath) {
  const currentOrigin = window.location.origin;
  const originRegex = /^https?:\/\/([^\s/$.?#].[^\s]*)$/i;
  if (originRegex.test(urlPath)) {
    const url = new URL(urlPath);
    if (url.origin !== currentOrigin) {
      return url.href.replace(url.origin, currentOrigin);
    }
    return url.href;
  }
  return `${currentOrigin}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
}

/**
 * Create a new anchor tag for navigation title and append to the nav if authored via document
 * @param {Element} block The header block element
 */
function docAuthPageTitle(block) {
  const xmlPgTitle = block.querySelector('.navigation-title a');
  const navTitle = block.querySelector('.navigation-title');
  const urlDocPgUrl = block.querySelector('div a');
  const aHref = document.createElement('a');
  if (((xmlPgTitle.innerHTML).length === 0) && (urlDocPgUrl.href !== null)) {
    aHref.href = normalizeUrlPath(urlDocPgUrl.href);
    aHref.innerHTML = `${urlDocPgUrl.innerHTML}`;
    navTitle.appendChild(aHref);
  }
}

/**
 * set nav wrapper, mobile menu button, trial button, and aria attributes
 * @param {Element} block The header block element
 */
function initNavWrapper(block) {
  const htmlNavTag = document.createElement('nav');
  const navTitle = domEl('div', { class: 'navigation-title' });
  const ul = document.createElement('ul');
  const mobileButton = domEl('calcite-icon', {
    class: 'btn-mobile',
    scale: 'm',
    icon: 'caret-down',
    dir: 'ltr',
    'calcite-hydrated': '',
    'aria-hidden': 'true',
  });
  const btnWrapper = block.querySelector('div');
  const trialBtn = btnWrapper.lastElementChild;
  mobileButton.setAttribute('aria-label', 'menu');
  htmlNavTag.setAttribute('aria-label', 'main');
  htmlNavTag.setAttribute('aria-expanded', 'false');
  htmlNavTag.id = 'main';
  ul.classList.add('mobile-menu');
  ul.setAttribute('aria-labelledby', 'nav-title');
  ul.setAttribute('aria-expanded', 'false');
  htmlNavTag.appendChild(navTitle);
  htmlNavTag.appendChild(ul);
  htmlNavTag.appendChild(mobileButton);
  htmlNavTag.appendChild(trialBtn);
  block.appendChild(htmlNavTag);
}

/**
 * toggle caret-up or caret-down mobile menu caret icon and aria-expanded attribute
 * @param {Element} block The header block element
 */
function btnEventListener(block) {
  const mobileBtn = block.querySelector('calcite-icon.btn-mobile');
  const mobileMenu = block.querySelector('ul.mobile-menu');

  mobileBtn.addEventListener('click', () => {
    if (mobileBtn.getAttribute('icon') === 'caret-down') {
      mobileBtn.setAttribute('icon', 'caret-up');
      mobileMenu.setAttribute('aria-expanded', 'true');
    } else {
      mobileBtn.setAttribute('icon', 'caret-down');
      mobileMenu.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Fetch local navigation api data. If on localhost, use cors-anywhere proxy to bypass CORS policy
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const ISLOCAL = /localhost/gm;
  const PROXY = ISLOCAL.test(window.location.href) ? 'https://cors-anywhere.herokuapp.com/' : '';
  const NAVAPI = 'https://www.esri.com/bin/esri/localnavigation';
  const requestURL = `${PROXY}${NAVAPI}?path=/content/esri-sites${window.location.pathname}`;

  await fetch(requestURL)
    .then((response) => response.json())
    .then((data) => {
      initNavWrapper(block);
      parseXML(data, block);
      docAuthPageTitle(block);
      btnEventListener(block);
    })
    .catch((error) => error);
}
