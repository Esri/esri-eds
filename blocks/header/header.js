import { loadCSS, loadScript } from '../../scripts/aem.js';

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate() {
  window.gnav_jsonPath = '2022-nav-config.25.json';
  loadScript('https://webapps-cdn.esri.com/CDN/components/global-nav/js/gn.js');
  loadCSS('https://webapps-cdn.esri.com/CDN/components/global-nav/css/gn.css');
}
