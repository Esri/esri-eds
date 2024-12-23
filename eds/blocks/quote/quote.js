import { decorateIcons } from '../../scripts/scripts.js';
import { span, article, div } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  // eslint-disable-next-line max-len
  const list = article(...[...block.children].map((row) => div(...[...row.children].map((divElement) => {
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

  const quoteIcon = span({ class: 'icon icon-quote-filled-48' });
  body.prepend(quoteIcon);

  decorateIcons(block);
}
