import { ul, li } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  block.classList.add('esri-text');
  const list = ul(...[...block.children].map((row) => li(...[...row.children].map((divElement) => {
    if (
      divElement.children.length === 1
      && divElement.querySelector('picture')
    ) {
      divElement.className = 'esritext-image';
    } else divElement.className = 'esritext-body';

    return divElement;
  }))));

  block.textContent = '';
  block.append(list);
}
