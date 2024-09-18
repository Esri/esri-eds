import {
  createOptimizedPicture,
  buildBlock,
  decorateBlock,
  loadBlock,
} from '../../scripts/aem.js';
import {
  calciteButton,
  div,
  ul,
  li,
  button,
} from '../../scripts/dom-helpers.js';
import {
  loadFragment,
} from '../fragment/fragment.js';

export default async function decorate(block) {
  const isTabsCardsVariant = block.classList.contains('tabs-cards-variant');

  block.querySelectorAll('img').forEach((img) => img
    .closest('picture')
    .replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    ));

  const loadBlocks = [];
  const tabTitles = [...block.children].map((child) => child.children[0].children[0].textContent);
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
      'aria-hidden': true,
    }, content));
  }

  if (!isTabsCardsVariant && !tabsContainFragments) {
    tabContents.forEach((content) => {
      const text = [content[1], content[2], content[3]];
      const textWrapper = div({ class: 'text-wrapper' }, ...text);
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
      'aria-hidden': true,
    }, ...content));
  }
  const titles = tabTitles.map((title) => li({
    class: 'tab-title',
    id: title.toLowerCase().replace(' ', '-'),
    role: 'tab',
    'aria-hidden': true,
  }, button(...title)));

  if (isTabsCardsVariant) {
    contents.forEach((content) => {
      const tabsCardsBlock = buildBlock('tabs-cards', [[content.innerHTML]]);
      content.replaceChildren(tabsCardsBlock);
      decorateBlock(tabsCardsBlock);
      loadBlocks.push(loadBlock(tabsCardsBlock));
    });

    await Promise.all(loadBlocks);
  }

  const arrowLeft = calciteButton(
    {
      class: 'arrow-button left',
      label: 'Previous Tab',
      'icon-end': 'chevronLeft',
      scale: 'l',
      kind: 'neutral',
      round: '',
    },
  );

  const arrowRight = calciteButton(
    {
      class: 'arrow-button right',
      label: 'Next Tab',
      'icon-end': 'chevronRight',
      scale: 'l',
      kind: 'neutral',
      round: '',
    },
  );

  const titleIndex = tabTitles.findIndex((el) => el.toLowerCase().replace(' ', '-') === window.location.hash.substring(1));
  const realTitleIndex = titleIndex !== -1 ? titleIndex : 0;
  let selectedIdx = window.location.hash !== '' ? realTitleIndex : 0;

  arrowLeft.addEventListener('click', () => {
    const newSelectedIdx = selectedIdx - 1;
    if (newSelectedIdx < 0) return;
    if (newSelectedIdx === 0) arrowLeft.setAttribute('aria-hidden', 'true');
    arrowRight.setAttribute('aria-hidden', 'false');

    titles[selectedIdx].setAttribute('aria-hidden', 'true');
    titles[newSelectedIdx].setAttribute('aria-hidden', 'false');

    contents[selectedIdx].setAttribute('aria-hidden', 'true');
    contents[newSelectedIdx].setAttribute('aria-hidden', 'false');

    selectedIdx = newSelectedIdx;

    window.history.pushState(null, null, `#${titles[selectedIdx].textContent.toLowerCase().replace(' ', '-')}`);
  });

  arrowRight.addEventListener('click', () => {
    const newSelectedIdx = selectedIdx + 1;
    if (newSelectedIdx >= titles.length) return;
    if (newSelectedIdx === titles.length - 1) arrowRight.setAttribute('aria-hidden', 'true');
    arrowLeft.setAttribute('aria-hidden', 'false');

    titles[selectedIdx].setAttribute('aria-hidden', 'true');
    titles[newSelectedIdx].setAttribute('aria-hidden', 'false');

    contents[selectedIdx].setAttribute('aria-hidden', 'true');
    contents[newSelectedIdx].setAttribute('aria-hidden', 'false');

    selectedIdx = newSelectedIdx;

    window.history.pushState(null, null, `#${titles[selectedIdx].textContent.toLowerCase().replace(' ', '-')}`);
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

  contents[selectedIdx].setAttribute('aria-hidden', 'false');

  titles.forEach((title, index) => {
    title.addEventListener('click', (e) => {
      e.preventDefault();

      if (titles[selectedIdx].hasAttribute('aria-selected')) {
        titles[selectedIdx].setAttribute('aria-selected', 'false');
        titles[index].setAttribute('aria-selected', 'true');
      }

      contents[selectedIdx].setAttribute('aria-hidden', 'true');
      contents[index].setAttribute('aria-hidden', 'false');

      selectedIdx = index;

      window.history.pushState(null, null, `#${titles[index].textContent.toLowerCase().replace(' ', '-')}`);
    });
  });

  const addAccessiblityAttributes = () => {
    if (window.innerWidth >= 1024) {
      titles.forEach((title, index) => {
        title.setAttribute('aria-hidden', 'false');
        title.setAttribute('aria-selected', 'false');
        if (index === selectedIdx) {
          title.setAttribute('aria-selected', 'true');
        }
      });
      arrowLeft.setAttribute('aria-hidden', 'true');
      arrowRight.setAttribute('aria-hidden', 'true');
    } else {
      arrowLeft.setAttribute('aria-hidden', 'false');
      arrowRight.setAttribute('aria-hidden', 'false');
      if (selectedIdx === 0) arrowLeft.setAttribute('aria-hidden', 'true');
      if (selectedIdx === titles.length - 1) arrowRight.setAttribute('aria-hidden', 'true');

      titles[selectedIdx].setAttribute('aria-hidden', 'false');
      titles.forEach((title, index) => {
        title.removeAttribute('aria-selected');
        if (index !== selectedIdx) {
          title.setAttribute('aria-hidden', 'true');
        }
      });
    }
  };

  addAccessiblityAttributes();
  window.addEventListener('resize', () => addAccessiblityAttributes());

  block.replaceChildren(tabComponent);
}
