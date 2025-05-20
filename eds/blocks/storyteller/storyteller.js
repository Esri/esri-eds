import {
  div, calciteButton, button,
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

  videoButton.innerHTML = `<svg class="play-progress-circle" viewBox="0 0 100 100">
  <circle class="progress-background" r="45" cx="50" cy="50"></circle>
  <circle class="progress-circle" r="41.25" cx="50" cy="50"></circle>
</svg>`;

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
function playVideo(videoElement) {
  const playPromise = videoElement.play();
  if (playPromise !== undefined) {
    playPromise.then(() => videoElement.play().then((r) => r).catch(() => null));
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
function setupVideoControl(playButtonElement, videoElement, videoLength) {
  const totalFrames = 259.18;
  const playProgressCircle = playButtonElement.querySelector('.play-progress-circle');
  const progressCircle = playProgressCircle.querySelector('.progress-circle');
  progressCircle.style.strokeDasharray = totalFrames;
  progressCircle.style.strokeDashoffset = totalFrames;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function togglePlayButton(element) {
    const videoContainer = element.closest('.foreground');
    const playButton = videoContainer.querySelector('.video-play-button');
    if (element.paused) {
      playButton.setAttribute('aria-label', 'pause animation');
      playButton.classList.add('paused');
    } else {
      playButton.setAttribute('aria-label', 'play animation');
      playButton.classList.remove('paused');
    }
  }

  function updateDashOffset() {
    const currentTime = (videoElement.currentTime / videoLength) * totalFrames;
    progressCircle.style.strokeDashoffset = totalFrames - currentTime;
    requestAnimationFrame(updateDashOffset);
    if (currentTime === totalFrames) {
      progressCircle.style.strokeDashoffset = totalFrames;
    }
  }

  if (!isReducedMotion.matches) {
    playButtonElement.addEventListener('click', () => {
      if (videoElement.paused) {
        playVideo(videoElement);
        togglePlayButton(videoElement);
      } else {
        videoElement.pause();
        togglePlayButton(videoElement);
      }
      updateDashOffset();
    });
  }

  videoElement.addEventListener('timeupdate', updateDashOffset);
  videoElement.addEventListener('ended', () => { togglePlayButton(videoElement) });
  videoElement.addEventListener('play', () => { togglePlayButton(videoElement) });
  videoElement.addEventListener('pause', () => { togglePlayButton(videoElement) });
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

    if (videoElement) {
      videoElement.load();
      videoElement.addEventListener('loadedmetadata', () => {
        const videoLength = videoElement.duration;
        setupVideoControl(playButton, videoElement, videoLength);
      });
    }
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
