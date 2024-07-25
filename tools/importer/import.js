/* global WebImporter */

function hero(main, document) {
  const heroContainer = document
    .querySelector('div.hero-banner-global-v2.aem-GridColumn');
  const heroInner = heroContainer.querySelector('.hbg-container--large');

  const backgroundImage = heroInner.querySelector('picture.hbg-container--large--backgroundImage');

  const videoContainer = heroInner.querySelector('.video-container');
  if (videoContainer) {
    // move video to the end of the hero container
    heroInner.append(videoContainer);

    // remove background image as it's the same as the video poster
    backgroundImage.remove();
  } else {
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

function tabs(main, document) {
  main.querySelectorAll('.esri-carousel,.esri-tabs')
    .forEach((container) => {
      const withIcons = container.classList.contains('tab-icons');

      const cells = [...container.querySelectorAll('[role="tabpanel"]')]
        .map((tabContent) => {
          const tabLabelId = tabContent.getAttribute('aria-labelledby');
          const tabName = container.querySelector(`#${tabLabelId}`);

          const tabLabel = document.createElement('div');
          tabLabel.innerHTML = tabName.innerHTML;
          if (withIcons) {
            const tabIcon = tabContent.querySelector('.tab--icon > div');
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
            icon.textContent = `:${iconName}:`;
            tabIcon.remove();
            tabLabel.prepend(icon);
          }

          return [tabLabel, tabContent];
        });

      container.replaceChildren(WebImporter.Blocks.createBlock(document, {
        name: 'tabs',
        cells,
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
  main.querySelectorAll('.card-container-v3')
    .forEach((container) => {
      const cells = [...container.querySelectorAll(':scope > ul > li > article')].map((card) => [card]);
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

function transformUrls(main, document) {
  // load urls from local file (in the filesystem) importer-urls.txt
  const fs = require('node:fs/promises');
  const urls = fs.readFileSync('importer-urls.txt');
  console.log('urls', urls);

  main.querySelectorAll('a')
    .forEach((a) => {
      const href = a.getAttribute('href');
      if (href.startsWith('/')) {
        console.log('link', a.textContent, 'href', href, 'attribute href', href);
      }
    });
}

function transformers(main, document) {
  videos(main, document);
  calciteButton(main, document);
  hero(main, document);
  storyteller(main, document);
  tabs(main, document);
  mediaGallery(main, document);
  cards(main, document);
  callToAction(main, document);
  transformUrls(main, document);
}

export default {
  transformDOM: ({ document }) => {
    const main = document.querySelector('main');
    // remove header and footer from main
    WebImporter.DOMUtils.remove(main, [
      'header',
      'footer',
      '.disclaimer',
    ]);

    transformers(main, document);

    return main;
  },
};
