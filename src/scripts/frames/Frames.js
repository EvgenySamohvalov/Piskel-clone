import Canvas from '../Canvas/Canvas';
import Instruments from '../instruments/instruments';

const mainCanvas = new Canvas(640, 640, 'mainCanvas', 'mainCanvas');
const renderCanvas = new Canvas(640, 640, 'renderCanvas', 'renderCanvas');
const instruments = new Instruments();

export default class Frames {
  render() {
    const framesContainer = document.querySelectorAll('.frame');
    let activeFrame = null;
    let number = 0;
    framesContainer.forEach((elem, index) => {
      if (elem.classList.contains('active')) {
        activeFrame = elem;
        number = index;
      }
    });

    const currentImg = mainCanvas.convertToFrame('104px');
    currentImg.id = `frame_img_${number}`;
    currentImg.draggable = 'true';
    activeFrame.replaceChild(currentImg, activeFrame.querySelector('.imgFrame'));
    activeFrame.style.backgroundImage = `url("${currentImg.src}")`;
  }

  addFrame() {
    const canvasContainer = document.querySelector('.canvas-main-container');
    if (canvasContainer.querySelector('#renderCanvas')) {
      renderCanvas
        .getCanvas()
        .ctx.clearRect(
          0,
          0,
          renderCanvas.getCanvas().canvas.height,
          renderCanvas.getCanvas().canvas.width
        );
    }

    const framesList = document.querySelectorAll('.frame');
    let newFrame = null;

    framesList.forEach(elem => {
      if (elem.classList.contains('active')) elem.classList.remove('active');
    });

    newFrame = framesList[0].cloneNode(true);

    newFrame.classList = 'list-group-item frame active';
    newFrame.id = `frame_${framesList.length}`;

    framesList[framesList.length - 1].insertAdjacentElement('afterend', newFrame);

    newFrame.addEventListener('click', () => instruments.active(newFrame, `.frame`));
    newFrame.addEventListener('click', () => mainCanvas.refresh());

    newFrame.addEventListener('dragstart', () => this.dragAndDrop(newFrame));

    mainCanvas.clearCanvas();

    const copyButton = newFrame.querySelector('#copyButton');
    const deleteButton = newFrame.querySelector('#deleteButton');

    copyButton.addEventListener('click', event => this.copyFrame(event), true);
    deleteButton.addEventListener('click', event => this.deleteFrame(event), true);
    newFrame.style.backgroundImage = null;

    newFrame.replaceChild(mainCanvas.convertToFrame('104px'), newFrame.querySelector('.imgFrame'));
  }

  copyFrame(event) {
    const canvasContainer = document.querySelector('.canvas-main-container');
    if (canvasContainer.querySelector('#renderCanvas')) {
      renderCanvas
        .getCanvas()
        .ctx.clearRect(
          0,
          0,
          renderCanvas.getCanvas().canvas.height,
          renderCanvas.getCanvas().canvas.width
        );
    }

    event.stopPropagation();

    const choosenFrame = event.target.parentNode;
    const choosenFrameCopy = choosenFrame.cloneNode(true);

    const framesList = document.querySelectorAll('.frame');

    framesList[framesList.length - 1].insertAdjacentElement('afterend', choosenFrameCopy);

    instruments.active(choosenFrameCopy, `.frame`);
    mainCanvas.refresh();

    choosenFrameCopy.classList = 'list-group-item frame active';
    choosenFrameCopy.addEventListener('click', () =>
      instruments.active(choosenFrameCopy, `.frame`)
    );
    choosenFrameCopy.addEventListener('click', () => mainCanvas.refresh());

    const choosenImageCopy = choosenFrameCopy.querySelector('.imgFrame');
    choosenFrameCopy.style.backgroundImage = `url("${choosenImageCopy.src}")`;

    instruments.renumberFrames();

    const copyButton = choosenFrameCopy.querySelector('#copyButton');
    const deleteButton = choosenFrameCopy.querySelector('#deleteButton');

    copyButton.addEventListener('click', ev => this.copyFrame(ev), true);
    deleteButton.addEventListener('click', ev => this.deleteFrame(ev), true);

    choosenFrameCopy.addEventListener('dragstart', () => this.dragAndDrop(choosenFrameCopy));
  }

  deleteFrame(event) {
    const canvasContainer = document.querySelector('.canvas-main-container');
    if (canvasContainer.querySelector('#renderCanvas')) {
      renderCanvas
        .getCanvas()
        .ctx.clearRect(
          0,
          0,
          renderCanvas.getCanvas().canvas.height,
          renderCanvas.getCanvas().canvas.width
        );
    }

    event.stopPropagation();
    let framesList = document.querySelectorAll('.frame');

    if (framesList.length === 1) return 0;

    const choosenFrame = event.target.parentNode;
    choosenFrame.remove();

    framesList = document.querySelectorAll('.frame');

    instruments.renumberFrames();

    framesList[framesList.length - 1].classList = 'list-group-item frame active';
    mainCanvas.refresh();
    return 1;
  }

  getFrames() {
    return document.querySelectorAll('.frame');
  }
}
