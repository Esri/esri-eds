import { calciteButton, calciteLink } from '../../scripts/dom-helpers.js';
import decorateModal from '../../scripts/delayed.js';

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
        const videoLink = block.querySelector('.video-link');
        playButton.addEventListener('click', (event) => {
          event.preventDefault();
          playButton.setAttribute('tabindex', '0');
          decorateModal(videoLink.href, playButton);
        });
      }
    });
  });
}
