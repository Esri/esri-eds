import {
  calciteButton,
  div,
} from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  block.querySelectorAll('p.button-container').forEach((buttonContainer) => {
    console.log('buttonContainer', buttonContainer);
    const newDiv = div({ class: 'button-container' });
    while (buttonContainer.firstChild) {
      console.log('buttonContainer.firstChild', buttonContainer.firstChild);
    // if firstchild is <a> then construct calciteButton
      if (buttonContainer.firstChild.tagName === 'A') {
        console.log('buttonContainer.firstChild.tagName', buttonContainer.firstChild.tagName);
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
      buttonContainer.removeChild(buttonContainer.firstChild);
    }
    buttonContainer.replaceWith(newDiv);
  });
}
