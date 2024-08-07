export default function decorate(block) {
  const videoElement = document.createElement('video');
  const videoSrc = document.createElement('source');
  const videoAssets = block.querySelectorAll('a');

  videoElement.toggleAttribute('loop', true);
  videoElement.toggleAttribute('playsinline', true);
  videoElement.toggleAttribute('autoplay', true);
  videoSrc.setAttribute('src', videoAssets[1].getAttribute('title'));
  videoSrc.setAttribute('type', 'video/mp4');

  if (videoElement) videoElement.append(videoSrc);
  if (videoAssets) block.prepend(videoElement);
}
