import { div, a } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  block.classList.add('calcite-mode-light');
  block.querySelectorAll('img').forEach((img) => img
    .closest('picture')?.replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    ));

  const eventCardsWrapper = [...block.children].map(((child) => child.children[0]));
  const eventCards = eventCardsWrapper.map((wrapper) => [...wrapper.children]);

  for (let i = 0; i < eventCards.length; i += 1) {
    const currentCard = eventCards[i];
    for (let j = 0; j < eventCards[i].length; j += 6) {
      currentCard[j].parentElement.removeChild(currentCard[j]);
      currentCard[j + 1].appendChild(currentCard[j + 2]);
      const eventCard = div(
        { class: 'event-card calcite-animate calcite-animate__in-up' },
        a(
          { href: currentCard[j].querySelector('a').href },
          currentCard[j + 1],
          div(
            { class: 'event-text-wrapper' },
            ...currentCard.slice(j + 3, j + 6),
          ),
        ),
      );
      eventCardsWrapper[i].append(eventCard);
    }
  }
}
