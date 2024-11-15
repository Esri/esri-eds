import { domEl } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  // Find all children of the block
  const blockChildren = [...block.children];

  // Iterate over each child of the block
  const secondChildren = blockChildren.map((child) => {
    // Remove the first child
    if (child.children.length > 0) {
      child.removeChild(child.children[0]);
    }
    // Return the second child
    return child.children[0];
  });
// Remove the outer <div> for each secondChildren
secondChildren.forEach((child) => {
  if (child) {
    const parentDiv = child.parentElement;
    parentDiv.replaceWith(child);
  }
});
  // For each secondChildren, set the first to banner-content, the second to banner-image, third to banner-video, last to banner-background
  secondChildren.forEach((child, i) => {
    if (child) {
      if (i === 0) {
        child.classList.add('hero-content');
      } else if (i === 1) {
        child.classList.add('hero-image');
      } else if (i === 2) {
        child.classList.add('hero-video');
      } else {
        child.classList.add('hero-background');
      }
    }
  });

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
  if (videoAssets) block.append(videoElement);

  //const contentDiv = block.querySelector('div.banner-content');
  //const contentChildDiv = contentDiv.querySelector('div');
  //const children = [...contentChildDiv.children];

  //const heroContent = domEl('div', { class: 'hero-content' });
  //const heroContentWrapper = domEl('div', { class: 'hero-content-wrapper' });
  //const heroFgImage = domEl('div', { class: 'hero-fg-image' });

  //heroContent.prepend(heroContentWrapper);
  //block.prepend(heroContent, heroFgImage);

  // children.forEach((child) => {
  //   if (!child.classList.contains('foreground-img')) {
  //     heroContentWrapper.appendChild(child); // Move each child to left container except fg image
  //   } else {
  //     heroFgImage.appendChild(child); // Move .foreground-img to right container
  //   }
  // });
  //contentDiv.remove(); // Remove the empty div
}
