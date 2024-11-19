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

  const videoAssets = block.querySelectorAll('a');

  if (videoAssets.length > 0) {
    const videoAsset = videoAssets[videoAssets.length - 1];

    const videoElement = video(
      {
        loop: true,
        playsinline: true,
        autoplay: true,
        type: 'video/mp4',
        src: videoAsset.getAttribute('title'),
      },
    );

    videoAsset.classList.add('hidden');

    const heroImage = block.querySelector('.image');
    if (heroImage && heroImage.children.length === 0) {
      heroImage.append(videoElement);
    } else {
      block.append(videoElement);
    }
  }
}
