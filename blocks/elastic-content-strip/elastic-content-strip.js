import { a } from '../../scripts/dom-helpers.js';

import {
  decorateInnerHrefButtonsWithArrowIcon,
  decorateBlockMode,
} from '../../scripts/scripts.js';

export default function decorate(block) {
  block.querySelectorAll('.elastic-content-strip > div > div').forEach((div) => {
    const linkHref = div.querySelector('a').href;

    const elasticContentWrapper = a({
      class: 'elastic-content-link-wrapper',
      href: linkHref,
    });
    div.parentNode.insertBefore(elasticContentWrapper, div);
    elasticContentWrapper.appendChild(div);

    decorateInnerHrefButtonsWithArrowIcon(elasticContentWrapper);
  });

  block.querySelectorAll('.button-container').forEach((bc) => {
    bc.children[0].classList.remove('button');
    bc.children[0].classList.add('learn-more-icon-container');
  });

  decorateBlockMode(block);
}
