import { createOptimizedPicture } from '../../scripts/aem.js';
import {
  button, calciteButton, div, li, ul,
} from '../../scripts/dom-helpers.js';
import { loadFragment } from '../fragment/fragment.js';

function urlEncodeTitle(tabTitle) {
  return tabTitle
    .querySelector('button > div > p:last-child')
    .textContent
    .toLowerCase()
    .replace(' ', '-');
}

export default async function decorate(block) {
  block.querySelectorAll('picture > img').forEach((img) => img
    .parentElement
    .replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    ));

  const tabTitles = [...block.children].map((child) => child.children[0]);
  let tabContents = [...block.children].map((child) => [...child.children[1].children]);

  const tabsContainFragments = tabContents.every((content) => {
    if (content.length !== 1) return false;
    if (content[0].childElementCount !== 1) return false;
    if (content[0].children[0].childElementCount !== 0) return false;
    return content[0].children[0].tagName === 'A';
  });

  let contents;
  if (tabsContainFragments) {
    const promises = tabContents.map(async (tabContent, i) => {
      const relativePath = `/${tabContent[0].children[0].href.split('/').slice(3).join('/')}`;
      const content = await loadFragment(relativePath);
      block.children[i].children[1].replaceWith(content);
      return content;
    });

    tabContents = await Promise.all(promises);

    contents = tabContents.map((content) => div({
      class: 'tab-content',
      role: 'tabpanel',
      hidden: '',
    }, content));
  }

  if (!tabsContainFragments) {
    tabContents.forEach((content) => {
      const text = [content[1], content[2], content[3]];
      const textWrapper = div({ class: 'text-wrapper calcite-animate' }, ...text);
      content.splice(1, 3, textWrapper);

      const buttonContainers = [content[2], content[3]];

      const hrefs = [buttonContainers[0].children[0].href, buttonContainers[1].children[0].href];
      const buttons = [
        calciteButton({
          'icon-end': 'play-f',
          href: hrefs[0],
          appearance: 'solid',
          alignment: 'center',
          scale: 'm',
          type: 'button',
          width: 'auto',
          kind: 'inverse',
          color: 'inverse',
        }, buttonContainers[0].textContent),
        calciteButton({
          'icon-end': 'arrowRight',
          href: hrefs[1],
          appearance: 'outline',
          alignment: 'center',
          scale: 'm',
          type: 'button',
          width: 'auto',
          kind: 'inverse',
        }, buttonContainers[1].textContent),
      ];

      const buttonsWrapper = div({ class: 'buttons-wrapper' }, ...buttons);
      content.splice(2, 2, buttonsWrapper);
    });
  }

  if (!tabsContainFragments) {
    contents = tabContents.map((content) => div({
      class: 'tab-content',
      role: 'tabpanel',
      hidden: '',
    }, div({ class: 'grid-container' }, ...content)));
  }
  const titles = tabTitles.map((title) => li({
    class: 'tab-title',
    role: 'tab',
    hidden: '',
  }, button(title)));

  const arrowLeft = calciteButton(
    {
      class: 'arrow-button left',
      label: 'Previous Tab',
      'icon-end': 'chevronLeft',
      scale: 'l',
      kind: 'inverse',
      round: '',
      style: 'position: sticky; top: 50%; transform: translateY(-50%); z-index: 10;',
    },
  );

  const arrowRight = calciteButton(
    {
      class: 'arrow-button right',
      label: 'Next Tab',
      'icon-end': 'chevronRight',
      scale: 'l',
      kind: 'inverse',
      round: '',
      style: 'position: sticky; top: 50%; transform: translateY(-50%); z-index: 10;',
    },
  );

  document.addEventListener('scroll', () => {
    const tabsContainer = block.querySelector('.tab-component');
    const tabsRect = tabsContainer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const topBoundary = viewportHeight * 0.25;
    const bottomBoundary = viewportHeight * 0.75;

    if (tabsRect.top < topBoundary && tabsRect.bottom > bottomBoundary) {
      arrowLeft.style.position = 'fixed';
      arrowRight.style.position = 'fixed';
      arrowLeft.style.top = `${viewportHeight / 2}px`;
      arrowRight.style.top = `${viewportHeight / 2}px`;
    } else if (tabsRect.top >= topBoundary) {
      arrowLeft.style.position = 'fixed';
      arrowRight.style.position = 'fixed';
      arrowLeft.style.top = `${tabsRect.top + viewportHeight * 0.25}px`;
      arrowRight.style.top = `${tabsRect.top + viewportHeight * 0.25}px`;
    } else if (tabsRect.bottom <= bottomBoundary) {
      arrowLeft.style.position = 'fixed';
      arrowRight.style.position = 'fixed';
      arrowLeft.style.top = `${tabsRect.bottom - viewportHeight * 0.25}px`;
      arrowRight.style.top = `${tabsRect.bottom - viewportHeight * 0.25}px`;
    }
  });

  const titleIndex = tabTitles.findIndex((el) => el.textContent.toLowerCase().replace(' ', '-') === window.location.hash.substring(1));
  const realTitleIndex = titleIndex !== -1 ? titleIndex : 0;
  let selectedIdx = window.location.hash !== '' ? realTitleIndex : 0;

  arrowLeft.addEventListener('click', () => {
    const newSelectedIdx = selectedIdx - 1;
    if (newSelectedIdx < 0) return;
    if (newSelectedIdx === 0) arrowLeft.setAttribute('hidden', '');
    arrowRight.removeAttribute('hidden');

    const tabTitle = titles[selectedIdx];
    tabTitle.setAttribute('hidden', '');
    titles[newSelectedIdx].removeAttribute('hidden');

    contents[selectedIdx].setAttribute('hidden', '');
    contents[newSelectedIdx].removeAttribute('hidden');

    selectedIdx = newSelectedIdx;

    window.history.pushState(null, null, `#${urlEncodeTitle(tabTitle)}`);
  });

  arrowRight.addEventListener('click', () => {
    const newSelectedIdx = selectedIdx + 1;
    if (newSelectedIdx >= titles.length) return;
    if (newSelectedIdx === titles.length - 1) arrowRight.setAttribute('aria-hidden', 'true');
    arrowLeft.removeAttribute('hidden');

    const tabTitle = titles[selectedIdx];
    tabTitle.setAttribute('hidden', '');
    titles[newSelectedIdx].removeAttribute('hidden');

    contents[selectedIdx].setAttribute('hidden', '');
    contents[newSelectedIdx].removeAttribute('hidden');

    selectedIdx = newSelectedIdx;

    window.history.pushState(null, null, `#${urlEncodeTitle(tabTitle)}`);
  });

  const tabComponent = div(
    { class: 'tab-component' },
    div(
      { class: 'tab-nav' },
      arrowLeft,
      ul(
        {
          class: 'tab-titles',
          role: 'tablist',
        },
        ...titles,
      ),
      arrowRight,
    ),
    ...contents,
  );

  contents[selectedIdx].removeAttribute('hidden');

  titles.forEach((title, index) => {
    title.addEventListener('click', (e) => {
      e.preventDefault();

      const tabTitle = titles[index];
      titles.forEach((t) => t.setAttribute('aria-selected', 'false'));
      tabTitle.setAttribute('aria-selected', 'true');

      contents[selectedIdx].setAttribute('hidden', '');
      contents[index].removeAttribute('hidden');

      selectedIdx = index;

      window.history.pushState(null, null, `#${urlEncodeTitle(tabTitle)}`);
    });
  });

  const addAccessiblityAttributes = () => {
    if (window.innerWidth >= 1024) {
      titles.forEach((title, index) => {
        title.removeAttribute('hidden');
        title.setAttribute('aria-selected', 'false');
        if (index === selectedIdx) {
          title.setAttribute('aria-selected', 'true');
        }
      });
      arrowLeft.setAttribute('hidden', '');
      arrowRight.setAttribute('hidden', '');
    } else {
      arrowLeft.removeAttribute('hidden');
      arrowRight.removeAttribute('hidden');
      if (selectedIdx === 0) arrowLeft.setAttribute('hidden', '');
      if (selectedIdx === titles.length - 1) arrowRight.setAttribute('hidden', '');

      titles[selectedIdx].removeAttribute('hidden');
      titles.forEach((title, index) => {
        title.removeAttribute('aria-selected');
        if (index !== selectedIdx) {
          title.setAttribute('hidden', '');
        }
      });
    }
  };

  addAccessiblityAttributes();
  window.addEventListener('resize', () => addAccessiblityAttributes());

  block.replaceChildren(tabComponent);
}