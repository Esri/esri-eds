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

  const imgCollection = block.querySelectorAll('picture > img');
  imgCollection.forEach((img) => {
    img.setAttribute('loading', 'eager');
  });
  
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

  const heroImage = block.querySelector('.hero-image');
  const heroVideo = block.querySelector('.hero-video');
  if (heroVideo && heroVideo.children.length === 1) {
    if (heroImage && heroImage.children.length === 0) {
      heroImage.append(heroVideo.children[0]);
    }
  } else {
    console.log('video and image');
  }
}
