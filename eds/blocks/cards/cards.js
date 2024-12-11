import { createOptimizedPicture } from '../../scripts/aem.js';
import { div, domEl } from '../../scripts/dom-helpers.js';

function processSimpleCard(listElem) {
  console.log('list elem', listElem, listElem.outerHTML);
  const anchorEl = listElem.querySelector('a');
  const cardBodyContent = div(
    { class: 'card-body-content' },
    ...listElem.querySelectorAll('.cards-card-body > :not(.card-body-content, a)'),
  );
  if (anchorEl) {
    anchorEl.replaceChildren(cardBodyContent);
    listElem.replaceChildren = anchorEl;
  } else {
    listElem.append(cardBodyContent);
  }
}

function processStandardCard(div) {
  const anchorEl = div.querySelector('a');
  const cardBodyContent = domEl('div', { class: 'card-body-content' });
  if (anchorEl) {
    anchorEl.replaceChildren(cardBodyContent);
    div.append(anchorEl);
  } else {
    div.append(cardBodyContent);
  }
  div.querySelectorAll('p')
    .forEach((p) => {
      if (p.textContent === '') p.remove();
    });
  [...div.querySelectorAll('.cards-card-body > :not(.card-body-content, a)')].forEach((el) => {
    cardBodyContent.append(el);
    if (el.tagName === 'P' && el.children.length === 0 && el.parentNode.firstElementChild === el) {
      el.classList.add('overlay-text');
    }
  });
  const pictureEl = div.querySelector('picture')
    .closest('p');
  const overlayTextEl = div.querySelector('.overlay-text');
  if (overlayTextEl) pictureEl.append(overlayTextEl);
  pictureEl.nextElementSibling.classList.add('card-body-title');
  const cardBodyTitle = div.querySelector('.card-body-title');

  if (cardBodyContent.lastChild.classList === '') cardBodyContent.lastChild.classList.add('card-body-description');

  if (cardBodyTitle.nextElementSibling && !cardBodyTitle.nextElementSibling.classList.contains('card-body-description')) {
    cardBodyTitle.nextElementSibling.classList.add('card-body-subtitle');
  }
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    if (block.classList.contains('simple')) processSimpleCard(li);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else { div.className = 'cards-card-body'; }
      if (block.classList.contains('standard')) processStandardCard(div);
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture')?.replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
}
