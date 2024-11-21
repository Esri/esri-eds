/* global WebImporter */
import urls from './urls.js';
import svgs from './svgs.js';

let report = {};
let fragmentPages = [];
let theme = '';
const edsUrl = 'https://main--esri--aemsites.aem.live';

function toClassName(name) {
  return typeof name === 'string'
    ? name
      .toLowerCase()
      .replace(/[^0-9a-z]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    : '';
}

function getBreadcrumbs(html, pathname) {
  const parser = new DOMParser();
  const parsedHtml = parser.parseFromString(html, 'text/html');
  const breadcrumbsEl = parsedHtml.querySelector('#breadcrumbs');
  const breadcrumbsContent = JSON.parse(breadcrumbsEl.textContent);
  const breadcrumbsArray = breadcrumbsContent.itemListElement;
  // removing the extra "Europe" at the end of the breadcrumbs
  if (pathname.endsWith('/about/about-esri/europe/overview')) {
    breadcrumbsArray.pop();
  }

  const root = 'https://www.esri.com';
  const urlPrefix = `${root}${pathname.substring(6)}`;
  let accumulatedUrl = '';
  const breadcrumbs = [];
  let lastMismatch;
  for (let i = 0; i < breadcrumbsArray.length; i += 1) {
    const currentElement = breadcrumbsArray[i];
    const breadcrumbsName = currentElement.name;
    breadcrumbs.push(breadcrumbsName);

    const accBreadcrumbs = breadcrumbs.join(',');
    accumulatedUrl += `/${toClassName(breadcrumbsName)}`;
    const currentAccUrl = urlPrefix + accumulatedUrl;
    if (currentAccUrl !== currentElement.item) {
      if (i >= breadcrumbsArray.length - 1) {
        if (currentElement.item === root + pathname) {
          break;
        }
        console.error('Last breadcrumb does not match', currentAccUrl, currentElement.item);
        // throw new Error('Last breadcrumb does not match');
      }

      console.error('Breadcrumb mismatch', accBreadcrumbs, breadcrumbsArray);

      if (!report.breadcrumbs_mismatch) {
        report.breadcrumbs_mismatch = {};
      }

      const currentElementUrl = new URL(currentElement.item);
      const currentMismatch = currentElementUrl.pathname.substring(6);

      if (lastMismatch !== currentMismatch) {
        report.breadcrumbs_mismatch[accBreadcrumbs] = currentMismatch;
        lastMismatch = currentMismatch;
      }
    }
  }

  return breadcrumbs;
}

function createMetadata(main, document, pathname, html) {
  const meta = {};

  const urlInfo = urls.find(({ URL: url }) => (new URL(url).pathname) === pathname);
  meta.Theme = urlInfo.Theme;
  theme = meta.Theme;

  meta.Title = document.querySelector('meta[property="og:title"]').content;
  meta.Description = document.querySelector('meta[property="og:description"]').content;
  meta.Breadcrumbs = getBreadcrumbs(html, pathname).join(', ');

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);
}

function hasCalciteMode(container, mode) {
  const modeClass = `.calcite-mode-${mode}`;
  return container.closest(modeClass) || container.querySelector(modeClass);
}

function getCalciteMode(container) {
  const modes = ['gray', 'light', 'dark'].filter((mode) => mode !== theme);

  return modes.find((mode) => hasCalciteMode(container, mode));
}

function decorateVariants(container, variants) {
  const calciteMode = getCalciteMode(container);
  if (calciteMode) {
    variants.push(calciteMode);
  }
}

function createBlock(container, document, name, cells, variants = []) {
  decorateVariants(container, variants);

  report[name] ??= new Set();
  const blockReport = report[name];
  variants.forEach((variant) => blockReport.add(variant));

  const hasEmbeddedBlock = container.querySelector('table');
  const closestBlock = container.closest('table');
  if (hasEmbeddedBlock || closestBlock) {
    if (!report.embeddedBlocks) {
      report.embeddedBlocks = [];
    }
    report.embeddedBlocks.push(name);
    if (hasEmbeddedBlock) {
      console.error(`Block "${name}" has block embedded in it`, hasEmbeddedBlock, cells);
    } else {
      console.error(`Block "${name}" is embedded in another block`, closestBlock, cells);
    }
  }

  container.replaceWith(WebImporter.Blocks.createBlock(document, {
    name,
    cells,
    variants,
  }));
}

function hero(main, document) {
  const heroContainer = document
    .querySelector('div.hero-banner-global-v2.aem-GridColumn');
  if (!heroContainer) {
    return;
  }
  const heroInner = heroContainer.querySelector('.hbg-container');
  const sizeClass = Array.from(heroInner.classList).find((className) => className.startsWith('hbg-container--'));

  const backgroundImage = heroInner.querySelector(`picture.${sizeClass}--backgroundImage`);

  const videoContainer = heroInner.querySelector('.video-container');
  videoContainer?.querySelector('img').remove();

  const heroParts = {
    content: heroInner.querySelector(`.${sizeClass}--left`),
    image: heroInner.querySelector(`.${sizeClass}--right`) ?? '',
    video: videoContainer ?? '',
    backgroundImage,
  };
  if (!heroParts.content) {
    console.log('Hero parts not found', heroParts);
    throw new Error('Hero parts not found');
  }

  const cells = Object.entries(heroParts).map(([key, value]) => [[key], [value]]);

  createBlock(heroContainer, document, 'hero', cells);
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
      const href = button.getAttribute('href');
      if (!href) {
        return;
      }

      const link = document.createElement('a');
      link.setAttribute('href', href);

      link.textContent = button.textContent;
      if (!button.textContent.trim()) {
        link.textContent = href;
      }
      switch (button.getAttribute('appearance')) {
        case 'solid':
          button.replaceWith(link);
          break;
        case 'outline':
          // eslint-disable-next-line no-case-declarations
          const em = document.createElement('em');
          em.append(link);
          button.replaceWith(em);
          break;
        default:
          console.error('Unknown calcite-button appearance', button.outerHTML);
          throw new Error('Unknown calcite-button appearance');
      }
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

      createBlock(container, document, 'storyteller', cells);
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
  return [...container.querySelectorAll(':scope > li > article')]
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

function tabs(main, document, pathname) {
  main.querySelectorAll('.esri-carousel,.esri-tabs')
    .forEach((container) => {
      const withIcons = container.classList.contains('tab-icons');
      const withCards = false;

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
              const iconName = svgFileName
                .split('/')
                .pop()
                .split('.')
                .slice(0, -1)
                .join('.');
              const icon = document.createElement('p');
              icon.append(createIcon(iconName, tabIcon.getAttribute('data-asset')));
              tabIcon.remove();
              tabLabel.prepend(icon);
            }
          }

          const tabContentTable = tabContent.querySelector('table');
          if (tabContentTable) {
            const tabPathname = `${pathname}/tabs/${toClassName(tabLabel.textContent)}`;

            const link = document.createElement('a');
            const url = edsUrl + tabPathname;
            link.setAttribute('href', url);
            link.textContent = url;
            const wrapper = document.createElement('div');
            wrapper.append(...tabContent.children);
            tabContent.replaceChildren(link);

            fragmentPages.push({
              element: wrapper,
              path: tabPathname,
            });
          }

          return [tabLabel, tabContent];
        });

      createBlock(container, document, 'tabs', cells, withCards ? ['cards'] : []);
    });
}

function createLink(document, href) {
  const url = (href.startsWith('/')) ? `https://www.esri.com${href}` : href;
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.textContent = url;

  return link;
}

function mediaGallery(main, document) {
  main.querySelectorAll('.media-gallery')
    .forEach((container) => {
      const mgCards = [...container.querySelectorAll('.mg__card')];
      const cells = mgCards
        .filter((card) => card.querySelector('.mg-card__wrapper'))
        .map((card) => {
          const wrapper = card.querySelector('.mg-card__wrapper');
          const href = wrapper.getAttribute('data-href') ?? wrapper.getAttribute('href');

          if (wrapper.tagName === 'A') {
            const div = document.createElement('div');
            div.append(...wrapper.children);
            wrapper.replaceWith(div);
          }
          const link = createLink(document, href);

          card.append(link);

          return [card];
        });

      function getCardWidth(card) {
        const firstChild = card.firstElementChild;
        return firstChild.getAttribute('data-card-width');
      }

      const variants = [];
      if (mgCards.length > 2 && getCardWidth(mgCards[0]) === '2' && getCardWidth(mgCards[1]) === '1') {
        variants.push('alternate-2-1');
      }

      createBlock(container, document, 'media-gallery', cells, variants);
    });
}

function cards(main, document) {
  main.querySelectorAll('.block-group')
    .forEach((container) => {
      const cells = [...container.querySelectorAll('.block')]
        .map((block) => [block]);

      createBlock(container, document, 'cards', cells, ['Block group']);
    });

  main.querySelectorAll('.card-container-v3 > ul')
    .forEach((container) => {
      const cells = getCardArrayFromContainer(container, document).map((card) => {
        const category = card.querySelector('.esri-text__category');
        if (category) {
          category.textContent = category.textContent.toUpperCase();
          // append after card's first child
          card.children[0].after(category);
        }

        return [card];
      });
      if (!cells) {
        throw new Error('No cards found', container.outerHTML);
      }

      const withVideo = cells.some((row) => row[0]
        .querySelector(':scope > a:first-child')
        ?.getAttribute('href')
        .startsWith('https://youtu.be/'));

      let blockName = 'cards';
      if (withVideo) {
        blockName = 'Video cards';
      }

      const variants = [];
      container.classList.forEach((className) => {
        if (className.startsWith('cardsPerRow-')) {
          variants.push(className.toLowerCase());
        }
      });

      createBlock(container, document, blockName, cells, variants);
    });
}

function callToAction(main, document, pathname) {
  main.querySelectorAll('.cta-questions')
    .forEach((container) => {
      const primaryDblContainer = container.querySelector('.cta-questions_primary-dbl-button-column-container');
      if (primaryDblContainer) {
        const children = [...primaryDblContainer.children];
        if (children.length !== 3) {
          throw new Error('callToAction expected 3 children', primaryDblContainer.outerHTML);
        }
        createBlock(primaryDblContainer, document, 'Call to action', [[children[0], children[2]]]);
      } else {
        const hasEmbeddedBlock = container.querySelector('table');
        if (hasEmbeddedBlock) {
          const fragmentPathname = `${pathname}/call-to-action`;

          const link = document.createElement('a');
          const url = edsUrl + fragmentPathname;
          link.setAttribute('href', url);
          link.textContent = url;
          const wrapper = document.createElement('div');
          wrapper.append(...container.children);
          container.replaceChildren(link);

          fragmentPages.push({
            element: wrapper,
            path: fragmentPathname,
          });
        }
        createBlock(container, document, 'Call to action', [...container.children].map((child) => [child]));
      }
    });
}

function transformUrls(main) {
  const urlPathnames = urls.map(({ URL: url }) => new URL(url).pathname);

  main.querySelectorAll('a')
    .forEach((a) => {
      const href = a.getAttribute('href');
      if (!href.startsWith('/')) {
        return;
      }

      if (!urlPathnames.includes(href)) {
        const newUrl = `https://www.esri.com${href}`;
        a.setAttribute('href', newUrl);
        const trimmedContent = a.textContent.trim();
        if (trimmedContent === '' || trimmedContent === href) {
          a.textContent = newUrl;
        }
      }
    });
}

function map(main, document, pathname) {
  const mapsMapping = {
    '/about/about-esri/mea-central-asia': 'https://webapps-cdn.esri.com/Apps/regional-maps/mea.html',
    '/about/about-esri/asia-pacific': 'https://webapps-cdn.esri.com/Apps/regional-maps/asiapacific.html',
    '/about/about-esri/americas': 'https://webapps-cdn.esri.com/Apps/regional-maps/americas.html',
    '/about/about-esri/europe/overview': 'https://webapps-cdn.esri.com/Apps/regional-maps/europe.html',
  };

  main.querySelectorAll('.raw-html-for-js-app').forEach((rawHtmlForJsApp) => {
    if (!rawHtmlForJsApp.querySelector('#eam-map-wrapper')) {
      console.error('eam-map-wrapper not found in raw-html-for-js-app', rawHtmlForJsApp);
      return;
    }

    const noLangPathname = pathname.replace(/\/[a-z]{2}-[a-z]{2}\//, '/');
    const mapUrl = mapsMapping[noLangPathname];
    if (!mapUrl) {
      console.error('No map URL found for pathname', noLangPathname, pathname);
      return;
    }

    main.querySelector('a#returnBtn').remove();
    main.querySelector('a#fullScreenButton').remove();

    const textContainer = rawHtmlForJsApp.closest('.aem-GridColumn').querySelector('.cmp-container .cmp-container');
    const wrapper = document.createElement('div');
    wrapper.append(textContainer);

    const link = document.createElement('a');
    link.setAttribute('href', mapUrl);
    link.textContent = mapUrl;
    wrapper.append(link);

    createBlock(rawHtmlForJsApp, document, 'map', [[wrapper]]);
  });
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + char;
  }
  // eslint-disable-next-line no-bitwise
  return (hash >>> 0).toString(36).padStart(7, '0');
}

function findIcon(iconNode) {
  const iconName = svgs.find(({ contents }) => {
    const div = document.createElement('div');
    div.innerHTML = contents;
    const testSvg = div.querySelector(':scope > svg');

    return testSvg.outerHTML === iconNode.outerHTML;
  })?.name;

  return iconName;
}

function inlineIcons(main, html) {
  const themeColorRegex = /--theme-color: (#[0-9a-fA-F]{6});/g;
  const themeColorMatch = themeColorRegex.exec(html);
  const themeColor = themeColorMatch[1];

  const foundIcons = [];
  const notFoundIcons = [];

  main.querySelectorAll('.esri-text__iconContainer > svg, .esri-text__iconContainer > span > svg, .ecs__panel__icon > svg')
    .forEach((icon) => {
      const path = icon.querySelector('path');
      let color = path.style.fill;
      if (!path.style.fill) {
        color = themeColor;
      }

      icon.removeAttribute('class');

      let iconName = findIcon(icon);
      if (!iconName) {
        const iconHash = hashCode(icon.outerHTML);
        console.error('Unknown icon hash', iconHash, icon);
        iconName = `pending-${iconHash}`;
        notFoundIcons.push({
          name: iconName,
          icon: icon.outerHTML,
        });
      } else {
        foundIcons.push({
          name: iconName,
          color,
        });
      }
      icon.outerHTML = `:${iconName}:`;
    });

  report.amountFoundIcons = foundIcons.length;
  report.foundIcons = foundIcons;
  report.amountNofFoundIcons = notFoundIcons.length;
  report.notFoundIcons = notFoundIcons;
}

function quote(main, document) {
  document.querySelectorAll('.quote').forEach((quoteEl) => {
    const container = quoteEl.closest('.column-24');
    if (!container) {
      throw new Error(`quote not in column-24${quoteEl.outerHTML}`);
    }

    const cells = [[...container.children]];

    createBlock(container, document, 'quote', cells);
  });
}

function columns(main, document) {
  main.querySelectorAll('.fifty-fifty_container')
    .forEach((container) => {
      const children = [...container.children];
      if (children.length !== 2) {
        throw new Error('fifty-fifty_container expected 2 children');
      }
      let columnElements = children;
      if (container.classList.contains('fifty-fifty_container--content-end')) {
        if (columnElements[0].classList.contains('fifty-fifty_content')) {
          columnElements = columnElements.reverse();
        }
      }

      createBlock(container, document, 'Columns', [columnElements]);
    });

  main.querySelectorAll('.media-text-split .mts-media-text-split').forEach((container) => {
    const children = [...container.children];
    if (container.getAttribute('data-direction') === 'right') {
      children.reverse();
    }

    if (children.length !== 2) {
      throw new Error('media-text-split expected 2 children');
    }
    createBlock(container, document, 'columns', [children], ['Media split']);
  });
}

function mosaicReveal(main, document) {
  main.querySelectorAll('.mosaic-reveal > .mosaic-reveal > .mosaic-reveal_mosaics')
    .forEach((container) => {
      container.classList.remove('calcite-mode-dark');
      const cells = [...container.children]
        .map((mosaic) => {
          const imageUrl = mosaic.getAttribute('data-lazy-image');
          const backgroundImage = document.createElement('img');
          backgroundImage.src = imageUrl;
          const mosaicRevealContent = mosaic.querySelector(':scope > .mosaic-reveal_content');

          return [backgroundImage, mosaicRevealContent];
        });

      createBlock(container, document, 'Mosaic reveal', cells);
    });
}

function sections(main, document) {
  main.querySelectorAll(':scope > .aem-Grid > .aem-GridColumn').forEach((section) => {
    const sectionStyles = [];
    if (section.children.length === 1) {
      const child = section.firstElementChild;
      if (child.classList.contains('text-center')) {
        sectionStyles.push('centered');
      }
    }

    const sectionDivs = [...section.querySelectorAll(':scope > div')];
    if (sectionDivs.length > 1) {
      console.error('Section has multiple divs', sectionDivs);
      throw new Error('Section has multiple divs');
    }

    const classPrefixes = [
      'leader-',
      'trailer-',
      'padding-leader-',
      'padding-trailer-',
      'column-',
      'pre-',
      'post-',
    ];

    const firstDiv = sectionDivs[0];

    const { classList } = firstDiv;
    classPrefixes.forEach((prefix) => {
      classList.forEach((className) => {
        if (className.startsWith(prefix) && className.length > prefix.length) {
          sectionStyles.push(className);
        }
      });
    });

    if (sectionStyles.length > 0) {
      section.append(WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { Style: sectionStyles.join(', ') },
      }));
    }
  });

  main.querySelectorAll(':scope > .aem-Grid > .aem-GridColumn:not(:last-child)').forEach((section) => {
    if (section.textContent.trim() === '') {
      section.remove();
    } else {
      const hr = document.createElement('hr');
      section.after(hr);
    }
  });
}

function links(main, document) {
  main.querySelectorAll('calcite-link')
    .forEach((link) => {
      const a = document.createElement('a');
      const href = link.getAttribute('href');
      a.setAttribute('href', href);
      a.textContent = link.textContent;
      // TOOD add later on if we see the need for it
      // if (link.getAttribute('icon-end') === 'arrowRight') {
      //   a.textContent += ' :arrow-right:';
      // }
      link.replaceWith(a);
    });
}

function localNavigation(main, document) {
  const container = document.querySelector('.local-navigation.aem-GridColumn');
  if (container) {
    createBlock(container, document, 'Local navigation', [['']]);
  }
}

function newsletter(main, document) {
  const newsletterContainer = document.querySelector('aside#side-drawer');
  if (newsletterContainer) {
    const newsletterIframeSrc = newsletterContainer.querySelector('iframe').getAttribute('data-src');
    const newsletterIframeUrl = `https://www.esri.com/${newsletterIframeSrc}`;
    const newsletterLink = document.createElement('a');
    newsletterLink.setAttribute('href', newsletterIframeUrl);
    newsletterLink.textContent = newsletterIframeUrl;

    main.append(WebImporter.Blocks.createBlock(document, {
      name: 'newsletter',
      cells: [[newsletterLink]],
    }));

    newsletterContainer.closest('.aem-GridColumn.experiencefragment').remove();
  }
}

function switchers(main, document) {
  main.querySelectorAll('.centered-content-switcher_wrapper')
    .forEach((container) => {
      const cells = [...container.querySelectorAll(':scope > section')].map((section, idx) => {
        const div = document.createElement('div');
        const contentSwitcherInfo = section.querySelector('.centered-content-switcher_info');
        if (!contentSwitcherInfo.querySelector('.esri-text__category')) {
          const categoryByHref = {
            'https://youtu.be/Yv5_lLlmvPY?co3=true': 'Video',
          };
          const href = section.querySelector('.calcite-button-wrapper').getAttribute('data-href');
          const category = categoryByHref[href];
          if (category) {
            const categoryEl = document.createElement('div');
            categoryEl.textContent = category;
            contentSwitcherInfo.prepend(categoryEl);
          }
        }
        div.append(contentSwitcherInfo);

        const imageUrl = section.getAttribute('data-lazy-image');
        const backgroundImage = document.createElement('img');
        backgroundImage.src = imageUrl;

        const options = [...section.querySelector('.centered-content-switcher_options').children];
        const img = options[idx].querySelector('img.centered-content-switcher_thumb');
        div.append(img);

        return [div, backgroundImage];
      });
      createBlock(container, document, 'Centered content switcher', cells);
    });

  main.querySelectorAll('.aem-GridColumn.largeimageswitcher > .c-image-switcher').forEach((container) => {
    const contentContainer = container.querySelector('.c-image-switcher-content-container');

    const switcherLinks = contentContainer.querySelector('.c-image-switcher-links');
    switcherLinks.remove();

    const variants = [];
    if (container.classList.contains('c-image-switcher--flip')) {
      variants.push('flip');
    }

    const cells = [[contentContainer]];
    cells.push(...[...switcherLinks.children].map((link) => {
      const thumbnail = link.querySelector('img');

      const linkNumber = link.getAttribute('data-component-link-placement');
      const imageWrapper = container.querySelector(`#image${linkNumber}`);
      imageWrapper.append(thumbnail);

      const backgroundPicture = imageWrapper.querySelector('picture');
      backgroundPicture.remove();

      return [imageWrapper, backgroundPicture];
    }));

    createBlock(container, document, 'Image switcher', cells, variants);
  });
}

function elasticContentStrip(main, document) {
  main.querySelectorAll('.elastic-content-strip > .ecs__wrapper > .ecs__main').forEach((container) => {
    const cells = [...container.children].map((child) => {
      const link = child.querySelector('a');
      if (!link) {
        return [child];
      }
      const newDiv = document.createElement('div');
      newDiv.append(...link.children);
      const cta = newDiv.querySelector('div.ecs__link');
      link.replaceChildren(cta);
      newDiv.append(link);

      return [newDiv];
    });
    createBlock(container, document, 'Elastic content strip', cells);
  });
}

function largeContentStack(main, document) {
  main.querySelectorAll('.large-content-stack')
    .forEach((container) => {
      const imgSrc = container.querySelector('.has-background--img')?.getAttribute('data-lazy-image');
      const img = document.createElement('img');
      img.src = imgSrc;

      const newContainer = document.createElement('div');
      newContainer.append(...container.children, img);

      createBlock(container, document, 'Large content stack', [[newContainer]]);
    });
}

function transformers(main, document, html, pathname) {
  inlineIcons(main, html);

  newsletter(main, document);
  createMetadata(main, document, pathname, html);
  videos(main, document);
  calciteButton(main, document);
  links(main, document);
  localNavigation(main, document);
  sections(main, document);
  hero(main, document);
  storyteller(main, document);
  switchers(main, document);
  mediaGallery(main, document);
  cards(main, document);
  callToAction(main, document, pathname);
  elasticContentStrip(main, document);
  map(main, document, pathname);
  quote(main, document);
  columns(main, document);
  mosaicReveal(main, document);
  largeContentStack(main, document);
  tabs(main, document, pathname);
  transformUrls(main);
}

export default {
  transform: ({ document, url, html }) => {
    const { pathname } = new URL(url);

    report = {
      locale: pathname.split('/')[1],
    };
    fragmentPages = [];

    const main = document.querySelector('main');
    WebImporter.DOMUtils.remove(main, [
      'header',
      'footer',
      '.disclaimer',
      '.card-container-v3_i18n',
      'button.paginate-container.icon-ui-down',
      '.paginate-container',
    ]);

    transformers(main, document, html, pathname);

    const pages = [
      {
        element: main,
        path: pathname,
        report,
      },
      ...fragmentPages.map((fragmentPage) => {
        const metadataBlock = WebImporter.Blocks.getMetadataBlock(document, { robots: 'noindex,nofollow' });
        fragmentPage.element.append(metadataBlock);

        return ({
          element: fragmentPage.element,
          path: fragmentPage.path,
        });
      }),
    ];

    return pages;
  },
};
