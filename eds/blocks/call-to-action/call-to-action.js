import {
  calciteButton,
  div,
  } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  let ctaItems = [...block.children].map((child) => [...child.children]);

  // get all cta contents
  let ctaContents = ctaItems.flatMap((ctaItem) => ctaItem);

  ctaContents.forEach((cta) => {
    // create array out of each cta item
    let ctaItem = [...cta.children];

    // get p.button-container and change p to div
    let buttonContainer = ctaItem.find((item) => item.tagName === 'P' && item.classList.contains('button-container'));
    if (buttonContainer) {
      let newDiv = div({ class: 'button-container' });
      while (buttonContainer.firstChild) {
      // if firstchild is <a> then construct calciteButton
      if (buttonContainer.firstChild.tagName === 'A') {
          newDiv.appendChild(calciteButton({
          appearance: 'solid',
          color: 'blue',
          kind: 'brand',
          scale: 'm',
          href: buttonContainer.firstChild.href,
          alignment: 'center',
          type: 'button',
          width: 'auto',
          }, buttonContainer.firstChild.textContent));
      } else if (buttonContainer.firstChild.tagName === 'EM') {
          newDiv.appendChild(calciteButton({ 
          appearance: 'outline',
          color: 'blue',
          kind: 'brand',
          scale: 'm',
          href: buttonContainer.firstChild.href,
          alignment: 'center',
          type: 'button',
          width: 'auto',
          }, buttonContainer.firstChild.textContent));
      }

    ctaItem.splice(ctaItem.indexOf(buttonContainer.firstChild), 1, buttonContainer.firstChild);
    buttonContainer.removeChild(buttonContainer.firstChild);
  }
      buttonContainer.replaceWith(newDiv);
    } 
  });
}
