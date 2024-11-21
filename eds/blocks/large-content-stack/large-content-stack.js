import { calciteButton, div } from '../../scripts/dom-helpers.js';

/**
 * Decorates a Calcite button with the appropriate icon and kind based on its class.
 *
 * This method checks if the given button has the 'video-link' class.
 * If it does, it sets the 'icon-end' attribute to 'play-f'.
 * Otherwise, it sets the 'icon-end' attribute to 'arrowRight'.
 *
 * @param {HTMLElement} button - The button element to be decorated.
 * @return {void}
 */
function decorateCalciteButton(button) {
  if (!button) return;
  const isVideo = button.classList.contains('video-link');
  button.setAttribute('icon-end', isVideo ? 'play-f' : 'arrowRight');
  button.setAttribute('kind', 'inverse');
}

/**
 * Generates and returns a video interaction element based on the provided video anchor.
 *
 * @param {HTMLElement} videoAnchor - The anchor element that links to the video.
 *                                    It should contain the href attribute with the video URL.
 *
 * @return {HTMLElement} The video interaction element.
 *                       If the videoAnchor is not provided or lacks an href attribute, an empty
 *   div is returned. Otherwise, a div containing a customized 'Play' button is returned.
 */
function getVideoInteractionElement(videoAnchor) {
  if (!videoAnchor || !videoAnchor.href) {
    // variant without video
    return div();
  }

  const playButton = calciteButton({
    kind: 'neutral',
    color: 'neutral',
    appearance: 'solid',
    label: 'Play this video',
    alignment: 'center',
    width: 'auto',
    type: 'button',
    scale: 'l',
    round: '',
    'icon-end': 'play-f',
  });

  videoAnchor.classList.add('video-play-anchor');
  videoAnchor.replaceChildren(playButton);

  return div(videoAnchor);
}

/**
 * Decorates a block element by modifying its content based on specific rules:
 * - Extracts and processes a video link.
 * - Enhances a Calcite button.
 * - Adjusts the background image based on the presence and number of images.
 *
 * @param {HTMLElement} block - The block element to be decorated.
 *
 * @return {void}
 */
export default function decorate(block) {
  const mainCell = block.querySelector(':scope > div > div');

  let videoElement = null;
  const videoAnchor = mainCell.querySelector(':scope > p:nth-last-child(2) > a');
  if (videoAnchor) {
    videoAnchor.parentElement.remove();
    videoElement = getVideoInteractionElement(videoAnchor);
  }

  // Decorate the Calcite button with the appropriate icon and kind
  const button = block.querySelector('calcite-button');
  decorateCalciteButton(button);

  // TODO background picture quality is low, fix it
  // If one image, use as foreground image
  // If two images, second image is background image
  const pictures = mainCell.querySelectorAll('p > picture');
  pictures.forEach((picture) => {
    const parentP = picture.parentElement;

    // Check if the parent p element is the last child
    const isLastChild = parentP === parentP.parentElement.lastElementChild;

    // Check if the parent p element has a preceding sibling that contains a picture element
    let hasPrecedingSiblingWithPicture = false;

    let sibling = parentP.previousElementSibling;
    while (sibling) {
      if (sibling.querySelector('picture')) {
        hasPrecedingSiblingWithPicture = true;
        break;
      }
      sibling = sibling.previousElementSibling;
    }

    if (isLastChild && hasPrecedingSiblingWithPicture) {
      const backgroundPictureSrc = picture
        .querySelector('source')
        .srcset
        .replace('optimize=medium', 'optimize=false');

      block.style.backgroundImage = `url(${backgroundPictureSrc})`;
      parentP.remove();
    } else {
      const pictureWrapper = picture.parentElement;
      const mediaWrapper = div(
        { class: 'media-wrapper' },
        picture,
      );
      pictureWrapper.replaceWith(mediaWrapper);
    }
  });

  if (videoElement) {
    // to do: add video element
    // mediaWrapper.appendChild(videoElement);
  }
}
