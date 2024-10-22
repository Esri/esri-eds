import { div, button, domEl } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  /* Add class names to div's in markup */
  const childDiv = block.querySelector('div');
  if (childDiv) {
    childDiv.classList.add('sidedrawer-content-wrapper');
  }
  const contentDiv = childDiv.querySelector('div');
  if (contentDiv) {
    contentDiv.classList.add('sidedrawer-content');
  }
  const h3Element = contentDiv.querySelector('h3');
  if (h3Element) {
    const buttonEl = button(
      { class: 'sidedrawer-button' },
      h3Element.textContent,
      domEl('calcite-icon', { icon: 'plus', scale: 's', 'aria-hidden': 'true' }),
    );
    contentDiv.replaceChild(buttonEl, h3Element);
  }
  const sidedrawerContent = document.querySelector('.sidedrawer-content');
  const buttonEl = document.querySelector('.sidedrawer-button');
  const contentFrame = div({ class: 'sidedrawer-contentframe' });
  contentFrame.classList.add('calcite-mode-dark');
  sidedrawerContent.appendChild(contentFrame);
  [...sidedrawerContent.querySelectorAll(':not(.sidedrawer-button, calcite-icon, .sidedrawer-contentframe)')].forEach((el) => {
    contentFrame.append(el);
  });
  sidedrawerContent.setAttribute('aria-expanded', false);
  buttonEl.addEventListener('click', () => {
    const isExpanded = sidedrawerContent.getAttribute('aria-expanded') === 'true';
    sidedrawerContent.setAttribute('aria-expanded', !isExpanded);
  });
}
