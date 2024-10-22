import { decorateIcons } from '../../scripts/aem.js';
import { span, ul, li } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  const list = ul(...[...block.children].map((row) => li(...[...row.children].map((divElement) => {
    if (
      divElement.children.length === 1
      && divElement.querySelector('picture')
    ) {
      divElement.className = 'quote-block-image';
    } else divElement.className = 'quote-block-body';

    return divElement;
  }))));

  block.textContent = '';
  block.append(list);

  const body = block.querySelector('.quote-block-body');

  const quoteIcon = span({ class: 'icon icon-quote' });
  body.prepend(quoteIcon);

  decorateIcons(block);
}
