import { a, calciteLink } from '../../scripts/dom-helpers.js';

import {
  decorateInnerHrefButtonsWithArrowIcon,
  decorateBlockMode,
} from '../../scripts/scripts.js';

export default function decorate(block) {
  block.querySelectorAll('.elastic-content-strip > div > div').forEach((div) => {
    const linkElement = div.querySelector('a,calcite-button');
    if (!linkElement) return;
    const linkHref = linkElement.href;

    const elasticContentWrapper = a({
      class: 'elastic-content-link-wrapper',
      href: linkHref,
    });
    div.parentNode.insertBefore(elasticContentWrapper, div);
    elasticContentWrapper.appendChild(div);
    decorateInnerHrefButtonsWithArrowIcon(elasticContentWrapper);

    const backgroundImage = div.querySelector('picture');
    if (backgroundImage) {
      const backgroundImageSrc = backgroundImage
        .querySelector('source')
        .srcset
      div.parentNode.parentNode.style.backgroundImage = `url(${backgroundImageSrc})`;
    }
    backgroundImage.remove();

    const btn = div.querySelector('.button-container');
    if (!btn) return;
    const labelElement = btn.querySelector('a');
    if (!labelElement) return;
    const labelText = labelElement.textContent;
    const btnLink = calciteLink({
      'icon-end': 'arrowRight',
      class: 'button link',
      href: linkHref,
      label: labelText,
    }, labelText);
    btn.replaceWith(btnLink);
  });

  decorateBlockMode(block);
}
