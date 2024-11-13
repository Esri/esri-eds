function decorateBlockSectionMode(block) {
  block.classList.forEach((className) => {
    if (className.startsWith('calcite-mode-')) {
      block.closest('.section')
        .classList
        .add(className);
    }
  });
}

export default function decorate(block) {
  decorateBlockSectionMode(block);
}
