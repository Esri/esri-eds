import {
  sampleRUM,
  buildBlock,
  loadHeader,
  decorateButtons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme as aemDecorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  loadScript, getMetadata,
} from './aem.js';

import {
  div,
  iframe,
  domEl,
  video, source,
} from './dom-helpers.js';

import { filterColor } from './color-filter.js';

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

function decorateLocalNavigation(main) {
  if (getMetadata('localnavigation') === 'true') {
    const section = document.createElement('div');
    section.append(buildBlock('local-navigation', ''));
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

const themeColorMeta = document.querySelector('meta[name="themecolor"]');
// if the meta tag exists, get the content and filter the color
// create the page color theme variables
if (themeColorMeta) {
  const themeColor = themeColorMeta.getAttribute('content');
  let cssFilter = filterColor(themeColor);
  // clearn up cssFilter results
  // remove the string 'filter: ' from the beginning and trailing semicolon
  cssFilter = cssFilter.slice(7);
  cssFilter = cssFilter.slice(0, -1);

  const style = document.createElement('style');
  style.innerHTML = `:root { 
    --theme-color: ${cssFilter};
    --theme-color10: ${cssFilter} opacity(10%);
    --theme-color50: ${cssFilter} opacity(50%);
    }`;
  document.head.appendChild(style);
}

// look for .section data-background-image attribute and add it as a background image
function addBackgroundImageToSection(section) {
  let backgroundImage = section.getAttribute('data-background-image');
  if (backgroundImage) {
    backgroundImage = backgroundImage.replace(/([?&])width=750([&$])/, '$1').replace(/\?$/, '');
    section.style.backgroundImage = `url(${backgroundImage})`;
    section.classList.add('background-image');
  }
}

function addAnimation() {
  // find any element with the class calcite-animate
  const animateElements = document.querySelectorAll('.calcite-animate');

  // add the class animate-slow to each element
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('calcite-animate__in-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  animateElements.forEach((element) => {
    observer.observe(element);
  });
}

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
// If the page has calcite-mode-dark or the meta tag with content set to inverse,
// set all calcite buttons to inverse(black and white)
window.addEventListener('load', () => {
  const main = document.querySelector('main');
  const buttonColorMeta = document.querySelector('meta[name="buttoncolor"]');
  const buttonColor = buttonColorMeta.getAttribute('content');
  if ((main && main.classList.contains('calcite-mode-dark')) || (buttonColorMeta && buttonColor === 'inverse')) {
    const calciteButtons = document.querySelectorAll('calcite-button');
    calciteButtons.forEach((button) => {
      button.setAttribute('kind', 'inverse');
    });
  }
});

export function decorateBlockMode(block) {
  decorateMode(block);
}

/**
 * Creates an autoplayed video element with the given source and optional poster.
 *
 * @param {string} sourceSrc - The source URL of the video.
 * @param {string} [posterSrc=''] - The optional poster image URL for the video.
 * @returns {HTMLElement} The created video element.
 */
export function createAutoplayedVideo(sourceSrc, posterSrc = '') {
  const videoElem = video(
    {
      preload: 'metadata',
      playsinline: '',
      type: 'video/mp4',
    },

    /* add source element with data-src attribute to lazy load the video */
    source({ 'data-src': sourceSrc }),
  );

  if (posterSrc) {
    videoElem.setAttribute('poster', posterSrc);
  }

  /**
   * IntersectionObserver to play or pause a video element based on its visibility.
   * The video element will be played when the intersection ratio exceeds 0.8.
   * Otherwise, the video element will pause.
   * lazy loads the video source when the video is in view
   */

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0.4) {
        if (!videoElem.src) {
          videoElem.src = videoElem.querySelector('source').dataset.src;
        }
        videoElem.muted = true;
        videoElem.play();
      } else {
        videoElem.pause();
      }
    });
  }, { threshold: [0, 0.4] });

  observer.observe(videoElem);

  return videoElem;
}

function decorateModes(main) {
  main.querySelectorAll('.block').forEach(decorateMode);
  main.querySelectorAll('.section').forEach(addBackgroundImageToSection);
}

/**
 * Add <img> for icon, prefixed with codeBasePath and optional prefix.
 * @param {Element} [span] span element with icon classes
 * @param {string} [prefix] prefix to be added to icon src
 * @param {string} [alt] alt text to be added to icon
 */
function decorateIcon(span, prefix = '', alt = '') {
  const iconName = Array.from(span.classList)
    .find((c) => c.startsWith('icon-'))
    .substring(5);
  const img = document.createElement('img');
  img.dataset.iconName = iconName;
  if (iconName.startsWith('product-')) {
    img.src = `https://www.esri.com/content/dam/esrisites/en-us/common/icons/product-logos/${prefix}${iconName.substring(8)}.svg`;
  } else {
    img.src = `https://www.esri.com/content/dam/esrisites/en-us/common/icons/meridian-/${prefix}${iconName}.svg`;
  }
  img.alt = alt;
  img.loading = 'lazy';
  span.append(img);
}

/**
 * Add <img> for icons, prefixed with codeBasePath and optional prefix.
 * @param {Element} [element] Element containing icons
 * @param {string} [prefix] prefix to be added to icon the src
 */
function decorateIcons(element, prefix = '') {
  const icons = [...element.querySelectorAll('span.icon')];
  icons.forEach((span) => {
    decorateIcon(span, prefix);
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */

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
    decorateLocalNavigation(main);
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
  window.setTimeout(() => import('./delayed.js'), 4000);
  // load anything that can be postponed to the latest here
  addAnimation();
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

export {
  decorateIcons,
};
