import { domEl } from '../../scripts/dom-helpers.js';

function updateURL(url) {
  const ISLOCAL = /localhost/gm;
  const currDomain = ISLOCAL.test(window.location.href) ? 'http://localhost:3000' : '';
  return url.replace(/^https?:\/\/[^/]+/, currDomain);
}

function appendNode(value) {
  const updatedUrl = updateURL(value.titlelink);
  const navTitle = document.querySelector('.local-navigation .nav-title');
  const aHref = domEl('a', { href: updatedUrl });
  aHref.innerHTML = `${value.title}`;
  aHref.setAttribute('aria-current', 'false');
  navTitle.appendChild(aHref);
}

function currPg(href) {
  const cleanUrl = href.split(/[?#]/)[0];
  const parts = cleanUrl.split('/');
  const lastFolder = parts.filter((part) => part !== '').pop();
  return lastFolder;
}

function appendPageTitle(pgObj) {
  const updatedUrl = updateURL(pgObj.pageLink);
  const navTagUL = document.querySelector('.local-navigation ul');
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

function parseXML(xmlData) {
  for (let i = 0; i < xmlData.length; i += 1) {
    Object.entries(xmlData[i]).forEach(([key, value]) => {
      if (key === 'main') {
        appendNode(value);
      }
      if (key === 'pageTitle') {
        appendPageTitle(xmlData[i]);
      }
    });
  }
}

function initNavWrapper(block) {
  const htmlNavTag = document.createElement('nav');
  const navTitle = domEl('div', { class: 'nav-title' });
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

export default async function decorate(block) {
  const ISLOCAL = /localhost/gm;
  const PROXY = ISLOCAL.test(window.location.href) ? 'https://cors-anywhere.herokuapp.com/' : '';
  const NAVAPI = 'https://www.esri.com/bin/esri/localnavigation';
  const requestURL = `${PROXY}${NAVAPI}?path=/content/esri-sites${window.location.pathname}`;

  await fetch(requestURL)
    .then((response) => response.json())
    .then((data) => {
      initNavWrapper(block);
      parseXML(data);
      btnEventListener(block);
    })
    .catch((error) => error);
}
