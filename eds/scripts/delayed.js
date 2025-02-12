import { sampleRUM, loadScript } from './aem.js';

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

loadAnalytics(window.dataLayer);

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

// decorate modal
export default function decorateModal(videoLink, playButton) {
  const closeButton = Object.assign(document.createElement('calcite-icon'), {
    className: 'co3-modal-container calcite-icon',
    icon: 'x',
    scale: 'm',
    tabIndex: 0,
    ariaLabel: 'close modal',
    ariaHidden: 'false',
  });

  const iframe = document.createElement('iframe');
  const modalContainer = document.createElement('div');
  const modal = document.createElement('div');
  iframe.classList.add('co3-modal', 'iframe');
  iframe.setAttribute('src', videoLink);
  modalContainer.classList.add('co3-modal-container');
  modalContainer.setAttribute('tabindex', '0');
  modalContainer.appendChild(iframe);
  modalContainer.appendChild(closeButton);
  modal.classList.add('co3-modal', 'calcite-mode-dark');
  modal.appendChild(modalContainer);
  document.body.setAttribute('tabindex', '-1');
  document.body.setAttribute('aria-hidden', 'true');
  document.body.appendChild(modal);
  document.addEventListener('keydown', (event) => handleEscKeyPress(event, playButton));
  closeButton.addEventListener('click', () => removeModal(modal));
  closeButton.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
      removeModal(modal, playButton);
    }
  });
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      removeModal(modal, playButton);
    }
  });

  iframe.addEventListener('load', () => {
    toggleLoader();
    modalContainer.focus();
  });
}
