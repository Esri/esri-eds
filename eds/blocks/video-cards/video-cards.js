import { createOptimizedPicture } from '../../scripts/aem.js';
import { p, button, domEl } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  block.querySelectorAll('img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  [...block.children].forEach((child) => {
    child.replaceChildren(...child.children[0].children);
  });

  block.querySelectorAll('ul').forEach((ul) => {
    ul.children[1].replaceChildren(p({ class: 'video-card-title' }, ul.children[1].textContent));
    ul.children[2].replaceChildren(p({ class: 'video-card-description' }, ul.children[2].textContent));
  });

  const startButton = button(domEl('calcite-icon', {
    icon: 'play-f',
    scale: 's',
  }));

  [...block.children].forEach((child) => {
    child.children[0].append(startButton.cloneNode(true));
  });

  [...block.children].forEach((child) => {
    // wrap card in anchor tag
    const anchor = child.querySelector('a');

    if (anchor) {
      anchor.parentElement.parentElement.removeChild(anchor.parentElement);
      anchor.textContent = '';
      anchor.appendChild(child);
      block.appendChild(anchor);
    }
  });
}
