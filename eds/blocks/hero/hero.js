import { createAutoplayedVideo } from '../../scripts/scripts.js';
import { calciteButton } from '../../scripts/dom-helpers.js';
import decorateModal from '../../scripts/delayed.js';

export default function decorate(block) {
  const newChildren = [...block.children]
    // filter out empty children
    .filter((entry) => {
      const entryContent = entry.lastElementChild;
      return entryContent.innerHTML !== '' && entryContent.innerHTML !== 'null';
    })
    // then map the children to add a class
    .map((entry) => {
      const entryKey = entry.firstElementChild.textContent.toLowerCase();

      const entryContent = entry.lastElementChild;
      entryContent.classList.add(entryKey);

      return entryContent;
    });
  block.replaceChildren(...newChildren);

  const imgCollection = block.querySelectorAll('picture > img');
  const heroContainer = document.querySelector('main > .hero-container');
  if (heroContainer && (heroContainer === heroContainer.parentElement.children[0]
    || heroContainer === heroContainer.parentElement.children[1])) {
    imgCollection.forEach((img) => {
      img.setAttribute('loading', 'eager');
      img.setAttribute('fetchpriority', 'high');
    });
  } else {
    imgCollection.forEach((img) => {
      img.setAttribute('loading', 'lazy');
    });
  }

  // look for div.backgroundimage and remove it no images
  const backgroundImage = block.querySelector('div.backgroundimage');
  if (backgroundImage && backgroundImage.innerHTML === '<p>null</p>') {
    backgroundImage.remove();
  }

  const blockTitle = block.querySelector('h1');
  const blockParagraphs = blockTitle.parentElement.querySelectorAll('p');
  if (blockParagraphs.length > 1) {
    if (blockParagraphs[0].innerHTML && blockParagraphs[1].innerHTML) {
      if (!blockParagraphs[0].classList.contains('button-container') && !blockParagraphs[1].classList.contains('button-container')) {
        blockParagraphs[1].classList.add('description');
      }
    }
  }

  const videoAssets = block.querySelectorAll('a');
  if (videoAssets.length > 0) {
    const videoAsset = videoAssets[videoAssets.length - 1];

    const src = videoAsset.getAttribute('title');
    const videoElement = createAutoplayedVideo(src, '');
    const foregroundDiv = document.createElement('div');
    foregroundDiv.classList.add('foregrounddiv');
    foregroundDiv.appendChild(videoElement);

    videoAsset.classList.add('hidden');

    const heroImage = block.querySelector('.image');
    if(!heroImage){
      block.append(foregroundDiv);
    }else {
      block.append(videoElement);
    }
  }

  const videoLink = block.querySelector('.video-link');
  if (videoLink) {
    const btnContainer = videoLink.closest('.button-container');
    if (btnContainer) {
      btnContainer.replaceWith(calciteButton({
        'icon-end': 'play-f',
        appearance: 'solid',
        href: videoLink.href,
        label: videoLink.textContent,
      }, videoLink.textContent));
    }

    const calciteBtn = block.querySelector('calcite-button');
    if (calciteBtn) {
      calciteBtn.addEventListener('click', (evt) => {
        evt.preventDefault();
        calciteBtn.setAttribute('tabindex', '0');
        decorateModal(videoLink.href, calciteBtn);
      });
    }
  }
}
