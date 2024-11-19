import { source, video } from '../../scripts/dom-helpers.js';

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

  const videoSrc = source({ type: 'video/mp4' });
  const videoAssets = block.querySelectorAll('a');

  if (videoAssets && videoAssets.length > 0) {
    let videoAsset = videoAssets[0];
    if (videoAssets.length === 2) {
      // eslint-disable-next-line prefer-destructuring
      videoAsset = videoAssets[1];
    }

    videoSrc.setAttribute('src', videoAsset.getAttribute('title'));
    videoAsset.classList.add('hidden');
  }

  const videoElement = video(
    {
      loop: true,
      playsinline: true,
      autoplay: true,
    },
    videoSrc,
  );

  const heroImage = block.querySelector('.image');
  if (heroImage && heroImage.children.length === 0) {
    heroImage.append(videoElement);
  } else {
    block.append(videoElement);
  }
}
