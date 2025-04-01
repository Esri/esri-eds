import { div, button, domEl } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const anchorEl = block.querySelector('a');

  /* Add class names to div's in markup */
  const childDiv = block.querySelector('div');
  if (childDiv) {
    childDiv.classList.add('sidedrawer-content-wrapper');
  }
  const contentDiv = childDiv.querySelector('div');
  if (contentDiv) {
    contentDiv.classList.add('sidedrawer-content');
  }
  let btnText = contentDiv.querySelector('h3');
  if (!btnText) {
    btnText = contentDiv.querySelector('p');
  }
  if (btnText) {
    const buttonEl = button(
      { class: 'sidedrawer-button' },
      domEl('calcite-icon', { icon: 'plus', scale: 's', 'aria-hidden': 'true' }),
      btnText.textContent,
    );
    contentDiv.replaceChild(buttonEl, btnText);
  }
  const sidedrawerContent = document.querySelector('.sidedrawer-content');
  const buttonEl = document.querySelector('.sidedrawer-button');
  const contentFrame = div({ class: 'sidedrawer-contentframe' });
  contentFrame.classList.add('calcite-mode-dark');
  sidedrawerContent.appendChild(contentFrame);
  [...sidedrawerContent.querySelectorAll(':not(.sidedrawer-button, calcite-icon, .sidedrawer-contentframe)')].forEach((el) => {
    contentFrame.append(el);
  });
  if (anchorEl) {
    const iframeEl = domEl('iframe', {
      src: anchorEl.href,
      class: 'sidedrawer-iframe',
    });
    contentFrame.appendChild(iframeEl);
    anchorEl.remove();
  }
  sidedrawerContent.setAttribute('aria-expanded', false);
  buttonEl.addEventListener('click', () => {
    const isExpanded = sidedrawerContent.getAttribute('aria-expanded') === 'true';
    sidedrawerContent.setAttribute('aria-expanded', !isExpanded);
  });
}
