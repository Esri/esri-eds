export default function decorate(block) {
  const pTags = block.querySelectorAll('p');
  const pictureTagLeft = pTags[0].querySelector('picture');
  const vidUrls = block.querySelectorAll('a');
  const foregroundContentContainer = document.createElement('div');
  const videoTag = document.createElement('video');
  const foregroundPicture = block.querySelectorAll('picture')[1];
  const foregroundSrc = foregroundPicture.querySelector('img').src;
  const foregroundContent = document.createElement('div');
  const source = document.createElement('source');
  foregroundContent.classList.add('content-wrapper');
  videoTag.muted = true;
  videoTag.toggleAttribute('autoplay', 'true');
  videoTag.toggleAttribute('loop', true);
  videoTag.toggleAttribute('playsinline', true);
  videoTag.setAttribute('type', 'video/mp4');
  videoTag.setAttribute('poster', foregroundSrc);

  if ((pictureTagLeft !== null) && (vidUrls.length >= 2)) {
    const h2Tag = block.querySelector('h2');
    source.setAttribute('src', vidUrls[0].href);
    videoTag.appendChild(source);
    block.classList.add('content-left');
    pTags[1].classList.add('foreground-container');
    foregroundContentContainer.classList.add('foreground-content');
    foregroundContentContainer.appendChild(videoTag);
    foregroundContent.appendChild(h2Tag);
    foregroundContent.appendChild(pTags[2]);
    foregroundContentContainer.appendChild(foregroundContent);
    pTags[1].appendChild(foregroundContentContainer);
  }

  if ((pictureTagLeft === null) && (vidUrls.length >= 2)) {
    const h2Tags = block.querySelectorAll('h2');
    source.setAttribute('src', vidUrls[1].href);
    videoTag.appendChild(source);
    pTags[3].classList.add('foreground-container');
    foregroundContentContainer.classList.add('foreground-content');
    foregroundContentContainer.appendChild(videoTag);
    foregroundContent.appendChild(h2Tags[1]);
    foregroundContent.appendChild(pTags[4]);
    foregroundContentContainer.appendChild(foregroundContent);
    pTags[3].appendChild(foregroundContentContainer);
  }
}
