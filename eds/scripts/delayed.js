// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

/**
 * Loads analytic attributes to all links inside a block.
 * @param {Element} doc The container element
 */
function loadAnalytics(dataLayer) {
  document.querySelectorAll('.block').forEach((block) => {
    block.querySelectorAll('[href]').forEach((link) => {
      if ((link.tagName === 'A') || (link.tagName === 'CALCITE-BUTTON')) {
        link.setAttribute('data-event', 'track-component');
        link.setAttribute('data-component-name', block.getAttribute('data-block-name'));
        link.setAttribute('data-component-link-type', 'link');
        if (/^[a-zA-Z ]+$/.test(link.innerHTML)) {
          link.setAttribute('data-component-link', link.innerHTML);
        }
      }
    });
  });

  if (typeof dataLayer !== 'undefined') {
    document.querySelectorAll('.block').forEach((block) => {
      block.querySelectorAll('[href]').forEach((link) => {
        if ((link.tagName === 'A') || (link.tagName === 'CALCITE-BUTTON')) {
          link.addEventListener('click', () => {
            dataLayer.push({
              event: 'onClick',
              component: {
                tagName: link.tagName.toLowerCase(),
                name: block.getAttribute('data-block-name'),
                url: link.href,
                linkType: link.getAttribute('data-component-link-type'),
                linkText: link.innerHTML,
              },
            });
          });
        }
      });
    });
  }
}

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

loadAnalytics(window.dataLayer);
