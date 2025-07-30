import { loadFragment } from '../fragment/fragment.js';
import { div, calciteButton } from '../../scripts/dom-helpers.js';

function decorateBlockSectionMode(block) {
  block.closest('.section')
    .classList
    .add('calcite-mode-dark', 'dark');
}

export default async function decorate(block) {
  decorateBlockSectionMode(block);

  if (block.classList.contains('fragment')) {
    const link = block.querySelector('a');
    const fragment = await loadFragment(link.getAttribute('href'));
    fragment.querySelector('.section.local-navigation-container')?.remove();
    fragment.querySelectorAll('.section').forEach((section) => {
      section.classList.remove('section');
      if (section.classList.contains('local-navigation-container')) {
        section.remove();
      }
    });
    block.replaceChildren(div(...fragment.children));
  }

  block.querySelectorAll('.button-container a').forEach((anchorEl) => {
    const appearance = anchorEl.classList.contains('secondary') ? 'outline' : 'solid';
    anchorEl.parentElement.replaceWith(calciteButton({
      appearance,
      href: anchorEl.href,
      label: anchorEl.textContent,
    }, anchorEl.textContent));
  });
}
