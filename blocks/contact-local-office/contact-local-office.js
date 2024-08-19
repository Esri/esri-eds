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

function getContactOfficeDomElements(heading, buttonTextContent, media) {
  const contentWrapper = div({ class: 'about-content-wrapper calcite-theme-light calcite-mode-light' });
  const headingWrapper = div({ class: 'about-heading-wrapper' });
  headingWrapper.appendChild(heading);
  const buttonWrapper = div({ class: 'about-button-wrapper calcite-button-wrapper calcite-animate calcite-animate__in-up' });
  buttonWrapper.appendChild(getContactOfficeButton(buttonTextContent));
  const mediaWrapper = div({ class: 'about-media-wrapper' });
  mediaWrapper.appendChild(media);

  const contentChildren = [headingWrapper, buttonWrapper, mediaWrapper];

  contentChildren.forEach((child) => {
    contentWrapper.appendChild(child);
  });

  return contentWrapper;
}
export default async function decorate() {
  const aboutMainContent = document.querySelector('.contact-local-office > div > div');

  const aboutMainHeading = aboutMainContent.children[0];
  aboutMainHeading.classList.add('about-main-heading');
  const aboutContactButton = aboutMainContent.children[1];
  const mediaContent = aboutMainContent.children[2].children[0];

  const buttonTextContent = aboutContactButton.children[0].textContent;

  const elems = getContactOfficeDomElements(aboutMainHeading, buttonTextContent, mediaContent);

  const contentParent = aboutMainContent.parentNode;
  contentParent.removeChild(aboutMainContent);
  contentParent.appendChild(elems);
}
