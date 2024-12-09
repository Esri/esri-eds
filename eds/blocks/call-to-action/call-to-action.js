import { loadFragment } from '../fragment/fragment.js';

function decorateBlockSectionMode(block) {
  block.classList.forEach((className) => {
    if (className.startsWith('calcite-mode-')) {
      block.closest('.section')
        .classList
        .add(className);
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
    block.replaceChildren(...fragment.children);
  }
}
