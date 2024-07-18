/* global WebImporter */

function calciteButton(main, document) {
  main.querySelectorAll('calcite-button').forEach((button) => {
    const link = document.createElement('a');
    link.setAttribute('href', button.getAttribute('href'));
    link.textContent = button.textContent;
    button.replaceWith(link);
  });
}

function transformBlocks(main, document) {
  calciteButton(main, document);
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

    transformBlocks(main, document);

    return main;
  },
};
