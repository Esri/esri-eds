import { calciteButton, calciteLink } from '../../scripts/dom-helpers.js';

function removeModal(modal) {
  const videoIframeWrapper = document.querySelector('.video-iframe-wrapper');
  if (videoIframeWrapper) {
    videoIframeWrapper.remove();
  }

  ['style', 'tabindex', 'aria-hidden'].forEach((attr) => document.body.removeAttribute(attr));
  modal.remove();
}

function toggleLoader() {
  const loader = document.querySelector('.web-dev-loader');
  if (loader) {
    loader.classList.toggle('visible');
  }
}

// decorate modal
function decorateModal() {
  const iframe = document.createElement('iframe');
  iframe.classList.add('co3-modal', 'iframe');
  const videoLink = document.querySelector('.video-link');
  if (videoLink) {
    const href = videoLink.getAttribute('href');
    iframe.setAttribute('src', href);
  }

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
  const modal = document.createElement('div');
  modal.classList.add('co3-modal', 'calcite-mode-dark');
  modalContainer.appendChild(iframe);
  modalContainer.appendChild(closeButton);
  modal.appendChild(modalContainer);
  document.body.setAttribute('tabindex', '-1');
  document.body.setAttribute('aria-hidden', 'true');
  document.body.appendChild(modal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      removeModal(modal);
    }
  });

  iframe.addEventListener('load', () => {
    iframe.focus();
    toggleLoader();
  });
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }

      const buttons = col.querySelectorAll('.button-container');
      if (buttons.length > 0) {
        const parent = buttons[0].parentElement;
        const buttonWrapper = document.createElement('div');
        buttonWrapper.classList.add('buttons-container');
        buttons.forEach((btn) => {
          buttonWrapper.appendChild(btn);
        });
        parent.appendChild(buttonWrapper);
      }

      // convert buttons to calcite components
      const btns = col.querySelectorAll('.button-container');
      if (btns) {
        btns.forEach((btn) => {
          const labelText = btn.querySelector('a').textContent;
          const outlineAttr = btn.querySelector('em') ? 'outline' : '';
          const linkHref = col.querySelector('a,calcite-button').href;
          if (outlineAttr) {
            btn.replaceWith(calciteButton({
              'icon-end': 'arrowRight',
              appearance: `${outlineAttr}`,
              href: linkHref,
              label: labelText,
            }, labelText));
          } else {
            btn.replaceWith(calciteLink({
              'icon-end': 'arrowRight',
              href: linkHref,
              label: labelText,
            }, labelText));
          }
        });
      }

      // media text split logic
      const p = col.querySelector('p');
      if (p?.querySelector('picture')) {
        p.classList.add('columns-p');
      }

      // decorate play button
      const vidURL = col.querySelector('a[href*="mediaspace"]', 'a[href*="youtube"]', 'a[href*="video"]');
      const picture = col.querySelector('picture');
      if (vidURL) {
        vidURL.innerHTML = '';
        vidURL.appendChild(picture);
        const playButton = calciteButton({
          'icon-start': 'play-f',
          'aria-hidden': 'false',
          'aria-label': 'play video',
          class: 'play-button',
          label: 'play video',
          appearance: 'solid',
          kind: 'inverse',
          scale: 'l',
          round: '',
        });
        vidURL.appendChild(playButton);
      }

      // setup play button click event
      const playButton = col.querySelector('.play-button');
      if (playButton) {
        playButton.addEventListener('click', (event) => {
          event.preventDefault();
          toggleLoader();
          decorateModal();
        });
      }
    });
  });
}