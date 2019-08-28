import Instruments from '../instruments/instruments';
import Canvas from '../Canvas/Canvas';
import Frames from '../frames/frames';

const mainCanvas = new Canvas(800, 800, 'mainCanvas', 'mainCanvas');
const instruments = new Instruments();
const frames = new Frames();

export default class localStorageClass {
  save() {
    const framesData = document.querySelector('.list-group');
    localStorage.setItem('frames', framesData.outerHTML);
  }

  render() {
    if (!localStorage.getItem('frames')) return;
    const framesData = document.querySelector('.list-group');

    framesData.outerHTML = localStorage.getItem('frames');
    mainCanvas.refresh();

    const framesList = document.querySelectorAll('.frame');
    const addButton = document.querySelector('#add-btn');

    framesList.forEach(elem => {
      instruments.setFramesIventListeners(elem);
      elem.addEventListener('click', () => instruments.active(elem, '.frame'));
      elem.addEventListener('click', () => mainCanvas.refresh());
      const copyButton = elem.querySelector('#copyButton');
      const deleteButton = elem.querySelector('#deleteButton');

      copyButton.addEventListener('click', event => frames.copyFrame(event), true);
      deleteButton.addEventListener('click', event => frames.deleteFrame(event), true);
    });
    mainCanvas.refresh();
    addButton.addEventListener('click', () => frames.addFrame());
  }

  clearStorage() {
    localStorage.clear();
  }
}
