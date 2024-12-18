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
      const order = subNavItems.getAttribute('attr-order');
      const allSubNavBtn = document.querySelectorAll('.subnav-btn');
      subNavItems.setAttribute('aria-expanded', 'true');
      subNavItems.nextElementSibling.setAttribute('aria-hidden', 'false');
      allSubNavBtn.forEach((btn) => {
        if (btn.getAttribute('attr-order') !== order) {
          btn.setAttribute('aria-expanded', 'false');
          btn.nextElementSibling.setAttribute('aria-hidden', 'true');
        }
      });
    } else {
      subNavItems.setAttribute('aria-expanded', 'false');
      subNavItems.nextElementSibling.setAttribute('aria-hidden', 'true');
    }
  });

  document.addEventListener('click', (e) => {
    const isClickInside = subNavItems.contains(e.target);
    if (!isClickInside) {
      subNavItems.setAttribute('aria-expanded', 'false');
      subNavItems.nextElementSibling.setAttribute('aria-hidden', 'true');
    }
  });
}

/**
 * Create a new list item for page title and append to the nav tag ul
 * Create subnavItems if exist and append to the li
 * @param {Object, Element} pgObj The page title and page url.
 */
function appendPageTitle(pgObj, block, i, menuTitle) {
  const updatedUrl = updateURL(pgObj.pageLink);
  const navTagUL = block.querySelector('ul');
  const li = domEl('li', { class: 'page-title', id: pgObj.pageTitle });
  const aHref = domEl('a', { href: updatedUrl });
  const currPageTitle = currPg(window.location.href);

  aHref.innerHTML = `${pgObj.pageTitle}`;
  aHref.setAttribute('aria-current', 'false');

  if ((currPageTitle === pgObj.pageTitle.toLowerCase() || menuTitle === pgObj.pageTitle)) {
    aHref.setAttribute('aria-current', 'true');
  }

  /* if subnavItems exist, create a button for the subnav and append to the li */
  if (pgObj.subnavItems) {
    const subNavItems = domEl('button', {
      class: 'subnav-btn',
      'aria-expanded': 'false',
      'aria-controls': 'subnav',
      'aria-current': 'false',
      'attr-order': i,
    });
    const subNav = domEl('div', { class: 'subnav', id: 'subnav', 'aria-hidden': 'true' });
    const subNavUL = domEl('ul', { class: 'subnav-ul' });
    li.appendChild(subNavItems);
    subNavItems.innerHTML = pgObj.pageTitle;
    listenSubNav(subNavItems);

    pgObj.subnavItems.forEach((item) => {
      const subNavLI = domEl('li', { class: 'subnav-li' });
      const subNavA = domEl('a', { href: updateURL(item.pageLink) });
      subNavA.innerHTML = `${item.pageTitle}`;
      subNavLI.appendChild(subNavA);
      subNavUL.appendChild(subNavLI);
      if (currPageTitle === item.pageTitle.toLowerCase() || menuTitle === item.pageTitle) {
        subNavItems.setAttribute('aria-current', 'true');
      }
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
 * Create CTA button for trial or register and append to the nav tag ul
 * @param {Object} xmlData.
 */
function decorateBlueButton(value, block) {
  setTimeout(() => {
    let href;
    if (value.triallink.startsWith('#')) {
      href = `${window.location.pathname}#trial`;
    } else if (value.triallink.startsWith('/')) {
      href = `${window.location.origin}${value.triallink}`;
    } else if (value.triallink.startsWith('https://') || value.triallink.startsWith('http://')) {
      href = value.triallink;
    }
    if (href) {
      const trialBtn = domEl('calcite-button', { class: 'trial-button', href });
      trialBtn.innerHTML = value.triallabel;
      block.querySelector('nav > ul').appendChild(trialBtn);
    }
  }, 50);
}

/**
 * For document authored paged title only 'function docAuthPageTitle()'.
 * Normalize url path, replace origin if different current origin.
 * @param {JSON, Element} xmlData The api returned xmlData page folder json schema.
 */
function parseXML(xmlData, block, menuTitle) {
  for (let i = 0; i < xmlData.length; i += 1) {
    Object.entries(xmlData[i]).forEach(([key, value]) => {
      if (key === 'main') {
        navigationTitle(value, block);
      }
      if (key === 'pageTitle') {
        appendPageTitle(xmlData[i], block, i, menuTitle);
      }
      if (value.triallabel) {
        decorateBlueButton(value, block);
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
  htmlNavTag.setAttribute('class', 'calcite-mode-light');
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
function ctaEventListener(block) {
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
    if (window.innerWidth > 768) {
      mobileBtn.setAttribute('icon', 'caret-down');
      mobileMenu.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Read the id='breadcrumbs' script tag and append to the header block
 * @param {Element} block The header block element
 */
function getBreadcrumb() {
  const scriptTag = document.querySelector('script#breadcrumbs');
  if (!scriptTag) {
    return null;
  } 
  const jsonData = JSON.parse(scriptTag.textContent || scriptTag.innerText);
  const lastItem = jsonData.itemListElement.slice(-1)[0];
  return lastItem;
}

function fetchNavData(block) {
  const ISLOCAL = /localhost/gm;
  const PROXY = ISLOCAL.test(window.location.href) ? 'https://cors-anywhere.herokuapp.com/' : '';
  const NAVAPI = 'https://www.esri.com/bin/esri/localnavigation';
  const pathURL = getBreadcrumb() || window.location.pathname;
  const requestURL = `${PROXY}${NAVAPI}?path=/content/esri-sites${pathURL.item}`;
  const breadcrumbs = getBreadcrumb();

  const menuTitle = breadcrumbs.name;
  fetch(requestURL)
    .then((response) => response.json())
    .then((jsonData) => {
      initNavWrapper(block);
      parseXML(jsonData, block, menuTitle);
      docAuthPageTitle(block);
      ctaEventListener(block);
      resetDropdown(block);
    })
    .catch((error) => error);
}

/**
 * Fetch local navigation api data. If on localhost, use cors-anywhere proxy to bypass CORS policy
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  if (!getBreadcrumb()) {
    let count = 0;
    const interval = setInterval(() => {
      if (getBreadcrumb()) {
        clearInterval(interval);
        fetchNavData(block);
      }
      count += 1;
      if (count === 20) {
        clearInterval(interval);
      }
    }, 500);
  } else {
    fetchNavData(block);
  }
}
