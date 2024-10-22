import {
  div,
  h2,
  p,
  calciteButton,
} from '../../scripts/dom-helpers.js';

function getDOMElements(hText, pText, buttonText, buttonHref) {
  const heading = h2({ class: 'location-presence-heading' }, hText);
  const text = p({ class: 'location-presence-subtitle' }, pText);
  const findYourEsriOfficeButton = calciteButton({ class: 'location-presence-button', scale: 'l', href: buttonHref }, buttonText);
  const contentWrapper = div({ class: 'location-content-container' }, heading, text, findYourEsriOfficeButton);
  return contentWrapper;
}
export default function decorate(block) {
  const locationPresenceBlock = document.querySelector('.location-presence-wrapper > div > div > div');

  const [heading, text, button] = locationPresenceBlock.children;

  const elements = getDOMElements(
    heading.textContent,
    text.textContent,
    button.children[0].textContent,
    button.children[0].href,
  );

  locationPresenceBlock.innerHTML = '';
  block.classList.add('calcite-mode-dark');

  locationPresenceBlock.appendChild(elements);
}
