import { createAutoplayedVideo } from '../../scripts/scripts.js';
import { calciteButton, video, button } from '../../scripts/dom-helpers.js';
import decorateModal from '../../scripts/delayed.js';

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
    const videoContainer = element.closest('.block.hero');
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

    // Check if the video is a loop video
    if (videoElement.closest('div.hero')?.classList.contains('loop-video')) {
      if (currentTime >= totalFrames) {
        videoElement.currentTime = 0; // Reset video to start
        playVideo(videoElement); // Play the video again
      }
      requestAnimationFrame(updateDashOffset);
    } else if (currentTime >= totalFrames) {
      // Check if the video has ended, reset dash offset and play again
      progressCircle.style.strokeDashoffset = totalFrames;
    } else {
      // Schedule the next update for smoother animation
      requestAnimationFrame(updateDashOffset);
    }
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
  videoElement.addEventListener('ended', () => { togglePlayButton(videoElement); });
  videoElement.addEventListener('play', () => { togglePlayButton(videoElement); });
  videoElement.addEventListener('pause', () => { togglePlayButton(videoElement); });
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


export default function decorate(block) {
  const newChildren = [...block.children]
    // filter out empty children
    .filter((entry) => {
      const entryContent = entry.lastElementChild;
      return entryContent.innerHTML !== '' && entryContent.innerHTML !== 'null';
    })
    // then map the children to add a class
    .map((entry) => {
      const entryKey = entry.firstElementChild.textContent.toLowerCase();

      const entryContent = entry.lastElementChild;
      entryContent.classList.add(entryKey);

      return entryContent;
    });
  block.replaceChildren(...newChildren);

  const imgCollection = block.querySelectorAll('picture > img');
  const heroContainer = document.querySelector('main > .hero-container');
  if (heroContainer && (heroContainer === heroContainer.parentElement.children[0]
    || heroContainer === heroContainer.parentElement.children[1])) {
    imgCollection.forEach((img) => {
      img.setAttribute('loading', 'eager');
      img.setAttribute('fetchpriority', 'high');
    });
  } else {
    imgCollection.forEach((img) => {
      img.setAttribute('loading', 'lazy');
    });
  }

  // look for div.backgroundimage and remove it no images
  const backgroundImage = block.querySelector('div.backgroundimage');
  if (backgroundImage && backgroundImage.innerHTML === '<p>null</p>') {
    backgroundImage.remove();
  }

  const blockTitle = block.querySelector('h1');
  const blockParagraphs = blockTitle.parentElement.querySelectorAll('p');
  if (blockParagraphs.length > 1) {
    if (blockParagraphs[0].innerHTML && blockParagraphs[1].innerHTML) {
      if (!blockParagraphs[0].classList.contains('button-container') && !blockParagraphs[1].classList.contains('button-container')) {
        blockParagraphs[1].classList.add('description');
      }
    }
  }

  const videoAssets = block.querySelectorAll('a');
  if (videoAssets.length > 0) {
    const videoAsset = videoAssets[videoAssets.length - 1];

    const src = videoAsset.getAttribute('title');
    const videoElement = createAutoplayedVideo(src, '');
    const foregroundDiv = document.createElement('div');
    foregroundDiv.classList.add('foregrounddiv');
    foregroundDiv.appendChild(videoElement);

    videoAsset.classList.add('hidden');

    const heroImage = block.querySelector('.image');
    if (!heroImage) {
      block.append(foregroundDiv);
    } else {
      block.append(videoElement);
      const videoBtn = getVideoBtn();
      block.append(videoBtn);
      bindVideoElement(block);
    }
  }

  const videoLink = block.querySelector('.video-link');
  if (videoLink) {
    const btnContainer = videoLink.closest('.button-container');
    if (btnContainer) {
      btnContainer.replaceWith(calciteButton({
        'icon-end': 'play-f',
        appearance: 'solid',
        href: videoLink.href,
        label: videoLink.textContent,
      }, videoLink.textContent));
    }

    const calciteBtn = block.querySelector('calcite-button');
    if (calciteBtn) {
      calciteBtn.addEventListener('click', (evt) => {
        evt.preventDefault();
        calciteBtn.setAttribute('tabindex', '0');
        decorateModal(videoLink.href, calciteBtn);
      });
    }
  }
}
