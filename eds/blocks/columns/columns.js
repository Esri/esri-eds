export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }

      const buttons = col.querySelectorAll('.button-container');
      if (buttons.length > 0) {
        const parent = buttons[0].parentElement;
        const buttonWrapper = document.createElement('div');
        buttonWrapper.classList.add('buttons-container');
        buttons.forEach((btn) => {
          buttonWrapper.appendChild(btn);
        });
        parent.appendChild(buttonWrapper);
      }

      // media text split logic
      const p = col.querySelector('p');
      if (p?.querySelector('picture')) {
        p.classList.add('columns-p');
      }
    });
  });
}
