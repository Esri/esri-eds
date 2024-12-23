import { video } from '../../scripts/dom-helpers.js';
import { createAutoplayedVideo } from '../../scripts/scripts.js';

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
      url.classList.add('hidden');
      mp4Video = true;
    }
  });

  return mp4Video;
}

/**
 * Set the foreground container for mp4 video.
 * @returns {element} The block element
 */
function setforegroundContainers(block) {
  const vids = block.querySelectorAll('a');
  const mp4Authored = isMP4(vids);
  const picTags = block.querySelectorAll('picture');

  if (!mp4Authored) {
    if (picTags.length > 1) {
      const picTag = picTags[1];
      picTag.parentNode.classList.add('foreground-container');
    }
  }
}

function setforegroundContainersNoVideo(block) {
  const picTags = block.querySelectorAll('picture');
  if (picTags.length > 1) {
    const picTag = picTags[1];
    picTag.parentNode.classList.add('foreground-container');
  }
}

/**
 * Produce a calcite play button icon with appropriate attributes.
 * @returns {element} play pause button
 */
async function getVideoBtn() {
  const videoContainer = document.createElement('div');
  const buttonContainer = document.createElement('div');
  const videoButton = document.createElement('button');
  const playProgressCircle = document.createElement('svg');
  const progressBackground = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

  videoContainer.classList.add('video-container');
  buttonContainer.classList.add('button-container');
  videoButton.classList.add('video-playbutton');
  videoButton.setAttribute('aria-label', 'Playing Animation');
  videoButton.setAttribute('tabindex', '0');
  playProgressCircle.classList.add('play-progress-circle');
  playProgressCircle.setAttribute('viewBox', '0 0 100 100');
  progressBackground.classList.add('progress-background');
  progressBackground.setAttribute('r', '45');
  progressBackground.setAttribute('cy', '50');
  progressBackground.setAttribute('cx', '50');
  progressCircle.classList.add('progress-circle');
  progressCircle.setAttribute('r', '45');
  progressCircle.setAttribute('cy', '50');
  progressCircle.setAttribute('cx', '50');
  playProgressCircle.appendChild(progressBackground);
  playProgressCircle.appendChild(progressCircle);
  videoButton.appendChild(playProgressCircle);
  videoContainer.appendChild(videoButton);

  return videoContainer;
}

/**
 * Get all mp4 urls from the block.
 * @returns {element} The block element
 */
function getMP4(block) {
  const aTags = block.querySelectorAll('a');
  const mp4Urls = [];
  aTags.forEach((aTag) => {
    if (aTag.href.includes('.mp4')) {
      mp4Urls.push(aTag);
    }
  });
  return mp4Urls;
}

/**
 * convert link button to calcite button
 * @param {element} block The block element
 */
function decorateLinkBtn(block) {
  const anchorElements = block.querySelectorAll('a');
  anchorElements.forEach((anchorElement) => {
    if (!anchorElement.classList.contains('hidden')) {
      const calciteButton = document.createElement('calcite-button');
      calciteButton.innerHTML = anchorElement.innerHTML;
      if (anchorElement.getAttribute('href')) {
        calciteButton.setAttribute('href', anchorElement.getAttribute('href'));
      }
      if (!calciteButton.getAttribute('scale')) {
        calciteButton.setAttribute('scale', 'l');
      }
      anchorElement.replaceWith(calciteButton);
    }
  });
}

function decorateIcons(block) {
  const iconWrapper = document.createElement('div');
  iconWrapper.classList.add('icon-wrapper');

  block.querySelectorAll('picture').forEach((picture, indx) => {
    picture.classList.add('icon-picture');
    const iconHTML = picture.closest('p').innerHTML;
    if (indx === 0) {
      const iconParentWrapper = picture.closest('p').parentNode;
      iconParentWrapper.insertBefore(iconWrapper, iconParentWrapper.lastElementChild);
    }
    if (picture.classList.contains('hide-poster')) {
      picture.classList.remove('hide-poster');
    }
    if (/<\/picture>[a-z|A-Z]+/.test(picture.closest('p').innerHTML)) {
      const iconTitle = iconHTML.match(/<\/picture>\s*([a-z|A-Z| ]+)/);
      const storytellerGroup = document.createElement('div');
      const storytellerTitle = document.createElement('div');
      const storytellerContent = document.createElement('div');
      const imgPicture = picture.querySelector('img');
      const iconParagraph = picture.closest('p').nextElementSibling;
      const [, secondTitle] = iconTitle;
      picture.closest('p').classList.add('hidden');
      imgPicture.classList.add('icon-48');
      storytellerGroup.classList.add('storyteller-row');
      storytellerContent.classList.add('storyteller-content');
      storytellerTitle.innerHTML = secondTitle;
      iconParagraph.classList.add('icon-paragraph');
      storytellerTitle.classList.add('icon-title');
      storytellerGroup.appendChild(picture);
      storytellerContent.append(storytellerTitle);
      storytellerContent.append(iconParagraph);
      storytellerGroup.appendChild(storytellerContent);
      iconWrapper.appendChild(storytellerGroup);
    }
  });
}

function playPromises(videoElement) {
  const playPromise = videoElement.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      videoElement.play();
    })
      .catch(() => null);
  }
}

function togglePlayButton(videoElement) {
  const videoContainer = videoElement.closest('.foreground-container');
  const buttonContainer = videoContainer.querySelector('.video-container');
  const playButton = buttonContainer.querySelector('.video-playbutton');

  if (videoElement.paused) {
    playButton.classList.add('paused');
  } else {
    playButton.classList.remove('paused');
  }
}

function setupVideoControl(playButtonElement, videoElement) {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!isReducedMotion.matches) {
    playButtonElement.addEventListener('click', () => {
      videoElement.loop = true;
      if (videoElement.paused) {
        playPromises(videoElement);
        togglePlayButton(videoElement);
      } else {
        videoElement.pause();
        togglePlayButton(videoElement);
      }
    });
  }

  videoElement.addEventListener('play', () => {
    togglePlayButton(videoElement);
  });
  videoElement.addEventListener('pause', () => {
    togglePlayButton(videoElement);
  });
}

function bindFeatures(videoContainers, playButtonContainers) {
  if ((videoContainers !== null)) {
    playButtonContainers.forEach((playButton) => {
      const videoContainer = playButton.parentNode;
      const videoElmt = videoContainer.querySelector('video');
      const newVideo = video({ src: videoElmt.querySelector('video > source').src });

      newVideo.addEventListener('loadedmetadata', () => {
        setupVideoControl(playButton, videoElmt);
      });
    });
  }
}

function enableVideoControls(block) {
  const videoContainers = block.querySelectorAll('.foreground-container');
  const playButtonContainers = block.querySelectorAll('.video-container');

  bindFeatures(videoContainers, playButtonContainers);
}

export default async function decorate(block) {
  const pTags = block.querySelectorAll('p');
  const pictureTagLeft = pTags[0].querySelector('picture');
  const vidUrls = getMP4(block);
  const foregroundContentContainer = document.createElement('div');
  const foregroundPicture = block.querySelectorAll('picture')[1];
  const foregroundSrc = foregroundPicture.querySelector('img').src;
  const foregroundContent = document.createElement('div');
  const videoBtn = await getVideoBtn();

  // this shouldn't be needed, but there's more to unravel
  let videoTag = video();

  foregroundContent.classList.add('content-wrapper');
  if (isMP4(vidUrls) === true) {
    foregroundPicture.classList.add('hide-poster');
  }
  if ((pictureTagLeft !== null)) {
    setforegroundContainers(block);
    const foregroundWrapper = block.querySelector('.foreground-container');
    const h2Tag = block.querySelector('h2');
    if (vidUrls.length >= 1) {
      videoTag = createAutoplayedVideo(vidUrls[0].href, foregroundSrc);
    }
    block.classList.add('primary-content');
    foregroundContentContainer.classList.add('foreground-content');
    foregroundContentContainer.appendChild(videoTag);
    foregroundContent.appendChild(h2Tag);
    foregroundContent.appendChild(pTags[2]);
    foregroundContentContainer.appendChild(foregroundContent);
    foregroundWrapper.appendChild(foregroundContentContainer);
    if (vidUrls.length >= 1) {
      foregroundWrapper.appendChild(videoBtn);
    }
  }

  if ((pictureTagLeft === null) && (vidUrls.length === 0)) {
    const h2Tags = block.querySelectorAll('h2');
    if (h2Tags.length > 1) {
      setforegroundContainersNoVideo(block);
      const foregroundWrapper = block.querySelector('.foreground-container');
      foregroundContentContainer.classList.add('foreground-content');
      foregroundContent.appendChild(h2Tags[1]);
      foregroundContent.appendChild(pTags[pTags.length - 1]);
      foregroundContentContainer.appendChild(foregroundContent);
      foregroundWrapper.appendChild(foregroundContentContainer);
    }
  }

  if ((pictureTagLeft === null) && (vidUrls.length > 0)) {
    const foregroundWrapper = block.querySelector('.foreground-container');
    const h2Tags = block.querySelectorAll('h2');
    if (vidUrls.length >= 1) {
      videoTag = createAutoplayedVideo(vidUrls[0].href, foregroundSrc);
    }
    foregroundContentContainer.classList.add('foreground-content');
    foregroundContentContainer.appendChild(videoTag);
    foregroundContent.appendChild(h2Tags[1]);
    foregroundContent.appendChild(pTags[pTags.length - 1]);
    foregroundContentContainer.appendChild(foregroundContent);
    foregroundWrapper.appendChild(foregroundContentContainer);
    foregroundWrapper.appendChild(videoBtn);
  }

  decorateLinkBtn(block);
  decorateIcons(block);
  enableVideoControls(block);
}
