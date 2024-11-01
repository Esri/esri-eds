import {
  sampleRUM,
  buildBlock,
  loadHeader,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme as aemDecorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  loadScript,
} from './aem.js';

import { div, iframe, domEl } from './dom-helpers.js';

const LCP_BLOCKS = ['header']; // add your LCP blocks to the list

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Opens an iframe with the video when clicking on anchor tags.
 * @param {Element} element container element
 */
function decorateVideoLinks(element) {
  const anchors = element.querySelectorAll('a');
  anchors.forEach((a) => {
    // change urls to be allowed to be embedded
    if (a.href.startsWith('https://youtu.be')) {
      a.href = a.href.replace('youtu.be', 'www.youtube.com/embed');
    }

    if (a.href.startsWith('https://mediaspace.esri.com/media/t/')) {
      a.href = a.href.replace('/media/t/', '/embed/secure/iframe/entryId/');
    }

    if (
      a.href.startsWith('https://mediaspace.esri.com/')
   || a.href.startsWith('https://www.youtube.com/')
    ) {
      a.classList.add('video-link');
      const closeButton = div(
        {
          class: 'video-close-button',
        },
        domEl('calcite-icon', {
          icon: 'x',
          tabindex: '0',
          scale: 'l',
          alignment: 'center',
          'aria-hidden': 'true',
        }),
      );
      const ifr = div(
        {
          class: 'video-iframe-box',
        },
        div(
          { class: 'video-iframe-wrapper' },
          iframe({
            src: a.href,
            class: 'video-iframe',
            scrolling: 'no',
            sandbox: 'allow-forms allow-same-origin allow-scripts allow-top-navigation allow-pointer-lock allow-popups allow-modals allow-orientation-lock allow-popups-to-escape-sandbox allow-presentation allow-top-navigation-by-user-activation',
            allow: 'autoplay *; fullscreen *; encrypted-media *',
            loading: 'lazy',
          }),
          closeButton,
        ),
      );

      a.addEventListener('click', (event) => {
        event.preventDefault();
        document.body.append(ifr);
        document.body.style.overflow = 'hidden';
      });

      const closeIframe = (event) => {
        event.preventDefault();
        event.stopPropagation();
        ifr.remove();
        document.body.style.overflow = 'auto';
      };

      closeButton.addEventListener('click', closeIframe);
      ifr.addEventListener('click', closeIframe);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

const calciteModes = ['light', 'dark', 'gray'];

function decorateBodyMode() {
  const { classList } = document.body;
  const main = document.body.querySelector('main');

  calciteModes.forEach((mode) => {
    if (classList.contains(mode)) {
      main.classList.add(`calcite-mode-${mode}`);
    }
  });
}

function decorateMode(element) {
  const { classList } = element;
  calciteModes.forEach((mode) => {
    if (classList.contains(mode)) {
      classList.add(`calcite-mode-${mode}`);
    }
  });
}

export function decorateBlockMode(block) {
  decorateMode(block);
}

function decorateModes(main) {
  main.querySelectorAll('.block').forEach(decorateMode);
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateModes(main);
  decorateVideoLinks(main);
}

export function decorateTemplateAndTheme() {
  aemDecorateTemplateAndTheme();
  decorateBodyMode();
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  loadScript('https://js.arcgis.com/calcite-components/1.8.0/calcite.esm.js', { type: 'module' });
  loadCSS('https://js.arcgis.com/calcite-components/1.8.0/calcite.css');

  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 4000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

export function decorateInnerHrefButtonsWithArrowIcon(block) {
  block.querySelectorAll('a').forEach((a) => {
    const icon = domEl('calcite-icon', { class: 'default-arrow-right', icon: 'arrowRight', scale: 's' });
    if (a.href.includes('esri.com') || (a.href.includes('esri--aemsites'))) {
      a.appendChild(icon);
    }
  });
}

loadPage();