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
 * Toggle playhead to play or pause mp4 video.
 * @param {element} videoBtn The playhead control element for mp4 video
 */
function toggleVideo(videoBtn) {
  const foregroundWrapper = videoBtn.closest('.foreground-container');
  const videoWrapper = foregroundWrapper.querySelector('.foreground-content');
  const vidSrc = videoWrapper.querySelector('video');
  const vidBtn = foregroundWrapper.querySelector('.video-playbutton');
  const calciteIconPlayBtn = vidBtn.querySelector('calcite-icon');
  if (vidSrc.paused === true) {
    vidSrc.play();
    calciteIconPlayBtn.setAttribute('icon', 'play-f');
  } else {
    vidSrc.pause();
    calciteIconPlayBtn.setAttribute('icon', 'pause-f');
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

/**
 * Produce a video tag with appropriate attributes.
 * @returns {element} foregroundSrc The source of the video
 */
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
    let iconHTML = picture.closest('p').innerHTML;
    if (indx === 0) {
      let iconParentWrapper = picture.closest('p').parentNode;
      iconParentWrapper.insertBefore(iconWrapper, iconParentWrapper.lastElementChild);
    }
    if (picture.classList.contains('hide-poster')) {
      picture.classList.remove('hide-poster');
    }
    if (/<\/picture>[a-z|A-Z]+/.test(picture.closest('p').innerHTML)) {
      let iconTitle = iconHTML.match(/<\/picture>\s*([a-z|A-Z| ]+)/);
      let storytellerGroup = document.createElement('div');
      let storytellerTitle = document.createElement('div');
      let storytellerContent = document.createElement('div');
      let imgPicture = picture.querySelector('img');
      picture.closest('p').classList.add('hidden');
      imgPicture.classList.add('icon-48');
      storytellerGroup.classList.add('storyteller-row');
      storytellerContent.classList.add('storyteller-content');
      storytellerTitle.innerHTML = iconTitle[1];
      let iconParagraph = picture.closest('p').nextElementSibling;
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

export default async function decorate(block) {
  const pTags = block.querySelectorAll('p');
  const pictureTagLeft = pTags[0].querySelector('picture');
  const vidUrls = getMP4(block);
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
  if ((pictureTagLeft !== null)) {
    setforegroundContainers(block);
    const foregroundWrapper = block.querySelector('.foreground-container');
    const h2Tag = block.querySelector('h2');
    if (vidUrls.length >= 1) {
      source.setAttribute('src', vidUrls[0].href);
      videoTag.appendChild(source);
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
      if (pTags.length > 5) {
        foregroundContent.appendChild(pTags[pTags.length - 1]);
      } else {
        foregroundContent.appendChild(pTags[4]);
      }
      foregroundContentContainer.appendChild(foregroundContent);
      foregroundWrapper.appendChild(foregroundContentContainer);
    }
  }

  if ((pictureTagLeft === null) && (vidUrls.length > 0)) {
    const foregroundWrapper = block.querySelector('.foreground-container');
    const h2Tags = block.querySelectorAll('h2');
    if (vidUrls.length >= 1) {
      source.setAttribute('src', vidUrls[0].href);
      videoTag.appendChild(source);
    }
    foregroundContentContainer.classList.add('foreground-content');
    foregroundContentContainer.appendChild(videoTag);
    foregroundContent.appendChild(h2Tags[1]);
    foregroundContent.appendChild(pTags[pTags.length - 1]);
    foregroundContentContainer.appendChild(foregroundContent);
    foregroundWrapper.appendChild(foregroundContentContainer);
    foregroundWrapper.appendChild(videoBtn);
  }

  videoBtn.addEventListener('click', () => {
    toggleVideo(videoBtn);
  });

  decorateLinkBtn(block);
  decorateIcons(block);
}
