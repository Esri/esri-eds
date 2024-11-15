import { domEl } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  // find all children of the block
  // const blockChildren = [...block.children];
  // in blockChildren find second child of each
  // const children = blockChildren.map((child) => child.children[1]);


  // const imgCollection = block.querySelectorAll('picture > img');
  // imgCollection.forEach((img, i) => {
  //   img.setAttribute('loading', 'eager');
  //   if (i === 0) {
  //     img.closest('p').classList.add('foreground-img');
  //   }
  // });
  
  const videoElement = document.createElement('video');
  const videoSrc = document.createElement('source');
  const videoAssets = block.querySelectorAll('a');
  videoElement.toggleAttribute('loop', true);
  videoElement.toggleAttribute('playsinline', true);
  videoElement.toggleAttribute('autoplay', true);
  if ((videoAssets !== null) && (videoAssets !== undefined) && (videoAssets.length > 0)) {
    if (videoAssets.length === 2) {
      videoSrc.setAttribute('src', videoAssets[1].getAttribute('title'));
      videoAssets[1].classList.add('hidden');
    } else {
      videoSrc.setAttribute('src', videoAssets[0].getAttribute('title'));
      videoAssets[0].classList.add('hidden');
    }
  }
  videoSrc.setAttribute('type', 'video/mp4');

  if (videoElement) videoElement.append(videoSrc);
  if (videoAssets) block.prepend(videoElement);

  const contentDiv = block.querySelector('div:last-child');
  console.log(contentDiv);
  const contentChildDiv = contentDiv.querySelector('div');
  const children = [...contentChildDiv.children];

  const heroContent = domEl('div', { class: 'hero-content' });
  const heroContentWrapper = domEl('div', { class: 'hero-content-wrapper' });
  const heroFgImage = domEl('div', { class: 'hero-fg-image' });

  heroContent.prepend(heroContentWrapper);
  block.prepend(heroContent, heroFgImage);

  children.forEach((child) => {
    if (!child.classList.contains('foreground-img')) {
      heroContentWrapper.appendChild(child); // Move each child to left container except fg image
    } else {
      heroFgImage.appendChild(child); // Move .foreground-img to right container
    }
  });
  //contentDiv.remove(); // Remove the empty div
}
