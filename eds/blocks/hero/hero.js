export default function decorate(block) {
  // Find all children of the block
  const blockChildren = [...block.children];

  // Iterate over each child of the block
  // Remove the first child
  // Return the second child
  const secondChildren = blockChildren.map((child) => {
    if (child.children.length > 0) {
      child.removeChild(child.children[0]);
    }
    return child.children[0];
  });

  secondChildren.forEach((child) => {
    if (child) {
      const parentDiv = child.parentElement;
      parentDiv.replaceWith(child);
    }
  });

  // For each secondChildren, set the first to hero-content,
  // the second to hero-image, third to hero-video,
  // last to hero-background
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
  if (videoAssets && videoAssets.length > 0) {
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
  if (videoElement && videoAssets.length > 0) {
    const heroImage = block.querySelector('.hero-image');
    if (heroImage && heroImage.children.length === 0) {
      heroImage.append(videoElement);
    } else {
      block.append(videoElement);
    }
  }
}
