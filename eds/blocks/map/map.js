import {
  div, iframe, p, horizontalRule, domEl,
} from '../../scripts/dom-helpers.js';

const getMapPlaceholder = () => {
  const mapPlaceholder = domEl('calcite-loader', {
    label: 'Loading Map',
    class: 'iframe-map-placeholder',
    'aria-live': 'polite',
  });

  return mapPlaceholder;
};

const handleLoadFrame = (event) => {
  // Use the closest parent to find the placeholder within this specific block instance
  const mapFrame = event.target;
  const frameWrapper = mapFrame.closest('.frame-wrapper');
  const mapPlaceholder = frameWrapper.querySelector('.iframe-map-placeholder');

  if (mapPlaceholder) {
    mapPlaceholder.style.display = 'none';
  }
};

const handleLoadError = (event) => {
  // Use the closest parent to find the placeholder within this specific block instance
  const mapFrame = event.target;
  const frameWrapper = mapFrame.closest('.frame-wrapper');
  const mapPlaceholder = frameWrapper.querySelector('.iframe-map-placeholder');

  if (mapPlaceholder) {
    mapPlaceholder.remove();
  }

  const errorMessage = p({ class: 'map-error-message' });
  errorMessage.textContent = 'Failed to load map. Please try again later.';
  frameWrapper?.appendChild(errorMessage);
};

const getMapFrame = (url) => {
  const mapFrame = iframe({
    class: 'map-frame map-frame-aspect-ratio',
    role: 'application',
    src: url,
    sandbox: 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox',
    allow: 'autoplay; geolocation; fullscreen;',
    tabindex: '0',
    loading: 'lazy',
    title: 'Esri locations map',
    onload: handleLoadFrame,
    onerror: handleLoadError,
  });

  return mapFrame;
};

export default function decorate(block) {
  const blockParams = block.querySelectorAll('p');
  const heading = block.querySelector('h2');

  // Validate that we have the required elements
  if (blockParams.length < 2) {
    return;
  }

  const blockText = blockParams[0]?.innerText || '';
  const mapLink = blockParams[1]?.innerText || '';

  if (!mapLink) {
    return;
  }

  block.textContent = '';

  const gridContainer = div({ class: 'grid-container' });
  const frameWrapper = div({ class: 'frame-wrapper' });

  const nodeTextParam = p({ class: 'map-text-content' });
  nodeTextParam.textContent = blockText;
  const hr = horizontalRule({ class: 'separator center' });

  // Use only necessary elements
  const contentWrapperChildren = heading ? [heading, hr, nodeTextParam] : [hr, nodeTextParam];
  const defaultContentWrapper = div({ class: 'map-default-content-wrapper' });

  contentWrapperChildren.forEach((child) => {
    if (child) {
      defaultContentWrapper.appendChild(child);
    }
  });

  const gridContainerChildren = [defaultContentWrapper, frameWrapper];

  gridContainerChildren.forEach((child) => {
    gridContainer.appendChild(child);
  });

  const observer = new IntersectionObserver((entries) => {
    const frameContainer = entries[0];

    if (!frameContainer.isIntersecting) return;

    entries.forEach((e) => {
      if (e.isIntersecting) {
        frameWrapper.appendChild(getMapPlaceholder());
        frameWrapper.appendChild(getMapFrame(mapLink));
        observer.unobserve(e.target);
      }
    });
    observer.disconnect();
  }, {
    threshold: 0.2, // Lower threshold so map loads earlier
    rootMargin: '100px', // Preload when within 100px of viewport
  });

  observer.observe(frameWrapper);

  block.append(gridContainer);
}
