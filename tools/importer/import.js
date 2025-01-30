/* global WebImporter */
import urls from './urls.js';
import svgs from './svgs.js';

let report = {};
let fragmentPages = [];
let theme = '';
const edsUrl = 'https://main--esri-eds--esri.aem.live';
const esriUrlRoot = 'https://www.esri.com';

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

function getThemeColor(html) {
  const themeColorRegex = /--theme-color: (#[0-9a-fA-F]{6});/g;
  const themeColorMatch = themeColorRegex.exec(html);

  return themeColorMatch[1];
}

const preprocessMetadata = {};

function createMetadata(main, document, pathname, html) {
  const meta = preprocessMetadata;

  const urlInfo = urls.find(({ URL: url }) => (new URL(url).pathname) === pathname);
  meta.Theme = urlInfo.Theme;
  const themeColor = getThemeColor(html);
  report.themeColor = themeColor;
  if (themeColor !== '') {
    meta.ThemeColor = themeColor;
  }
  theme = meta.Theme;

  meta.Title = document.querySelector('meta[property="og:title"]').content;
  meta.Description = document.querySelector('meta[property="og:description"]').content;
  meta.Breadcrumbs = getBreadcrumbs(html, pathname).join(', ');

  const container = document.querySelector('.local-navigation.aem-GridColumn');
  if (container) {
    meta.localNavigation = true;
  }

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

  const reportBlockName = name.toLowerCase();

  report[reportBlockName] ??= new Set();
  const blockReport = report[reportBlockName];
  variants.forEach((variant) => blockReport.add(variant.toLowerCase()));

  const hasEmbeddedBlock = container.querySelector('table');
  const closestBlock = container.closest('table');
  if (hasEmbeddedBlock || closestBlock) {
    if (!report.embeddedBlocks) {
      report.embeddedBlocks = [];
    }
    report.embeddedBlocks.push(reportBlockName);
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

function cellsFromDictionary(dictionary) {
  return Object.entries(dictionary)
    .map(([key, value]) => [[key], [value]]);
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

  const cells = cellsFromDictionary(heroParts);

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
      const withCards = false;

      const cells = [...container.querySelectorAll('[role="tabpanel"]')]
        .map((tabContent) => {
          const tabLabelId = tabContent.getAttribute('aria-labelledby');
          const tabName = container.querySelector(`#${tabLabelId}`);
          const tabLabel = document.createElement('div');
          tabLabel.innerHTML = tabName.innerHTML;

          // this is most likely no longer needed
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

          const aemIcon = tabContent.querySelector('.aem-icon');
          if (aemIcon) {
            tabLabel.prepend(aemIcon, ' ');
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

      if (container.querySelector('.cards-simple')) {
        variants.push('simple');
      }

      if (container.querySelector('.cards-standard')) {
        variants.push('standard');
      }

      createBlock(container, document, blockName, cells, variants);
    });
}

function looseJsParse(obj) {
  // eslint-disable-next-line no-eval
  return eval(`(${obj})`);
}

function getPageCTAGroup(pathname) {
  const threeDGis = [
    '/capabilities/3d-gis/overview',
    '/capabilities/3d-gis/features/3d-data-management',
    '/capabilities/3d-gis/features/3d-analysis',
    '/capabilities/3d-gis/features/3d-visualization',
    '/capabilities/3d-gis/features/3d-immersive-experiences',
  ];

  if (threeDGis.some((path) => pathname.endsWith(path))) {
    return '3d-gis';
  }

  const dataManagement = [
    '/capabilities/data-management',
    '/capabilities/field-operations/get-started',
    '/capabilities/field-operations/overview',
    '/capabilities/mapping/overview',
    '/capabilities/mapping/smart-mapping',
  ];
  if (dataManagement.some((path) => pathname.endsWith(path))) {
    return 'data-management';
  }

  const realTime = [
    '/capabilities/real-time/features/actuation',
    '/capabilities/real-time/features/analysis',
    '/capabilities/real-time/features/dissemination',
    '/capabilities/real-time/features/ingestion',
    '/capabilities/real-time/features/storage',
    '/capabilities/real-time/features/visualization',
  ];

  if (realTime.some((path) => pathname.endsWith(path))) {
    return 'real-time';
  }

  const realTimeOmitFragment = [
    '/capabilities/real-time/partners/cloud-iot-platforms',
    '/capabilities/real-time/partners/data',
    '/capabilities/real-time/partners/service',
  ];

  if (realTimeOmitFragment.some((path) => pathname.endsWith(path))) {
    return 'real-time-omit-fragment';
  }

  const realTimeOmitFragmentSpecial = [
    '/capabilities/real-time/get-started',
    '/capabilities/real-time/overview',
  ];

  if (realTimeOmitFragmentSpecial.some((path) => pathname.endsWith(path))) {
    return 'real-time-omit-fragment-special';
  }

  return null;
}

function form(main, pathname) {
  const formEl = main.querySelector('.esri-one-form,.one-form-sites-form-component');
  if (!formEl) {
    return;
  }

  const secondScript = formEl.querySelector('script:nth-of-type(2)');
  const regex = /window\.initOneForm\('([^']+)',\s*({[\s\S]+?})\);/;

  const match = secondScript.textContent.match(regex);

  if (!match) {
    throw new Error('No match found for form initOneForm call');
  }

  const jsString = match[2];

  const formProps = looseJsParse(jsString);

  const fields = {
    formName: formProps.formName,
    formModalLookup: formProps.formModalLookup,
    pardotHandler: formProps.pardotHandler,
    organicSfId: formProps.organicSfId,
    thankYouFormType: formProps.thankYouFormType,
    mqlBehavior: formProps.mqlBehavior,
    gdprMode: formProps.gdprMode,
    sideDrawerWidth: formProps.sideDrawerWidth,
  };

  Object.keys(fields)
    .forEach((key) => {
      if (!fields[key]) {
        delete fields[key];
      }
    });

  const formParent = formEl.parentElement;

  // TODO only add to metadata when moving form to a fragment
  //  and then remove it from the fragment divId
  // but if not possible, this is  fine
  preprocessMetadata.formDivId = fields.divId;

  const ctaGroup = getPageCTAGroup(pathname);
  if (ctaGroup !== 'real-time') {
    createBlock(formEl, document, 'form', cellsFromDictionary(fields));
    return;
  }

  const lastPart = formParent.lastElementChild;
  const formColumns = lastPart.querySelectorAll('.columnsystem > .column-8');
  if (formColumns.length !== 3) {
    console.error('Expected 3 columns', formColumns);
    throw new Error('Expected 3 columns');
  }
  // column 2 has display none
  const secondColumn = formColumns[2];
  formColumns[1].textContent = '';
  const visibleColumns = [formColumns[0], formColumns[2]];

  const cardContent = secondColumn.querySelector('.card-content');

  const cells = cellsFromDictionary(fields);
  cells.unshift(['cardContent', cardContent]);
  createBlock(secondColumn.firstElementChild, document, 'form', cells, ['Card modal']);

  lastPart.replaceChildren(...visibleColumns);
}

function processBlockGroupElement(originalAnchor) {
  const href = originalAnchor
    .getAttribute('href');
  const linkUrl = (href.startsWith('tel:')) ? href : esriUrlRoot + href;
  const link = document.createElement('a');
  link.setAttribute('href', linkUrl);
  link.textContent = linkUrl;

  const newChildInnerDiv = document.createElement('div');
  newChildInnerDiv.append(...originalAnchor.children);

  const newChild = document.createElement('div');
  newChild.append(link, newChildInnerDiv);

  return newChild;
}

function classHasPrefix(className, prefix) {
  return className.startsWith(prefix) && className.length > prefix.length;
}

function processSection(section) {
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
  ];

  const spacingDiv = sectionDivs[0];

  spacingDiv?.classList.forEach((className) => {
    classPrefixes.forEach((prefix) => {
      if (classHasPrefix(className, prefix)) {
        sectionStyles.push(className);
      }
    });
  });

  const columnPrefixes = [
    'column-',
    'tablet-column-',
    'phone-column-',
    'pre-',
    'post-',
  ];

  // remove the cta container logic after implementing cta block
  const columnsDivs = spacingDiv?.querySelectorAll(':not(.cta-container) [data-aem-columnsys]') ?? [];
  if (columnsDivs?.length > 1) {
    sectionStyles.push(`column-section-${columnsDivs.length}`);
  } else {
    columnsDivs[0]?.classList?.forEach((className) => {
      columnPrefixes.forEach((prefix) => {
        if (classHasPrefix(className, prefix)) {
          sectionStyles.push(className);
        }
      });
    });
  }

  if (sectionStyles.length > 0) {
    section.append(WebImporter.Blocks.createBlock(document, {
      name: 'Section Metadata',
      cells: { Style: sectionStyles.join(', ') },
    }));
  }
}

function callToAction(main, document, html, pathname) {
  const language = pathname.split('/')[1];

  const ctaGroup = getPageCTAGroup(pathname);
  console.log('ctaGroup', ctaGroup);
  if (ctaGroup === 'real-time-omit-fragment') {
    const allExperienceFragment = [...main.querySelectorAll('.experiencefragment')];
    const lastExperienceFragment = allExperienceFragment.pop();
    allExperienceFragment.forEach((fragment) => {
      fragment.remove();
    });

    const fragmentPathname = `/${language}/call-to-action/real-time`;
    const fragmentUrl = edsUrl + fragmentPathname;
    const ctaLink = document.createElement('a');
    ctaLink.setAttribute('href', fragmentUrl);
    ctaLink.textContent = fragmentUrl;

    createBlock(lastExperienceFragment, document, 'Call to action', [[ctaLink]], ['fragment']);
    return;
  }

  // TODO check if this works in other languages
  if (ctaGroup === 'real-time-omit-fragment-special') {
    const experienceFragment = main.querySelector('.experiencefragment');
    experienceFragment.previousElementSibling.remove();
    experienceFragment.previousElementSibling.remove();
    experienceFragment.previousElementSibling.remove();

    const fragmentPathname = `/${language}/call-to-action/real-time`;
    const fragmentUrl = edsUrl + fragmentPathname;
    const ctaLink = document.createElement('a');
    ctaLink.setAttribute('href', fragmentUrl);
    ctaLink.textContent = fragmentUrl;

    createBlock(experienceFragment, document, 'Call to action', [[ctaLink]], ['fragment']);
    return;
  }

  if (ctaGroup) {
    const ctaSection = main.querySelector('.aem-GridColumn:has(.cta-container)');

    const ctaQuestions = ctaSection.querySelector('.cta-questions .cta-questions_social');

    ctaQuestions.querySelectorAll('.tmh-block-group').forEach((tmhBlockGroup) => {
      const cells = [...tmhBlockGroup.children]
        .map((child) => [processBlockGroupElement(child.querySelector('a'))]);

      createBlock(tmhBlockGroup, document, 'Cards', cells, ['Questions']);
    });

    ctaQuestions.querySelectorAll('.questions-contact').forEach((questionsContact) => {
      const cells = [...questionsContact.children]
        .map((child) => [processBlockGroupElement(child)]);

      createBlock(questionsContact, document, 'Cards', cells, ['Questions']);
    });

    const children = [...ctaQuestions.children];
    if (children.length !== 3 && children.length !== 1) {
      throw new Error('callToAction expected 3 or 1 children', ctaQuestions.outerHTML);
    }
    const leftChild = children[0];
    const rightChild = children[2];

    const ctaSections = [leftChild];
    if (rightChild) {
      ctaSections.push(document.createElement('hr'), rightChild);
    }
    if (ctaGroup === 'real-time') {
      const previousSection = ctaSection.closest('.experiencefragment').previousElementSibling;
      processSection(previousSection, document, pathname);
      ctaSections.unshift(previousSection, document.createElement('hr'));
    }

    const fragmentPathname = `/${language}/call-to-action/${ctaGroup}`;

    const link = document.createElement('a');
    const url = edsUrl + fragmentPathname;
    link.setAttribute('href', url);
    link.textContent = url;
    const wrapper = document.createElement('div');
    wrapper.append(...ctaSections);
    ctaQuestions.replaceChildren(link);

    fragmentPages.push({
      element: wrapper,
      path: fragmentPathname,
    });

    createBlock(ctaQuestions, document, 'Call to action', [[link]], ['fragment']);
    return;
  }

  const ctaSection = main.querySelector('.aem-GridColumn:has(.cta-container)');
  if (!ctaSection) {
    return;
  }

  const ctaSections = [ctaSection];

  const newCta = document.createElement('div');
  // append newCta right before ctaSection
  ctaSection.before(newCta);

  newCta.append(...ctaSections);

  const cells = ctaSections.map((container) => {
    const hasEmbeddedBlock = container.querySelector('table');
    if (hasEmbeddedBlock) {
      throw new Error('callToAction has embedded block in default case');
    }

    const ctaQuestions = container.querySelector('.cta-questions');

    if (ctaQuestions) {
      const primaryDblContainer = ctaQuestions.querySelector('.cta-questions_primary-dbl-button-column-container');
      if (primaryDblContainer) {
        const children = [...primaryDblContainer.children];
        if (children.length !== 3) {
          throw new Error('callToAction expected 3 children', primaryDblContainer.outerHTML);
        }
        return [primaryDblContainer.firstElementChild, primaryDblContainer.lastElementChild];
      }
    }

    return [container];
  });
  createBlock(newCta, document, 'Call to action', cells);
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
        const newUrl = `${esriUrlRoot}${href}`;
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
  const themeColor = getThemeColor(html);

  const foundIcons = [];
  const notFoundIcons = [];

  main.querySelectorAll('.esri-text__iconContainer > svg, .esri-text__iconContainer > span > svg, .ecs__panel__icon > svg, .cta-questions svg')
    .forEach((icon) => {
      const path = icon.querySelector('path');
      let color = path.style.fill;
      if (!path.style.fill) {
        color = themeColor;
      } else {
        // remove fill attribute
        path.removeAttribute('style');
      }

      icon.removeAttribute('class');

      const iconHash = hashCode(icon.outerHTML);
      let iconName = findIcon(icon);
      if (!iconName) {
        console.error('Unknown icon hash', iconHash, icon);
        console.error('icon parent', icon.parentElement.parentElement);
        iconName = `pending-${iconHash}`;
        if (iconName === 'pending-18eexth') {
          const contents = "<svg id=\"icon-ui-svg\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 48 48\"><path d=\"M23.172 31.845L17.9 34.889v-9.077l5.088-2.766 4.616 2.665a3.806 3.806 0 0 1 .396.133v-.828l-4.497-2.596 3.516-8.038 4.081-2.356v5.585a3.986 3.986 0 0 1 .8-.1v-6.409L17.5 2.788 3.1 11.102V27.73l14.4 8.314 5.98-3.452zm-.366-9.828L18.3 19.416l7.551-4.36zM17.9 3.943l12.8 7.39-3.865 2.231L17.9 4.877zm0 2.049l8.215 7.988-8.215 4.743zm0 14.117l4.275 2.468-4.275 2.325zm-14-8.083l3.267 1.886-.88 11.516L3.9 26.806zm4.035 2.33l8.765 5.06-9.574 5.528zM17.1 34.888l-12.8-7.39 2.64-1.525H17.1zm0-9.715H8.326l8.774-5.066zm0-6.45l-8.83-5.099 8.83-7.7zm0-13.86l-9.563 8.338L4.3 11.333l12.8-7.39zM43.462 39.57a66.93 66.93 0 0 1-1.079 4.3l-.766-.228c.005-.017.52-1.758 1.064-4.243.53-2.42-.564-7.838-.575-7.892A1.12 1.12 0 0 0 41 30.4c-1.1 0-1.1.347-1.1.6v1h-.8v-1.5a1.102 1.102 0 0 0-1.1-1.1c-1.1 0-1.1.482-1.1.688V31h-.8v-1.5a1.1 1.1 0 1 0-2.2 0V31h-.8v-9.5a1.1 1.1 0 1 0-2.2 0v12.317l-3.592-4.828a.98.98 0 0 0-1.403-.442.997.997 0 0 0-.478.653 1.181 1.181 0 0 0 .137.85l2.784 6.745 3.965 4.955-.626.5-4.057-5.098-2.781-6.75a1.921 1.921 0 0 1-.202-1.378 1.788 1.788 0 0 1 .857-1.169 1.757 1.757 0 0 1 2.471.695l2.125 2.853V21.5a1.9 1.9 0 0 1 3.8 0v6.452a1.9 1.9 0 0 1 2.89.909A2.443 2.443 0 0 1 38 28.6a1.903 1.903 0 0 1 1.778 1.229A2.75 2.75 0 0 1 41 29.6a1.897 1.897 0 0 1 1.897 1.808c.04.168 1.13 5.577.565 8.162z\" id=\"icon-ui-svg--base\"/></svg>";

          const div = document.createElement('div');
          div.innerHTML = contents;
          const testSvg = div.querySelector(':scope > svg');

          const equals = testSvg.outerHTML === icon.outerHTML;

          console.log('equals?', equals);
          console.log('page', icon.outerHTML);
          console.log('refe', testSvg.outerHTML);
        }
        notFoundIcons.push({
          name: iconName,
          icon: icon.outerHTML,
        });
      } else {
        console.log('Found icon', iconName);
        foundIcons.push({
          name: iconName,
          color,
        });
      }

      const newIcon = createIcon(iconName, '');
      icon.replaceWith(newIcon);
    });

  main.querySelectorAll('.esri-image > div[data-asset]').forEach((icon) => {
    const iconPath = icon.getAttribute('data-asset');
    const iconName = iconPath
      .split('/')
      .pop()
      .split('.')
      .slice(0, -1)
      .join('.');
    if (!svgs.find(({ name }) => name === iconName)) {
      throw new Error(`Unknown icon ${iconName}`);
    }
    const newIcon = createIcon(iconName, '');
    icon.replaceWith(newIcon);
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

  main.querySelectorAll('.grid-container:has(.media-split)').forEach((container) => {
    const cells = [...container.querySelectorAll('.media-split')].map((mediaSplit) => {
      const splitDiv = mediaSplit.querySelector('.split');
      const splitChildren = [...splitDiv.children];
      if (splitChildren.length !== 2) {
        throw new Error('media-split expected 2 children');
      }
      if (splitDiv.classList.contains('split--swap')) {
        splitChildren.reverse();
      }

      return splitChildren;
    });

    createBlock(container, document, 'columns', cells, ['Media split']);
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
  main.querySelectorAll(':scope > .aem-Grid > .aem-GridColumn').forEach(processSection);

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
  // inlineIcons(main, html);

  newsletter(main, document);
  createMetadata(main, document, pathname, html);
  videos(main, document);
  calciteButton(main, document);
  links(main, document);
  storyteller(main, document);
  switchers(main, document);
  mediaGallery(main, document);
  callToAction(main, document, html, pathname);
  cards(main, document);
  elasticContentStrip(main, document);
  map(main, document, pathname);
  quote(main, document);
  columns(main, document);
  mosaicReveal(main, document);
  largeContentStack(main, document);
  tabs(main, document, pathname);
  sections(main, document);
  hero(main, document);
  transformUrls(main);
}

export default {
  preprocess: ({ document, url, html }) => {
    const { pathname } = new URL(url);

    report = {
      locale: pathname.split('/')[1],
    };

    const main = document.querySelector('main');
    inlineIcons(main, html);
    form(main, pathname);
  },
  transform: ({ document, url, html }) => {
    const { pathname } = new URL(url);

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
