import {
    calciteButton,
    div,
  } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
    let ctaItems = [...block.children].map((child) => [...child.children]);

    // get all cta contents
    let ctaContents = ctaItems.flatMap((ctaItem) => ctaItem);
    console.log(ctaContents[0]);
    console.log(ctaContents[1]);

    ctaContents.forEach((cta) => {
        // create array out of each cta item
        let ctaItem = [...cta.children];
        console.log(ctaItem);

        // get p.button-container and change p to div
        let buttonContainer = ctaItem.find((item) => item.tagName === 'P' && item.classList.contains('button-container'));
        if (buttonContainer) {
            let newDiv = div({ class: 'button-container' });
            while (buttonContainer.firstChild) {
                // if firstchild is <a> then construct calciteButton
                
                newDiv.appendChild(buttonContainer.firstChild);
            }
            buttonContainer.replaceWith(newDiv);
            buttonContainer = newDiv;
        }
        
        console.log(buttonContainer);
    });

}
