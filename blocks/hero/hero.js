export default function decorate(block) {
  const videoElement = document.createElement('video');
  const videoSrc = document.createElement('source');
  const videoAssets = block.querySelectorAll('a');

  videoSrc.setAttribute('type', 'video/mp4');
  videoElement.setAttribute('type', 'video/mp4');
  videoElement.setAttribute('muted', '');
  videoSrc.setAttribute('src', videoAssets[1].getAttribute('title'));

  if (videoElement) videoElement.append(videoSrc);
  if (videoAssets) block.prepend(videoElement);

  videoElement.play();
}
