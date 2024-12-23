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

  playProgressCircle.appendChild(progressBackground, progressCircle);
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
  block.querySelectorAll('a').forEach((anchorElement) => {
    const linkButton = calciteButton({
      'aria-label': anchorElement.innerHTML,
      tabindex: '0',
      href: anchorElement.getAttribute('href'),
      scale: anchorElement.getAttribute('scale') || 'l',
    });

    linkButton.innerHTML = anchorElement.innerHTML;

    anchorElement.replaceWith(linkButton);
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
 * Enhances a block with media and content styling and interactions.
 *
 * @param {Element} block - The block element to decorate.
 * @returns {Promise<void>} A promise that resolves when decoration is complete.
 */
export default async function decorate(block) {
  // Flatten the first row and assign class names
  block.children[0].replaceWith(...block.children[0].childNodes);
  [...block.children].forEach((row) => {
    row.className = row.querySelector('p > picture') ? 'media' : 'content';
  });

  const media = block.querySelector('.media');
  const [h2] = media.querySelectorAll('h2');
  const pictures = media.querySelectorAll('picture');
  const paragraphs = media.querySelectorAll('p');
  const vidUrls = getVideoUrls(media);
  const posterSrc = pictures[1]?.querySelector('img')?.src;
  const foregroundContainer = div({ class: 'foreground' });

  // Handle media background
  if (pictures.length > 0) {
    const backgroundContainer = div({ class: 'background' }, pictures[0]);
    paragraphs[0].replaceWith(backgroundContainer);
  }

  // Handle video decoration, fallback to second picture if no videos
  if (vidUrls.length > 0) {
    vidUrls.forEach((url) => {
      const videoTag = createAutoplayedVideo(url.href, posterSrc);
      const videoOverlay = div(
        { class: 'overlay' },
        h2,
        paragraphs[paragraphs.length - 1],
      );

      const videoBtn = getVideoBtn();
      foregroundContainer.append(videoOverlay, videoTag, videoBtn);
      url.parentElement.replaceWith(foregroundContainer);
      url.remove();
      bindVideoElement(foregroundContainer);
    });
  } else if (pictures[1]) {
    foregroundContainer.appendChild(pictures[1]);
    paragraphs[1]?.replaceWith(foregroundContainer);
  }

  decorateButtons(block);
}
