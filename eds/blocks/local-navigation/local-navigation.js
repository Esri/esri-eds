import { domEl } from '../../scripts/dom-helpers.js';

/**
 * return url with current domain if different from the json data provide page origin
 * @param {string} url The page url
 */
function updateURL(url) {
  const ISLOCAL = /localhost/gm;
  const currDomain = ISLOCAL.test(window.location.href) ? window.location.origin : '';
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

function listenSubNav(subNavItems) {
  subNavItems.addEventListener('click', () => {    
    if (subNavItems.getAttribute('aria-expanded') === 'false') {
      let order = subNavItems.getAttribute('attr-order');
      subNavItems.setAttribute('aria-expanded', 'true');
      subNavItems.nextElementSibling.setAttribute('aria-hidden', 'false');
      let allSubNavBtn = document.querySelectorAll('.subnav-btn');
      allSubNavBtn.forEach((btn) => {
        if (btn.getAttribute('attr-order') !== order) {
          btn.setAttribute('aria-expanded', 'false');
          btn.nextElementSibling.setAttribute('aria-hidden', 'true');
        }
      });
    } else {
      subNavItems.setAttribute('aria-expanded', 'false');
      subNavItems.nextElementSibling.setAttribute('aria-hidden', 'true');
      console.log('collapsed subnavItems', subNavItems);
    }
  });
}

/**
 * Create a new list item for page title and append to the nav tag ul
 * @param {Object, Element} pgObj The page title and page url.
 */
function appendPageTitle(pgObj, block, i) {
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
  if (pgObj.subnavItems) {
    let subNavItems = domEl('button', { class: 'subnav-btn', 'aria-expanded': 'false', 'aria-controls': 'subnav', 'attr-order': i });
    let subNav = domEl('div', { class: 'subnav', id: 'subnav', 'aria-hidden': 'true' });
    let subNavUL = domEl('ul', { class: 'subnav-ul' });
    li.appendChild(subNavItems);
    subNavItems.innerHTML = pgObj.pageTitle;
    listenSubNav(subNavItems);

    pgObj.subnavItems.forEach((item) => {
      const subNavLI = domEl('li', { class: 'subnav-li' });
      const subNavA = domEl('a', { href: updateURL(item.pageLink) });
      subNavA.innerHTML = `${item.pageTitle}`;
      subNavLI.appendChild(subNavA);
      subNavUL.appendChild(subNavLI);
    });
    subNav.appendChild(subNavUL);
    li.appendChild(subNav);
    navTagUL.appendChild(li);
  } else {
    li.appendChild(aHref);
    navTagUL.appendChild(li);
  }
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
        appendPageTitle(xmlData[i], block, i);
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
  htmlNavTag.setAttribute('class', 'calcite-mode-dark');
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
 * reset dropdown menu on resize
 * @param {Element} block The header block element
 */
function resetDropdown(block) {
  const mobileBtn = block.querySelector('calcite-icon.btn-mobile');
  const mobileMenu = block.querySelector('ul.mobile-menu');
  window.addEventListener('resize', () => {
    mobileBtn.setAttribute('icon', 'caret-down');
    mobileMenu.setAttribute('aria-expanded', 'false');
  }, 500)

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
      console.log('local navigation data');
      initNavWrapper(block);
      parseXML(data, block);
      docAuthPageTitle(block);
      btnEventListener(block);
      resetDropdown(block);
    })
    .catch((error) => error);
}
