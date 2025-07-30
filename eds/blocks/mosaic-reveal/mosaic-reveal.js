import { h3, div, domEl } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  block.classList.add('calcite-mode-dark');

  [...block.children].forEach((child) => {
    const h3Element = child.querySelector('h3');
    let titleText = '';
    if (h3Element) {
      h3Element.setAttribute('tabindex', '-1');
      titleText = h3Element.textContent;
      child.children[0].appendChild(h3({ class: 'title' }, titleText));
    }

    const expandButton = div(
      domEl(
        'button',
        { class: 'mosaic-reveal-button' },
        domEl('calcite-icon', { icon: 'expand', scale: 's' }),
      ),
    );
    child.appendChild(expandButton);
  });

  const contents = [...block.children].map((child) => child.children[1]);
  contents.forEach((content) => {
    content.classList.add('mosaic-reveal-content');
    content.setAttribute('hidden', '');

    if (
      content.firstElementChild &&
      content.firstElementChild.tagName.toLowerCase() !== 'h3'
    ) {
      content.firstElementChild.classList.add('category');
    }
    const anchorElem = content.querySelector('a');
    if (anchorElem) {
      const linkText = anchorElem.textContent;
      const url = anchorElem.href;
      const link = domEl('calcite-link', {
        href: url,
        'icon-end': 'arrowRight',
      }, linkText);

      anchorElem.parentElement.appendChild(link);
      anchorElem.parentElement.removeChild(anchorElem);
    }
  });

  const revealContent = div({ class: 'mosaic-reveal-content', hidden: '' });
  revealContent.addEventListener('click', () => {
    revealContent.setAttribute('hidden', '');
  });

  const mediaQuery = window.matchMedia('(width < 860px)');

  mediaQuery.onchange = (e) => {
    if (e.matches) {
      contents.forEach((content) => {
        content.setAttribute('hidden', '');
      });
    } else {
      revealContent.setAttribute('hidden', '');
    }
  };

  [...block.children].forEach((child, idx) => {
    const msrevealcontent = child.querySelector('.mosaic-reveal-content');
    const mosaicTitle = msrevealcontent.querySelector('h3');
    child.addEventListener('click', () => {
      if (mediaQuery.matches) {
        revealContent.removeAttribute('hidden');
        const children = [...contents[idx].children].map((el) => el.cloneNode(true));
        revealContent.replaceChildren(...children);
      }
    });

    child.addEventListener('mouseenter', () => {
      child.querySelector('.mosaic-reveal-content').removeAttribute('hidden');
      mosaicTitle.setAttribute('tabindex', '0');
      setTimeout(() => {
        if (child.matches(':focus-within')) {
          mosaicTitle.focus();
        }
      }, 100);
    });

    child.addEventListener('mouseleave', () => {
      child.querySelector('.mosaic-reveal-content').setAttribute('hidden', '');
      mosaicTitle.setAttribute('tabindex', '-1');
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

  block.querySelectorAll('.mosaic-reveal-content').forEach((content) => {
    content.insertBefore(div({ class: 'content-bg' }), content.firstChild);
    const contractButton = domEl('button', { class: 'mosaic-contract-button' });
    const icon = domEl('calcite-icon', { icon: 'contract', scale: 's' });
    contractButton.appendChild(icon);
    content.appendChild(contractButton);
  });
}
