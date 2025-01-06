import { a, calciteLink } from '../../scripts/dom-helpers.js';

import {
  decorateInnerHrefButtonsWithArrowIcon,
  decorateBlockMode,
} from '../../scripts/scripts.js';

export default function decorate(block) {
  block.querySelectorAll('.elastic-content-strip > div > div').forEach((div) => {
    const linkHref = div.querySelector('a,calcite-button').href;

    const elasticContentWrapper = a({
      class: 'elastic-content-link-wrapper',
      href: linkHref,
    });
    div.parentNode.insertBefore(elasticContentWrapper, div);
    elasticContentWrapper.appendChild(div);
    decorateInnerHrefButtonsWithArrowIcon(elasticContentWrapper);

    const btn = div.querySelector('.button-container');
    const labelText = btn.querySelector('a').textContent;
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
