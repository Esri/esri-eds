import { sampleRUM, loadScript } from './aem.js';
import { div, domEl } from './dom-helpers.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

/**
 * Loads analytic attributes to all links inside a block.
 * @param {Element} dataLayer The container element
 */
function loadAnalytics(dataLayer) {
  document.querySelectorAll('.block')
    .forEach((block) => block.querySelectorAll('[href]')
      .forEach((link) => {
        if ((link.tagName === 'A') || (link.tagName === 'CALCITE-BUTTON')) {
          link.setAttribute('data-event', 'track-component');
          link.setAttribute('data-component-name', block.getAttribute('data-block-name'));
          link.setAttribute('data-component-link-type', 'link');
          if (/^[a-zA-Z ]+$/.test(link.innerHTML)) {
            link.setAttribute('data-component-link', link.innerHTML);
          }
        }
      }));

  if (typeof dataLayer !== 'undefined') {
    document.querySelectorAll('.block')
      .forEach((block) => block.querySelectorAll('[href]')
        .forEach((link) => {
          if ((link.tagName === 'A') || (link.tagName === 'CALCITE-BUTTON')) {
            link.addEventListener('click', () => dataLayer.push({
              event: 'onClick',
              component: {
                tagName: link.tagName.toLowerCase(),
                name: block.getAttribute('data-block-name'),
                url: link.href,
                linkType: link.getAttribute('data-component-link-type'),
                linkText: link.innerHTML,
              },
            }));
          }
        }));
  }
}

// Launch script
loadScript('https://assets.adobedtm.com/2d251f50426c/e52f833be42a/launch-bdb68bbb4cf5-development.min.js', null)
  .then(() => {});

// Append to window.dataLayer
// Add page title, page name, and page URL to window.dataLayer
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'pageLoad',
  page: {
    pageName: document.title,
    pageTitle: document.title,
    pagePath: window.location.href,
    locale: document.documentElement.lang,
  },
});

window.addEventListener('load', () => {
  loadAnalytics(window.dataLayer);
});

// decorate modal
const toggleLoader = () => {
  const loader = document.querySelector('.web-dev-loader');
  if (loader) {
    loader.classList.toggle('visible');
  }
};

const removeModal = (modal, playButton) => {
  const videoIframeWrapper = document.querySelector('.video-iframe-wrapper');
  if (videoIframeWrapper) {
    videoIframeWrapper.remove();
  }

  ['style', 'tabindex', 'aria-hidden'].forEach((attr) => document.body.removeAttribute(attr));
  modal.remove();
  playButton.focus();
};

const handleEscKeyPress = (event, playButton) => {
  if (event.key === 'Escape') {
    removeModal(document.querySelector('.co3-modal'), playButton);
  } else {
    const co3ModalContainer = document.querySelector('.co3-modal-container');
    if (co3ModalContainer) {
      co3ModalContainer.focus();
    }
  }
};

function attachModalEventListeners(modal, playButton) {
  const modalCloseButton = modal.querySelector('.modal-close-button');
  const co3Modal = document.querySelector('.co3-modal');
  const iframe = co3Modal.querySelector('iframe');

  modalCloseButton.addEventListener('click', () => removeModal(co3Modal, playButton));
  modalCloseButton.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
      removeModal(co3Modal, playButton);
    }
  });

  co3Modal.addEventListener('click', (event) => {
    if (event.target === co3Modal) {
      removeModal(co3Modal, playButton);
    }
  });

  iframe.addEventListener('load', () => {
    toggleLoader();
    modal.querySelector('.co3-modal-container').focus();
  });
}

// decorate modal
export default function decorateModal(videoLink, playButton) {
  const modal = div(
    { class: 'co3-modal calcite-mode-dark' },
    div({
      class: 'co3-modal-container',
      tabindex: '0',
    }, domEl('iframe', {
      class: 'co3-modal iframe',
      src: videoLink,
    }), div(
      { class: 'modal-close-button' },
      domEl('calcite-icon', {
        icon: 'x',
        scale: 'l',
        tabIndex: 0,
        'aria-label': 'close modal',
        'aria-hidden': 'false',
      }),
    )),
  );

  document.body.setAttribute('tabindex', '-1');
  document.body.setAttribute('aria-hidden', 'true');
  document.body.appendChild(modal);
  document.addEventListener('keydown', (event) => handleEscKeyPress(event, playButton));

  // Attach event listeners to the modal
  attachModalEventListeners(modal, playButton);
}

// decorate embed iframe
const videoLink = document.querySelector('a.button.video-link[title="video player"]');
if (videoLink) {
  const { parentNode } = videoLink;
  if (parentNode) {
    const videoUrl = videoLink.getAttribute('href');
    const iframe = document.createElement('iframe');
    const iframeContainer = document.createElement('div');
    const section = parentNode.closest('.section');
    iframe.src = videoUrl;
    iframe.allowFullscreen = true;
    iframeContainer.classList.add('iframe-container');
    iframeContainer.setAttribute('style', 'max-inline-size: 850px; inline-size: 100%');
    iframeContainer.appendChild(iframe);
    const buttonContainer = parentNode.closest('.button-container');
    buttonContainer.setAttribute('aria-hidden', 'true');
    const defaultContentWrapper = parentNode.closest('.default-content-wrapper');
    defaultContentWrapper.appendChild(iframeContainer);
    if (section) {
      section.classList.add('center');
    }
  }
}
