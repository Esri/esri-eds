import { calciteButton, div } from '../../scripts/dom-helpers.js';

function convertToCalciteButton(button) {
  if (!button) return;
  const isVideo = button.classList.contains('video-link');
  button.replaceChildren(calciteButton({
    'icon-end': (isVideo) ? 'play-f' : 'arrowRight',
    href: button.href,
    appearance: 'outline',
    alignment: 'center',
    scale: 'm',
    type: 'button',
    width: 'auto',
    kind: 'inverse',
  }, button.textContent));
  button.classList.remove('button');
}

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

export default function decorate(block) {
  const mainCell = block.querySelector(':scope > div > div');

  let videoElement = null;
  const videoAnchor = mainCell.querySelector(':scope > p:nth-last-child(2) > a');
  if (videoAnchor) {
    videoAnchor.parentElement.remove();
    videoElement = getVideoInteractionElement(videoAnchor);
  }

  const button = block.querySelector('a');
  convertToCalciteButton(button);

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
