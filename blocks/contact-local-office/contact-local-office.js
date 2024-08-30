import {
  calciteButton,
  div,
} from '../../scripts/dom-helpers.js';

function getContactOfficeButton(textContent) {
  const contactOfficeButton = calciteButton({
    'icon-end': 'arrowRight',
    href: 'https://www.esri.com/en-us/contact',
    appearance: 'outline',
    alignment: 'center',
    scale: 'm',
    type: 'button',
    width: 'auto',
    kind: 'inverse',
  }, textContent);

  return contactOfficeButton;
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
  videoAnchor.innerText = '';
  videoAnchor.appendChild(playButton);

  const videoButtonWrapper = div({ class: 'calcite-button-wrapper calcite-button-wrapper--nomargin video-play-button' }, videoAnchor);
  return videoButtonWrapper;
}

function getContactOfficeDomElements(heading, buttonTextContent, ...media) {
  const contentWrapper = div({ class: 'about-content-wrapper calcite-theme-light calcite-mode-light' });
  const headingWrapper = div({ class: 'about-heading-wrapper' });
  headingWrapper.appendChild(heading);
  const buttonWrapper = div({ class: 'about-button-wrapper calcite-button-wrapper calcite-animate calcite-animate__in-up' });
  buttonWrapper.appendChild(getContactOfficeButton(buttonTextContent));
  const mediaWrapper = div({ class: 'about-media-wrapper' });
  media.forEach((m) => {
    mediaWrapper.appendChild(m);
  });

  const contentChildren = [headingWrapper, buttonWrapper, mediaWrapper];

  contentChildren.forEach((child) => {
    contentWrapper.appendChild(child);
  });

  return contentWrapper;
}
export default function decorate() {
  const aboutMainContent = document.querySelector('.contact-local-office > div > div');

  const aboutMainHeading = aboutMainContent.children[0];
  aboutMainHeading.classList.add('about-main-heading');
  const aboutContactButton = aboutMainContent.children[1];
  const videoAnchor = document.querySelector('.contact-local-office > div > div > p:last-child > a');

  const videoElement = getVideoInteractionElement(videoAnchor);
  const mediaContent = aboutMainContent.children[2].children[0];

  const buttonTextContent = aboutContactButton.children[0].textContent;

  const elems = getContactOfficeDomElements(
    aboutMainHeading,
    buttonTextContent,
    mediaContent,
    videoElement,
  );

  const contentParent = aboutMainContent.parentNode;
  contentParent.removeChild(aboutMainContent);
  contentParent.appendChild(elems);
}
