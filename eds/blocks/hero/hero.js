import { button } from '../../scripts/dom-helpers.js';
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
  imgCollection.forEach((img) => {
    img.setAttribute('loading', 'eager');
  });

  /* query select all 'button-container' elements */
  // const buttonContainers = block.querySelectorAll('.button-container');
  // if (buttonContainers.length > 0) {
  //   const buttonContainerParent = buttonContainers[0].parentElement;
  //   const newButtonContainer = document.createElement('div');
  //   newButtonContainer.style.display = 'flex';
  //   newButtonContainer.classList.add('button-wrapper');
  //   buttonContainers.forEach((buttonContainer) => {
  //     newButtonContainer.append(buttonContainer);
  //   });
  //   buttonContainerParent.append(newButtonContainer);
  // }

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
