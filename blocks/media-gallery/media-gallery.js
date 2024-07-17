import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
    /* change to ul, li */
    const ul = document.createElement('ul');
    [...block.children].forEach((row) => {
        const li = document.createElement('li');
        while (row.firstElementChild) li.append(row.firstElementChild);
        [...li.children].forEach((div) => {
            if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
            else div.className = 'cards-card-body';
        });
        ul.append(li);
    });
    ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
    block.textContent = '';
    block.append(ul);

    const cards = block.querySelectorAll('.cards-card-body');
    for(let idx = 0; idx < cards.length; ++idx) {
        const card = cards[idx];
        card.querySelectorAll('br').forEach((br) => br.remove());

        // wrap card in anchor tag
        const anchor = card.querySelector('a');
        if(anchor) {
            anchor.textContent = '';
            const cardParent = card.parentElement;
            const anchorParent = anchor.parentElement;
            anchorParent.removeChild(anchor);
            cardParent.appendChild(anchor);

            cardParent.removeChild(card);
            anchor.appendChild(card);
            console.log(anchor.href)
        }

        card.parentElement.parentElement.classList.add(`grid-item-${idx}`)

        // modify card structure to have a card-content div
        const cardContent = document.createElement('div');
        cardContent.classList.add('card-content');

        const isVideo = anchor.href.startsWith('https://mediaspace.esri.com/');
        if(isVideo) {
            const startButton = document.createElement('calcite-button');
            startButton.setAttribute('appearance', 'solid');
            startButton.setAttribute('kind', 'inverse');
            startButton.setAttribute('color', 'light');
            startButton.setAttribute('scale', 'l');
            startButton.setAttribute('round', '');
            startButton.setAttribute('icon-start', 'play-f');
            startButton.setAttribute('dir', 'ltr');
            startButton.setAttribute('alignment', 'center');
            startButton.setAttribute('width', 'auto');
            startButton.setAttribute('label', 'play video');
            startButton.setAttribute('type', 'button');
            startButton.setAttribute('calcite-hydrated', '');
            startButton.classList.add('start-button');
            cardContent.appendChild(startButton);
        }
        
        const cardTitle = card.children[0];
        const cardDescription = card.children[1];

        cardTitle.classList.add('card-title');
        cardDescription.classList.add('card-description');

        cardContent.appendChild(cardTitle);
        cardContent.appendChild(cardDescription);

        card.appendChild(cardContent);
    }
}
