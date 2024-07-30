/* global WebImporter */

import urls from './urls.js';

function hero(main, document) {
  const heroContainer = document
    .querySelector('div.hero-banner-global-v2.aem-GridColumn');
  if (!heroContainer) {
    return;
  }
  const heroInner = heroContainer.querySelector('.hbg-container');

  const backgroundImage = heroInner.querySelector('picture.hbg-container--large--backgroundImage');

  const videoContainer = heroInner.querySelector('.video-container');
  if (videoContainer) {
    // move video to the end of the hero container
    heroInner.append(videoContainer);

    // remove background image as it's the same as the video poster
    backgroundImage.remove();
  } else if (backgroundImage) {
    heroInner.append(backgroundImage);
  }

  heroContainer.replaceWith(WebImporter.Blocks.createBlock(document, {
    name: 'hero',
    cells: [[heroInner]],
  }));
}

function videos(main, document) {
  main.querySelectorAll('video')
    .forEach((video) => {
      const videoSrc = video.getAttribute('data-video-src');
      const videoPoster = video.getAttribute('poster');

      const videoLink = document.createElement('a');
      videoLink.setAttribute('href', videoSrc);
      videoLink.textContent = videoSrc;

      const img = document.createElement('img');
      img.setAttribute('src', videoPoster);

      const div = document.createElement('div');
      div.classList.add('video-container');
      div.appendChild(videoLink);
      div.appendChild(img);

      video.replaceWith(div);
    });
}

function calciteButton(main, document) {
  main.querySelectorAll('calcite-button')
    .forEach((button) => {
      const link = document.createElement('a');
      link.setAttribute('href', button.getAttribute('href'));
      link.textContent = button.textContent;
      button.replaceWith(link);
    });
}

function storyteller(main, document) {
  main.querySelectorAll('.storyteller__container')
    .forEach((container) => {
      const [leftChild, rightChild] = [...container.children];
      let cells = [[leftChild, rightChild]];
      if (!container.closest('.storyteller').classList.contains('st-content--left')) {
        cells = [[rightChild, leftChild]];
      }

      container.replaceChildren(WebImporter.Blocks.createBlock(document, {
        name: 'storyteller',
        cells,
      }));
    });
}

function createIcon(iconName, originalURL) {
  const icon = document.createElement('span');
  icon.className = 'aem-icon';
  icon.textContent = `:${iconName}:`;
  icon.setAttribute('icon-name', iconName);
  icon.setAttribute('data-original-url', `${WebImporter.FileUtils.sanitizePath(originalURL)}`);

  return icon;
}

function getCardArrayFromContainer(container, document) {
  return [...container.querySelectorAll(':scope > ul > li > article')]
    .map((card) => {
      if (card.children.length === 1 && card.children[0].tagName === 'A') {
        const link = card.children[0];
        const newCard = document.createElement('div');
        const newLink = document.createElement('a');
        const href = link.getAttribute('href');
        newLink.setAttribute('href', href);
        newLink.textContent = href;
        newCard.append(newLink, ...link.children);
        return newCard;
      }
      return card;
    });
}

function tabs(main, document) {
  main.querySelectorAll('.esri-carousel,.esri-tabs')
    .forEach((container) => {
      const withIcons = container.classList.contains('tab-icons');
      let withCards = false;

      const cells = [...container.querySelectorAll('[role="tabpanel"]')]
        .map((tabContent) => {
          const tabLabelId = tabContent.getAttribute('aria-labelledby');
          const tabName = container.querySelector(`#${tabLabelId}`);
          const tabLabel = document.createElement('div');
          tabLabel.innerHTML = tabName.innerHTML;

          if (withIcons) {
            const tabIcon = tabContent.querySelector('.tab--icon > div');
            if (tabIcon) {
              const svgFileName = tabIcon.getAttribute('data-asset');
              // example path: /content/dam/esrisites/en-us/common/icons/meridian-/search-48.svg
              // get "search" from the path
              const iconName = svgFileName
                .split('/')
                .pop()
                .split('-')
                .slice(0, -1)
                .join('-');
              const icon = document.createElement('p');
              icon.append(createIcon(iconName, tabIcon.getAttribute('data-asset')));
              tabIcon.remove();
              tabLabel.prepend(icon);
            }
          }

          const cardsContainer = tabContent.querySelector('.card-container-v3');
          if (cardsContainer) {
            withCards = true;
            const cardArray = getCardArrayFromContainer(cardsContainer, document);

            return [tabLabel, cardArray];
          }

          return [tabLabel, tabContent];
        });

      container.replaceChildren(WebImporter.Blocks.createBlock(document, {
        name: 'tabs',
        cells,
        variants: withCards ? ['cards'] : [],
      }));
    });
}

function mediaGallery(main, document) {
  main.querySelectorAll('.media-gallery')
    .forEach((container) => {
      const mgCards = [...container.querySelectorAll('.mg__card')];
      const cells = mgCards.map((card) => {
        const wrapper = card.querySelector('.mg-card__wrapper');
        const href = wrapper.getAttribute('data-href');

        const link = document.createElement('a');
        link.setAttribute('href', href);
        link.textContent = href;

        card.append(link);

        return [card];
      });

      const variants = [];
      if (mgCards.length > 2 && mgCards[0].getAttribute('attr-width') === '2' && mgCards[1].getAttribute('attr-width') === '1') {
        variants.push('alternate-2-1');
      }

      container.replaceWith(WebImporter.Blocks.createBlock(document, {
        name: 'media-gallery',
        cells,
        variants,
      }));
    });
}

function cards(main, document) {
  main.querySelectorAll('.block-group')
    .forEach((container) => {
      const cells = [...container.querySelectorAll('.block')]
        .map((block) => [block]);

      container.replaceWith(WebImporter.Blocks.createBlock(document, {
        name: 'cards',
        cells,
        variants: ['Block group'],
      }));
    });

  main.querySelectorAll('.card-container-v3')
    .forEach((container) => {
      const cells = getCardArrayFromContainer(container, document).map((card) => [card]);
      if (!cells) {
        throw new Error('No cards found', container.outerHTML);
      }

      container.replaceWith(WebImporter.Blocks.createBlock(document, {
        name: 'cards',
        cells,
      }));
    });
}

function callToAction(main, document) {
  main.querySelectorAll('.cta-questions_primary-dbl-button-column-container')
    .forEach((container) => {
      const children = [...container.children];
      if (children.length !== 3) {
        throw new Error('callToAction expected 3 children', container.outerHTML);
      }
      container.replaceWith(
        WebImporter.Blocks.createBlock(document, {
          name: 'Call to action',
          cells: [[children[0], children[2]]],
        }),
      );
    });
}

function transformUrls(main) {
  // load urls from local file (in the filesystem) importer-urls.txt
  const urlPathnames = urls.map((url) => new URL(url).pathname);

  main.querySelectorAll('a')
    .forEach((a) => {
      const href = a.getAttribute('href');
      if (!href.startsWith('/')) {
        return;
      }

      if (!urlPathnames.includes(href)) {
        a.setAttribute('href', urls[urlPathnames.indexOf(href)]);
      }
    });
}

const extraPages = {};

function getPath(params) {
  return new URL(params.originalURL).pathname.replace(/\/$/, '')
    .replace(/\.html$/, '');
}

function map(main, document, params) {
  main.querySelectorAll('.raw-html-for-js-app').forEach((rawHtmlForJsApp) => {
    if (!rawHtmlForJsApp.querySelector('#eam-map-wrapper')) {
      console.error('eam-map-wrapper not found in raw-html-for-js-app', rawHtmlForJsApp);
      return;
    }

    main.querySelector('a#returnBtn').remove();
    main.querySelector('a#fullScreenButton').remove();

    const path = getPath(params);

    const link = document.createElement('a');
    link.setAttribute('href', path);
    link.textContent = path;

    rawHtmlForJsApp.replaceWith(WebImporter.Blocks.createBlock(document, {
      name: 'map',
      cells: [[link]],
    }));
  });
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + char;
  }
  // Convert to 32bit unsigned integer in base 36 and pad with "0" to ensure length is 7.
  // eslint-disable-next-line no-bitwise
  return (hash >>> 0).toString(36).padStart(7, '0');
}

function anonymousIcons(main) {
  const iconNames = {
    '1oevmje': 'thumbsup',
    '0erguqf': 'locations',
    '0bg3tpq': 'employees',
    '1eovq9a': 'handshake',
    '1ao49og': 'headset',
    '0sr5z39': 'lightbulb',
  };

  const foundIcons = {};

  main.querySelectorAll('.esri-text__iconContainer > svg')
    .forEach((icon) => {
      const iconHash = hashCode(icon.outerHTML);
      let iconName = iconNames[iconHash];
      if (!iconName) {
        console.error('Unknown icon hash', iconHash, icon);
        iconName = iconHash;
        // throw new Error(`Unknown icon hash: ${iconHash}`);
      }

      // remove icon class and id
      icon.removeAttribute('class');
      icon.removeAttribute('id');

      foundIcons[iconName] = icon.outerHTML;

      icon.outerHTML = `:${iconName}:`;
    });

  return foundIcons;
}

function transformers(main, document, params) {
  const report = {
    icons: anonymousIcons(main),
  };

  videos(main, document);
  calciteButton(main, document);
  hero(main, document);
  storyteller(main, document);
  tabs(main, document);
  mediaGallery(main, document);
  cards(main, document);
  callToAction(main, document);
  map(main, document, params);
  transformUrls(main);

  return report;
}

export default {
  transform: ({ document, params }) => {
    const main = document.querySelector('main');
    // remove header and footer from main
    WebImporter.DOMUtils.remove(main, [
      'header',
      'footer',
      '.disclaimer',
    ]);

    const report = transformers(main, document, params);

    const pages = [{
      element: main,
      path: getPath(params),
      report,
    }];

    // main.querySelectorAll('span.aem-icon').forEach((icon) => {
    //   const originalURL = icon.getAttribute('data-original-url');
    //   const iconName = icon.getAttribute('icon-name');
    //   // console.log('detected span.aem-icon', icon, originalURL);
    //   console.log('from url', iconName, originalURL);
    //   pages.push({
    //     from: originalURL,
    //     path: `icons/${iconName}.svg`,
    //   });
    // });

    if (extraPages.css) {
      // pages.push({
      //   element: extraPages.css,
      //   path: `${path}/styles.css`,
      // });
    }

    return pages;
  },
};
