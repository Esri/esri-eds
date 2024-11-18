export default function decorate(block) {
  // Find all children of the block
  const blockChildren = [...block.children];

  // for each blockChildren, find children
  blockChildren.forEach((child) => {
    const contentBlocks = [...child.children];
    // get first child, use as class for second, remove it
    const blockClass = contentBlocks[0].textContent.toLowerCase();
    child.removeChild(contentBlocks[0]);
  
    // add blockClass to the second child, remove parent
    contentBlocks[1].classList.add(blockClass);
    child.replaceWith(contentBlocks[1]);
  });

  const imgCollection = block.querySelectorAll('picture > img');
  imgCollection.forEach((img) => {
    img.setAttribute('loading', 'eager');
  });

  const videoElement = document.createElement('video');
  const videoSrc = document.createElement('source');
  const videoAssets = block.querySelectorAll('a');
  console.log('videoAssets', videoAssets);
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

  // If there is no hero image, but there is a video
  // Move video into hero block
  if (videoElement) {
    const heroImage = block.querySelector('.image');
    if (heroImage && heroImage.children.length === 0) {
      heroImage.append(videoElement);
    } else {
      block.append(videoElement);
    }
  }
}
