import { calciteButton, calciteLink } from '../../scripts/dom-helpers.js';

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
        
      // media text split logic
      const p = col.querySelector('p');
      if (p?.querySelector('picture')) {
        p.classList.add('columns-p');
      }
    });
  });
}
