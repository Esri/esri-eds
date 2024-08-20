/**
 * Determine if mp4 resource is available. Add selector 'foreground-container' to p tag.
 * @param {string} vidUrls array with href property
 * @returns {string} true/false
 */
function isMP4(vidUrls) {
  const mp4Regex = /\.mp4$/;
  let mp4Video = false;

  vidUrls.forEach((url) => {
    if (mp4Regex.test(url)) {
      url.parentNode.classList.add('foreground-container');
      mp4Video = true;
    }
  });

  return mp4Video;
}

/**
 * Toggle playhead to play or pause mp4 video.
 * @param {element} videoBtn The playhead control element for mp4 video
 */
function toggleVideo(videoBtn) {
  const foregroundWrapper = videoBtn.closest('.foreground-container');
  const videoWrapper = foregroundWrapper.querySelector('.foreground-content');
  const vidSrc = videoWrapper.querySelector('video');
  if (vidSrc.paused === true) {
    vidSrc.play();
  } else {
    vidSrc.pause();
  }
}

/**
 * Produce a calcite play button icon with appropriate attributes.
 * @returns {element} play pause button
 */
async function getVideoBtn() {
  const videoButton = document.createElement('button');
  videoButton.classList.add('video-playbutton');
  videoButton.setAttribute('aria-label', 'play or pause video');

  const calciteIconPlayBtn = document.createElement('calcite-icon');
  calciteIconPlayBtn.setAttribute('scale', 's');
  calciteIconPlayBtn.setAttribute('appearance', 'solid');
  calciteIconPlayBtn.setAttribute('icon', 'play-f');
  calciteIconPlayBtn.setAttribute('aria-hidden', 'true');
  videoButton.appendChild(calciteIconPlayBtn);

  return videoButton;
}

async function setVideoTag(foregroundSrc) {
  const videoTag = document.createElement('video');

  videoTag.muted = true;
  videoTag.toggleAttribute('autoplay', 'true');
  videoTag.toggleAttribute('loop', true);
  videoTag.toggleAttribute('playsinline', true);
  videoTag.setAttribute('type', 'video/mp4');
  videoTag.setAttribute('poster', foregroundSrc);
  return videoTag;
}

export default async function decorate(block) {
  const pTags = block.querySelectorAll('p');
  const pictureTagLeft = pTags[0].querySelector('picture');
  const vidUrls = block.querySelectorAll('a');
  const foregroundContentContainer = document.createElement('div');
  const foregroundPicture = block.querySelectorAll('picture')[1];
  const foregroundSrc = foregroundPicture.querySelector('img').src;
  const foregroundContent = document.createElement('div');
  const source = document.createElement('source');
  const videoBtn = await getVideoBtn();
  const videoTag = await setVideoTag(foregroundSrc);

  foregroundContent.classList.add('content-wrapper');

  if (isMP4(vidUrls) === true) {
    foregroundPicture.classList.add('hide-poster');
  }

  if ((pictureTagLeft !== null) && (vidUrls.length >= 1)) {
    const foregroundWrapper = block.querySelector('.foreground-container');
    const h2Tag = block.querySelector('h2');

    source.setAttribute('src', vidUrls[0].href);
    videoTag.appendChild(source);
    block.classList.add('content-right');
    foregroundContentContainer.classList.add('foreground-content');
    foregroundContentContainer.appendChild(videoTag);
    foregroundContent.appendChild(h2Tag);
    foregroundContent.appendChild(pTags[2]);
    foregroundContentContainer.appendChild(foregroundContent);
    foregroundWrapper.appendChild(foregroundContentContainer);
    foregroundWrapper.appendChild(videoBtn);
  }

  if ((pictureTagLeft === null) && (vidUrls.length >= 1)) {
    const foregroundWrapper = block.querySelector('.foreground-container');
    const h2Tags = block.querySelectorAll('h2');

    source.setAttribute('src', vidUrls[1].href);
    videoTag.appendChild(source);
    foregroundContentContainer.classList.add('foreground-content');
    foregroundContentContainer.appendChild(videoTag);
    foregroundContent.appendChild(h2Tags[1]);

    if (pTags.length > 5) {
      foregroundContent.appendChild(pTags[pTags.length - 1]);
    } else {
      foregroundContent.appendChild(pTags[4]);
    }

    foregroundContentContainer.appendChild(foregroundContent);
    foregroundWrapper.appendChild(foregroundContentContainer);
    foregroundWrapper.appendChild(videoBtn);
  }

  videoBtn.addEventListener('click', () => {
    toggleVideo(videoBtn);
  });
}
