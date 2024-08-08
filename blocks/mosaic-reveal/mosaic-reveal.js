import { h3, div, domEl } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  block.classList.add('calcite-mode-dark');

  [...block.children].forEach((child) => {
    const titleText = child.querySelector('h3').textContent;

    child.children[0].appendChild(h3({ class: 'title' }, titleText));

    child.appendChild(domEl('calcite-icon', { icon: 'expand', scale: 's' }));
  });

  const contents = [...block.children].map((child) => child.children[1]);
  contents.forEach((content) => {
    content.classList.add('mosaic-reveal-content');
    content.setAttribute('aria-hidden', 'true');

    const buttonContainer = content.querySelector('p.button-container > a');
    const linkText = buttonContainer.textContent;
    const url = buttonContainer.href;

    const link = domEl('calcite-link', {
      href: url,
      'icon-end': 'arrowRight',
    }, linkText);

    buttonContainer.parentElement.appendChild(link);
    buttonContainer.parentElement.removeChild(buttonContainer);
  });

  const revealContent = div({ class: 'mosaic-reveal-content', 'aria-hidden': 'true' });
  revealContent.addEventListener('click', () => {
    revealContent.setAttribute('aria-hidden', 'true');
  });

  const mediaQuery = window.matchMedia('(width < 860px)');

  mediaQuery.onchange = (e) => {
    if (e.matches) {
      contents.forEach((content) => {
        content.setAttribute('aria-hidden', 'true');
      });
    } else {
      revealContent.setAttribute('aria-hidden', 'true');
    }
  };

  [...block.children].forEach((child, idx) => {
    child.addEventListener('click', () => {
      if (mediaQuery.matches) {
        revealContent.setAttribute('aria-hidden', 'false');
        const children = [...contents[idx].children].map((el) => el.cloneNode(true));
        revealContent.replaceChildren(...children);
      }
    });

    child.addEventListener('mouseenter', () => {
      if (!mediaQuery.matches) {
        child.querySelector('.mosaic-reveal-content').ariaHidden = false;
      }
    });

    child.addEventListener('mouseleave', () => {
      if (!mediaQuery.matches) {
        child.querySelector('.mosaic-reveal-content').ariaHidden = true;
      }
    });
  });

  block.appendChild(revealContent);

  block.querySelectorAll('.mosaic-reveal-content').forEach((content) => {
    content.insertBefore(div({ class: 'content-bg' }), content.firstChild);
    content.appendChild(domEl('calcite-icon', { icon: 'contract', scale: 's' }));
  });
}
