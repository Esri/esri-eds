import {
  div, calciteButton, video, button, svg, circle,
} from '../../scripts/dom-helpers.js';
import { createAutoplayedVideo } from '../../scripts/scripts.js';

/**
 * Produce a calcite play button icon with appropriate attributes.
 *
 * @returns {HTMLButtonElement} A play/pause button
 */
function getVideoBtn() {
  const videoButton = button({
    class: 'video-play-button', 'aria-label': 'Play animation', tabindex: '0',
  });
  const playProgressCircle = svg({
    class: 'play-progress-circle', viewBox: '0 0 100 100', 'aria-hidden': 'true',
  });
  const progressBackground = circle({
    class: 'progress-background', r: '45', cy: '50', cx: '50',
  });
  const progressCircle = circle({
    class: 'progress-circle', r: '45', cy: '50', cx: '50',
  });

  playProgressCircle.appendChild(progressBackground);
  playProgressCircle.appendChild(progressCircle);
  videoButton.appendChild(playProgressCircle);

  return videoButton;
}

/**
 * Get all mp4 URLs from the block.
 *
 * @param {Element} block - The block element
 *
 * @returns {Array.<HTMLAnchorElement>} The array of mp4 urls
 */
function getVideoUrls(block) {
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
 * Convert link button to calcite button
 *
 * @param {Element} block - The block element
 *
 * @returns {void}
 */
function decorateButtons(block) {
  const anchorElements = block.querySelectorAll('a');

  anchorElements.forEach((anchorElement) => {
    if (!anchorElement.classList.contains('hidden')) {
      const linkButton = calciteButton({
        'aria-label': anchorElement.innerHTML, tabindex: '0',
      });

      linkButton.innerHTML = anchorElement.innerHTML;

      if (anchorElement.getAttribute('href')) {
        linkButton.setAttribute('href', anchorElement.getAttribute('href'));
      }

      if (!linkButton.getAttribute('scale')) {
        linkButton.setAttribute('scale', 'l');
      }

      anchorElement.replaceWith(linkButton);
    }
  });
}

/**
 * Play a video element with a promise, handling potential errors.
 *
 * @param {HTMLVideoElement} videoElement - The video element to play.
 *
 * @returns {Promise<void>}
 */
async function playVideo(videoElement) {
  const playPromise = videoElement.play();

  if (playPromise !== undefined) {
    playPromise.then(() => videoElement.play().then((r) => r).catch(() => null));
  }
}

/**
 * Toggles a 'paused' class on a video play button based on the paused state of a video element.
 *
 * @param {HTMLVideoElement} videoElement - The video element to check the paused state of.
 *
 * @returns {void}
 */
function togglePlayButton(videoElement) {
  const videoContainer = videoElement.closest('.foreground');
  const playButton = videoContainer.querySelector('.video-play-button');

  if (videoElement.paused) {
    playButton.classList.add('play');
  } else {
    playButton.classList.remove('play');
  }
}

/**
 * Sets up a video control with a play button, handling clicks and video element events.
 *
 * @param {HTMLElement} playButtonElement - The play button element.
 * @param {HTMLVideoElement} videoElement - The video element to control.
 *
 * @returns {void}
 */
function setupVideoControl(playButtonElement, videoElement) {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!isReducedMotion.matches) {
    playButtonElement.addEventListener('click', async () => {
      videoElement.loop = true;
      if (videoElement.paused) {
        await playVideo(videoElement);
        togglePlayButton(videoElement);
      } else {
        videoElement.pause();
        togglePlayButton(videoElement);
      }
    });
  }

  videoElement.addEventListener('play', () => togglePlayButton(videoElement));
  videoElement.addEventListener('pause', () => togglePlayButton(videoElement));
}

/**
 * Binds a play button to a video element, setting up a video control to play
 * or pause the video when clicked.
 *
 * @param {Element} videoContainer - A list of video container elements.
 *
 * @returns {void}
 */
function bindVideoElement(videoContainer) {
  if (videoContainer) {
    const videoElement = videoContainer.querySelector('video');
    const playButton = videoContainer.querySelector('.video-play-button');
    const newVideo = video({ src: videoElement.querySelector('video > source').src });

    newVideo.addEventListener('loadedmetadata', () => setupVideoControl(playButton, videoElement));
  }
}

/**
 * Decorates a block element with an image, video, and content.
 *
 * @param {Element} block - The block element to decorate.
 *
 * @returns {Promise<void>} A promise that resolves when decoration is complete.
 */
export default async function decorate(block) {
  // Replace first div with children
  block.children[0].replaceWith(...block.children[0].childNodes);

  // Add classes to the child divs
  [...block.children].forEach((row) => {
    if (row.querySelector('p > picture')) {
      row.className = 'media';
    } else {
      row.className = 'content';
    }
  });

  const media = block.querySelector('.media');
  const h2Tags = media.querySelectorAll('h2');
  const pTags = media.querySelectorAll('p');
  const picTags = media.querySelectorAll('picture');
  const foregroundContainer = div({ class: 'foreground' });
  const vidUrls = getVideoUrls(media);
  const poster = media.querySelectorAll('picture')[1];
  const posterSrc = poster?.querySelector('img').src;

  if (picTags.length > 0) {
    const backgroundContainer = div({ class: 'background' }, picTags[0]);
    pTags[0].replaceWith(backgroundContainer);
  }

  if (vidUrls.length > 0) {
    vidUrls.forEach((url) => {
      const videoBtn = getVideoBtn();
      const videoTag = createAutoplayedVideo(url.href, posterSrc);
      const videoOverlayHeading = h2Tags[0];
      const videoOverlayParagraph = pTags[pTags.length - 1];
      const videoOverlay = div({ class: 'overlay' }, videoOverlayHeading, videoOverlayParagraph);

      foregroundContainer.appendChild(videoOverlay);
      foregroundContainer.appendChild(videoTag);
      foregroundContainer.appendChild(videoBtn);
      url.parentElement.replaceWith(foregroundContainer);
      url.remove();

      bindVideoElement(foregroundContainer);
    });
  } else {
    foregroundContainer.appendChild(picTags[1]);
    pTags[1].replaceWith(foregroundContainer);
  }

  decorateButtons(block);
}
