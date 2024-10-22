import { createOptimizedPicture } from '../../scripts/aem.js';
import {
  calciteButton,
  ul,
  li,
  div,
  p,
} from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  block.classList.add('calcite-mode-dark');
  document.querySelector('.centered-content-switcher-container').classList.add('calcite-mode-dark');

  block.querySelectorAll('img').forEach((image) => image
    .closest('picture')
    .replaceWith(
      createOptimizedPicture(image.src, image.alt, false, [{ width: '750' }]),
    ));

  let selectedIdx = 0;
  const NUM_TABS = block.children.length;

  // create mobile nav
  const previousButton = calciteButton({
    class: 'previous-button',
    'icon-start': 'chevronLeft',
    label: 'Previous',
    appearance: 'transparent',
    kind: 'neutral',
    scale: 'l',
    round: '',
  });
  const nextButton = calciteButton({
    class: 'next-button',
    'icon-end': 'chevronRight',
    label: 'Next',
    appearance: 'transparent',
    kind: 'neutral',
    scale: 'l',
    round: '',
  });

  const mobileNav = div(
    { class: 'mobile-nav calcite-animate calcite-animate__in-up' },
    previousButton,
    ul(
      { class: 'mobile-nav-dots' },
      ...[...block.children].map((_, idx) => {
        const listItem = li({ class: idx === selectedIdx ? 'active' : ' ' });
        return listItem;
      }),
    ),
    nextButton,
  );

  // create desktop nav
  const numberOfColumns = [...block.children].length === 6 ? 3 : 2;
  const desktopNav = div(
    { class: 'desktop-nav calcite-animate calcite-animate__in-up' },
    ul(
      {
        class: 'desktop-nav-list',
        style: `grid-template-columns: repeat(${numberOfColumns}, 1fr)`,
      },
      ...[...block.children].map((child, idx) => {
        const picture = child.children[0].querySelector('picture');
        const headingText = child.querySelector('h2').textContent;

        const listItem = li(
          { class: idx === selectedIdx ? 'active' : '' },
          picture,
          p(headingText),
        );

        return listItem;
      }),
    ),
  );

  const changeSelectedTab = (index) => {
    mobileNav.parentElement?.removeChild(mobileNav);
    desktopNav.parentElement?.removeChild(desktopNav);

    const dots = mobileNav.querySelector('.mobile-nav-dots');
    const desktopList = desktopNav.querySelector('.desktop-nav-list');

    const currentTab = block.children[selectedIdx];
    const nextTab = block.children[index];

    desktopList.children[selectedIdx].classList.remove('active');
    dots.children[selectedIdx].classList.remove('active');
    currentTab.setAttribute('aria-hidden', 'true');
    currentTab.classList.remove('calcite-animate__in');
    currentTab.classList.add('animate-out');
    currentTab.children[0].classList.remove('calcite-animate__in-up');

    selectedIdx = index;

    nextTab.appendChild(mobileNav);
    nextTab.appendChild(desktopNav);

    dots.children[selectedIdx].classList.add('active');
    desktopList.children[selectedIdx].classList.add('active');
    nextTab.setAttribute('aria-hidden', 'false');
    nextTab.classList.add('calcite-animate__in');
    nextTab.classList.remove('animate-out');
    nextTab.children[0].classList.add('calcite-animate__in-up');
  };

  previousButton.addEventListener('click', () => changeSelectedTab((selectedIdx + NUM_TABS - 1) % NUM_TABS));
  nextButton.addEventListener('click', () => changeSelectedTab((selectedIdx + 1) % NUM_TABS));
  const listItems = [...mobileNav.querySelector('.mobile-nav-dots').children];
  listItems.forEach((listItem, listItemIdx) => {
    listItem.addEventListener('click', () => changeSelectedTab(listItemIdx));
  });

  const desktopListItems = [...desktopNav.querySelector('.desktop-nav-list').children];
  desktopListItems.forEach((listItem, listItemIdx) => {
    listItem.addEventListener('click', () => changeSelectedTab(listItemIdx));
  });

  [...block.children].forEach((tab) => {
    tab.classList.add('calcite-animate');
    tab.classList.add('animate-out');

    tab.setAttribute('aria-hidden', 'true');
    tab.setAttribute('role', 'tabpanel');

    tab.children[0].classList.add('calcite-animate');

    const imgUrl = tab.children[1].querySelector('img').src;
    tab.removeChild(tab.children[1]);

    tab.setAttribute('style', `background-image: url(${imgUrl})`);

    const anchor = tab.querySelector('a');
    const innerText = tab.innerText.split('\n').map((el) => el.trim().toLowerCase());
    const hasVideo = innerText.includes('video');

    if (hasVideo) {
      const playButton = calciteButton({
        'icon-start': 'play-f',
        label: 'Play',
        appearance: 'solid',
        kind: 'inverse',
        scale: 'l',
        round: '',
        href: anchor.href,
      });
      anchor.textContent = '';
      anchor.appendChild(playButton);
      anchor.parentElement.parentElement.removeChild(anchor.parentElement);
      tab.children[0].appendChild(anchor);
    } else {
      const button = calciteButton({
        'icon-end': 'arrowRight',
        label: anchor.textContent,
        href: anchor.href,
      }, anchor.textContent);

      anchor.parentElement.appendChild(button);
      anchor.parentElement.removeChild(anchor);
    }
  });

  block.children[selectedIdx].setAttribute('aria-hidden', 'false');
  changeSelectedTab(selectedIdx);
}
