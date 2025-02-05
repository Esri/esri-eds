import { createAutoplayedVideo } from '../../scripts/scripts.js';
import { calciteButton } from '../../scripts/dom-helpers.js';

let lastfocusBtn;
const toggleLoader = () => {
  const loader = document.querySelector('.web-dev-loader');
  if (loader) {
    loader.classList.toggle('visible');
  }
};

const removeModal = (modal) => {
  const videoIframeWrapper = document.querySelector('.video-iframe-wrapper');
  if (videoIframeWrapper) {
    videoIframeWrapper.remove();
  }

  ['style', 'tabindex', 'aria-hidden'].forEach((attr) => document.body.removeAttribute(attr));
  modal.remove();
  lastfocusBtn.focus();
};

const handleEscKeyPress = (event) => {
  if (event.key === 'Escape') {
    removeModal(document.querySelector('.co3-modal'));
  } else {
    const co3ModalContainer = document.querySelector('.co3-modal-container');
    if (co3ModalContainer) {
      co3ModalContainer.focus();
    }
  }
};

// decorate modal
function decorateModal(videoLink) {
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
  document.addEventListener('keydown', handleEscKeyPress);
  closeButton.addEventListener('click', () => removeModal(modal));
  closeButton.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
      removeModal(modal);
    }
  });
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      removeModal(modal);
    }
  });

  iframe.addEventListener('load', () => {
    toggleLoader();
    modalContainer.focus();
  });
}

export default function decorate(block) {
  const newChildren = [...block.children].map((entry) => {
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

    videoAsset.classList.add('hidden');

    const heroImage = block.querySelector('.image');
    if (heroImage && heroImage.children.length === 0) {
      heroImage.append(videoElement);
    } else {
      block.append(videoElement);
    }
  }

  const videoLink = block.querySelector('.video-link');
  const btnContainer = videoLink.closest('.button-container');
  if ((videoLink) && (btnContainer)) {
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
      lastfocusBtn = calciteBtn;

      toggleLoader();
      decorateModal(videoLink.href);
    });
  }
}
