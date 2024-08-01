import { div, a } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  document.querySelector('.tabs-cards-wrapper').classList.add('calcite-mode-light');
  block.querySelectorAll('img').forEach((img) => img
    .closest('picture')?.replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    ));

  const esriEventCards = [...block.children[0].children[1].children];
  const esriEventCardsWrapper = block.children[0].children[1];

  for (let i = 0; i < esriEventCards.length; i += 6) {
    esriEventCards[i].parentElement.removeChild(esriEventCards[i]);
    esriEventCards[i + 1].appendChild(esriEventCards[i + 2]);
    const esriEventCard = div(
      { class: 'esri-event-card' },
      a(
        { href: esriEventCards[i].querySelector('a').href },
        esriEventCards[i + 1],
        div(
          { class: 'text-wrapper' },
          ...esriEventCards.slice(i + 3, i + 6),
        ),
      ),
    );
    esriEventCardsWrapper.append(esriEventCard);
  }

  const otherEventCards = [...block.children[1].children[1].children];
  const otherEventCardsWrapper = block.children[1].children[1];

  for (let i = 0; i < otherEventCards.length; i += 6) {
    otherEventCards[i].parentElement.removeChild(otherEventCards[i]);
    otherEventCards[i + 1].appendChild(otherEventCards[i + 2]);
    const otherEventCard = div(
      { class: 'other-event-card' },
      a(
        { href: otherEventCards[i].querySelector('a').href },
        otherEventCards[i + 1],
        div(
          { class: 'text-wrapper' },
          ...otherEventCards.slice(i + 3, i + 6),
        ),
      ),
    );
    otherEventCardsWrapper.append(otherEventCard);
  }
}
