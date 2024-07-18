/* global WebImporter */

function videos(main, document) {
  main.querySelectorAll('video').forEach((video) => {
    const videoSrc = video.getAttribute('data-video-src');
    const videoPoster = video.getAttribute('poster');

    const videoLink = document.createElement('a');
    videoLink.setAttribute('href', videoSrc);
    videoLink.textContent = videoSrc;

    const img = document.createElement('img');
    img.setAttribute('src', videoPoster);

    const div = document.createElement('div');
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
      container.replaceChildren(WebImporter.Blocks.createBlock(document, {
        name: 'storyteller',
        cells: [[leftChild, rightChild]],
      }));
    });
}

function transformers(main, document) {
  videos(main, document);
  calciteButton(main, document);
  storyteller(main, document);
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
