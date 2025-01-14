import { createAutoplayedVideo } from '../../scripts/scripts.js';

export default function decorate(block) {
  const newChildren = [...block.children].map((entry) => {
    const entryKey = entry.firstElementChild.textContent.toLowerCase();

    const entryContent = entry.lastElementChild;
    entryContent.classList.add(entryKey);

    return entryContent;
  });
  block.replaceChildren(...newChildren);

  const imgCollection = block.querySelectorAll('picture > img');
  const heroContainer = document.querySelector('main > .hero-container');
  if (heroContainer && (heroContainer === heroContainer.parentElement.children[0] || heroContainer === heroContainer.parentElement.children[1])) {
    imgCollection.forEach((img) => {
      img.setAttribute('loading', 'eager');
      img.setAttribute('fetchpriority', 'high');
      // console.log the images href
      console.log(img.src);
      // preload the images
      const preloadLink = document.createElement('link');
      preloadLink.href = img.src;
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      document.querySelector('.hero-container').insertBefore(preloadLink, document.querySelector('.hero-container').firstChild);
    });
  } else {
    imgCollection.forEach((img) => {
      img.setAttribute('loading', 'eager');
    });
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

    videoAsset.classList.add('hidden');

    const heroImage = block.querySelector('.image');
    if (heroImage && heroImage.children.length === 0) {
      heroImage.append(videoElement);
    } else {
      block.append(videoElement);
    }
  }
}
