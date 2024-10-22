import { calciteButton, div } from '../../scripts/dom-helpers.js';

function convertToCalciteButton(button) {
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
  const backgroundPicture = mainCell.querySelector(':scope > p:last-child > picture');

  const backgroundPictureSrc = backgroundPicture
    .querySelector('source')
    .srcset
    .replace('optimize=medium', 'optimize=false');

  block.style.backgroundImage = `url(${backgroundPictureSrc})`;
  backgroundPicture.parentElement.remove();

  const picture = block.querySelector('p > picture');
  const pictureWrapper = picture.parentElement;
  const mediaWrapper = div(
    { class: 'media-wrapper' },
    picture,
  );
  if (videoElement) {
    mediaWrapper.appendChild(videoElement);
  }
  pictureWrapper.replaceWith(mediaWrapper);
}
