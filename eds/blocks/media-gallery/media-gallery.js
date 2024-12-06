import { createOptimizedPicture } from '../../scripts/aem.js';
import { domEl, div } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((divElement) => {
      if (
        divElement.children.length === 1
        && divElement.querySelector('picture')
      ) {
        divElement.className = 'cards-card-image';
      } else divElement.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img
    .closest('picture')
    .replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    ));
  block.textContent = '';
  block.append(ul);

  const cards = block.querySelectorAll('.cards-card-body');
  for (let idx = 0; idx < cards.length; idx += 1) {
    const card = cards[idx];
    card.querySelectorAll('br').forEach((br) => br.remove());

    // wrap card in anchor tag
    const anchor = card.querySelector('a');
    if (anchor) {
      anchor.textContent = '';
      const cardParent = card.parentElement;
      const anchorParent = anchor.parentElement;
      anchorParent.removeChild(anchor);
      cardParent.appendChild(anchor);

      cardParent.removeChild(card);
      anchor.appendChild(card);
    }

    card.parentElement.parentElement.classList.add(`grid-item-${idx}`);

    // modify card structure to have a card-content div
    const cardContent = div({ class: 'card-content' });

    const isVideo = anchor.href.startsWith('https://mediaspace.esri.com/');
    if (isVideo) {
      const startButton = domEl('calcite-button', {
        appearance: 'solid',
        kind: 'inverse',
        color: 'light',
        scale: 'l',
        round: '',
        'icon-start': 'play-f',
        dir: 'ltr',
        alignment: 'center',
        width: 'auto',
        label: 'play video',
        type: 'button',
        'calcite-hydrated': '',
        class: 'start-button',
      });
      cardContent.appendChild(startButton);
    }

    // Check if there is a category
    let cardCategory, cardTitle, cardDescription;
    if (card.children.length === 5) {
      cardCategory = card.children[0];
      cardTitle = card.children[1];
      cardDescription = card.children[2];
    } else {
      cardTitle = card.children[0];
      cardDescription = card.children[1];
    }

    [cardCategory, cardTitle, cardDescription].forEach((el, index) => {
      if (el) {
        el.classList.add(['card-category', 'card-title', 'card-description'][index]);
        cardContent.appendChild(el);
      }
    });

    card.appendChild(cardContent);
  }
}
