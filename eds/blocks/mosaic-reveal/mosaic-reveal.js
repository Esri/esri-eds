import { h3, div, domEl } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  block.classList.add('calcite-mode-dark');

  [...block.children].forEach((child) => {
    child.querySelector('h3').setAttribute('tabindex', '-1');
    const titleText = child.querySelector('h3').textContent;

    child.children[0].appendChild(h3({ class: 'title' }, titleText));
    const expandButton = domEl('button', { class: 'mosaic-reveal-button' });
    const icon = domEl('calcite-icon', { icon: 'expand', scale: 's' });
    expandButton.appendChild(icon);
    child.appendChild(expandButton);
  });

  const contents = [...block.children].map((child) => child.children[1]);
  contents.forEach((content) => {
    content.classList.add('mosaic-reveal-content');
    content.setAttribute('aria-hidden', 'true');

    const anchorElem = content.querySelector('a');
    const linkText = anchorElem.textContent;
    const url = anchorElem.href;
    const link = domEl('calcite-link', {
      href: url,
      'icon-end': 'arrowRight',
    }, linkText);

    anchorElem.parentElement.appendChild(link);
    anchorElem.parentElement.removeChild(anchorElem);
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
    const msrevealcontent = child.querySelector('.mosaic-reveal-content');
    const mosaicTitle = msrevealcontent.querySelector('h3');
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
        mosaicTitle.setAttribute('tabindex', '0');
        setTimeout(() => {
          mosaicTitle.focus();
        }, 100);
      }
    });

    child.addEventListener('mouseleave', () => {
      if (!mediaQuery.matches) {
        child.querySelector('.mosaic-reveal-content').ariaHidden = true;
        mosaicTitle.setAttribute('tabindex', '-1');
      }
    });

    child.querySelector('.mosaic-reveal-button').addEventListener('click', () => {
      const event = new Event('mouseenter');
      child.dispatchEvent(event);
    });

    child.querySelector('.mosaic-reveal-content').addEventListener('click', () => {
      const event = new Event('mouseleave');
      child.dispatchEvent(event);
    });
  });
  block.appendChild(revealContent);

  block.querySelectorAll('.mosaic-reveal-content').forEach((content) => {
    content.insertBefore(div({ class: 'content-bg' }), content.firstChild);
    const contractButton = domEl('button', { class: 'mosaic-contract-button' });
    const icon = domEl('calcite-icon', { icon: 'contract', scale: 's' });
    contractButton.appendChild(icon);
    content.appendChild(contractButton);
  });
}
