import { loadCSS, loadScript } from '../../scripts/aem.js';

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Global nav
  const json = document.createElement('script');
  json.appendChild(document.createTextNode('window.gnav_jsonPath = 20220-nav-config.25.json'));
  block.appendChild(json);
}

loadScript('https://webapps-cdn.esri.com/CDN/components/global-nav/js/gn.js');
loadCSS('https://webapps-cdn.esri.com/CDN/components/global-nav/css/gn.css');
