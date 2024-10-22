export default function decorate(block) {
  block.querySelectorAll('picture > img').forEach((img, i) => {
    img.setAttribute('loading', 'eager');
    if (i === 0) {
      img.closest('p').classList.add('foreground-img');
    }
  });
  const videoElement = document.createElement('video');
  const videoSrc = document.createElement('source');
  const videoAssets = block.querySelectorAll('a');
  videoElement.toggleAttribute('loop', true);
  videoElement.toggleAttribute('playsinline', true);
  videoElement.toggleAttribute('autoplay', true);
  if (videoAssets.length === 2) {
    videoSrc.setAttribute('src', videoAssets[1].getAttribute('title'));
    videoAssets[1].classList.add('video-src');
  } else {
    videoSrc.setAttribute('src', videoAssets[0].getAttribute('title'));
    videoAssets[0].classList.add('video-src');
  }
  videoSrc.setAttribute('type', 'video/mp4');

  if (videoElement) videoElement.append(videoSrc);
  if (videoAssets) block.prepend(videoElement);
}
