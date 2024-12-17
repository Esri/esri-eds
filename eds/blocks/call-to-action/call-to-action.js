import { loadFragment } from '../fragment/fragment.js';
import { div } from '../../scripts/dom-helpers.js';

function decorateBlockSectionMode(block) {
  block.classList.forEach((className) => {
    if (className.startsWith('calcite-mode-')) {
      const mode = className.split('-')[2];
      block.closest('.section')
        .classList
        .add(className, mode);
    }
  });
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
}
