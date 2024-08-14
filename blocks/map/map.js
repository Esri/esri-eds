import {
  div, iframe, p, horizontalRule,
} from '../../scripts/dom-helpers.js';

function getMapFrame(url) {
  const mapFrame = iframe({
    id: 'map-frame',
    class: 'map-frame-aspect-ratio',
    role: 'application',
    src: url,
    sandbox: 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox',
    allow: 'autoplay; geolocation; fullscreen;',
    tabindex: '0',
    loading: 'lazy',
    title: 'Esri locations map',
  });

  return mapFrame;
}

export default async function decorate(block) {
  const blockParams = block.querySelectorAll('p');

  const mapLink = blockParams[0].innerText;
  const textParameter = blockParams[1].innerText;
  block.textContent = '';

  const gridContainer = div({ class: 'grid-container' });
  const frameWrapper = div({ id: 'frame-wrapper' });
  frameWrapper.appendChild(getMapFrame(mapLink));

  const defaultContentContainer = document.querySelector('.map-container > .default-content-wrapper');
  const nodeTextParam = p({ id: 'map-text-content' });
  nodeTextParam.textContent = textParameter;
  const hr = horizontalRule({ class: 'separator center' });

  const contentWrapperChildren = [defaultContentContainer, hr, nodeTextParam];
  const defaultContentWrapper = div({ id: 'map-default-content-wrapper' });

  contentWrapperChildren.forEach((child) => {
    defaultContentWrapper.appendChild(child);
  });

  const gridContainerChildren = [defaultContentWrapper, frameWrapper];

  gridContainerChildren.forEach((child) => {
    gridContainer.appendChild(child);
  });

  block.append(gridContainer);
}
