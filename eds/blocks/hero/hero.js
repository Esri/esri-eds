import { createAutoplayedVideo } from '../../scripts/scripts.js';
import { calciteButton } from '../../scripts/dom-helpers.js';

// decorate modal
function decorateModal() {
  const iframe = document.createElement('iframe');
  iframe.classList.add('co3-modal', 'iframe');
  const videoLink = document.querySelector('.video-link');
  if (videoLink) {
    iframe.setAttribute('src', videoLink.getAttribute('href'));
  }
  const modal = document.createElement('div');
  modal.classList.add('co3-modal', 'calcite-mode-dark');
  const closeButton = document.createElement('calcite-icon');
  closeButton.classList.add('co3-modal-container', 'calcite-icon');
  closeButton.setAttribute('icon', 'x');
  closeButton.setAttribute('scale', 'm');
  closeButton.setAttribute('aria-label', 'close modal');
  closeButton.setAttribute('aria-hidden', 'false');
  closeButton.setAttribute('tabindex', '0');
  closeButton.addEventListener('click', () => {
    removeModal(modal);
  });
  closeButton.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
      removeModal(modal);
    }
  });

  const modalContainer = document.createElement('div');
  modalContainer.classList.add('co3-modal-container');
  modalContainer.setAttribute('tabindex', '0');
  modalContainer.appendChild(iframe);
  modalContainer.appendChild(closeButton);
  modal.appendChild(modalContainer);
  document.body.setAttribute('tabindex', '-1');
  document.body.setAttribute('aria-hidden', 'true');
  document.body.appendChild(modal);
  document.addEventListener('keydown', handleEscKeyPress);
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

  // Query the video link and enable the play button
  const videoLink = block.querySelector('.video-link');
  const btnContainer = videoLink.closest('.button-container');
  console.log('btnContainer', btnContainer);

  if ((videoLink) && (btnContainer)) {
    btnContainer.replaceWith(calciteButton({
      'icon-end': 'play-f',
      appearance: 'solid',
      href: videoLink.href,
      label: videoLink.textContent,
    }, videoLink.textContent));
  }
  // listen for click events on 'calcite-button'
  const calciteBtn = block.querySelector('calcite-button');
  if (calciteBtn) {
    calciteBtn.addEventListener('click', (evt) => {
      console.log('clicked', calciteBtn);
      evt.preventDefault();
      decorateModal();
    });
  }
}
