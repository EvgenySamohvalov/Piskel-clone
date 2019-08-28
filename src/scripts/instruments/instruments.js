import Canvas from '../Canvas/Canvas';
import gifshot from '../gifshot';

const hexToRgba = require('hex-to-rgba');

const mainCanvas = new Canvas(640, 640, 'mainCanvas', 'mainCanvas');

export default class Intruments {
  getCanvasSize() {
    const select = document.querySelector('#sizes_canvas');
    const option = select.options[select.selectedIndex].value;

    return option;
  }

  getPenSize() {
    const select = document.querySelector('#sizes_pen');
    const option = select.options[select.selectedIndex].value;

    return option;
  }

  getCursorCoords(e) {
    const canvas = [mainCanvas.getCanvas().canvas][0];
    const canvBox = {
      left: canvas.getBoundingClientRect().left,
      top: canvas.getBoundingClientRect().top
    };
    const coords = {};
    coords.x = e.offsetX;
    coords.y = e.offsetY;
    return coords;
  }

  showCanvasInfo(target) {
    let size = this.getCanvasSize();
    const selectSize = document.querySelector('#sizes_canvas');
    const coordsWrapper = document.querySelector('#cursor_coords');
    const canvas = [target.getCanvas().canvas][0];
    let coords = null;

    let divider = canvas.width / size;
    const sizeWrapper = document.querySelector('#layer_size');

    selectSize.addEventListener('input', () => {
      size = this.getCanvasSize();
      divider = canvas.width / size;
      sizeWrapper.innerHTML = `${size}x${size}`;
    });

    target.getCanvas().canvas.addEventListener('mousemove', e => {
      coords = this.getCursorCoords(e);
      coords.x = Math.floor(coords.x / divider);
      coords.y = Math.floor(coords.y / divider);
      if (coords.x + 1 < 1) coords.x += 1;

      coordsWrapper.innerHTML = `${coords.x + 1} : ${coords.y + 1}`;
    });

    return coords;
  }

  fullScreen(container) {
    if (container.fullscreenElement) {
      container.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }

  downloadGif() {
    const framesImages = document.querySelectorAll('.imgFrame');
    const rng = document.querySelector('#frame_rate');
    const framesImagesUrls = [];
    const imagesObject = [];

    rng.value = parseInt(rng.value, 10);

    if (rng.value === 0) return;

    const fpsValue = 1 / rng.value;

    framesImages.forEach((elem, index) => {
      framesImagesUrls[index] = elem.src;
      imagesObject[index] = { src: framesImagesUrls[index], text: '' };
    });

    gifshot.createGIF(
      {
        images: imagesObject,
        interval: fpsValue,
        frameDuration: fpsValue
      },
      function gifFunc(obj) {
        if (!obj.error) {
          const gif = [obj.image][0];
          const animatedGif = document.createElement('img');
          animatedGif.src = gif;

          const saveLink = document.createElement('a');
          saveLink.onclick = () => {
            saveLink.href = animatedGif.src;
            saveLink.target = '_blank';
            saveLink.download = 'New Sprite.gif';
          };

          saveLink.click();
        }
      }
    );
  }

  renumberFrames() {
    const framesList = document.querySelectorAll('.frame');
    const framesImagesList = document.querySelectorAll('.imgFrame');
    framesList.forEach((elem, index) => {
      elem.id = `frame_${index}`;
      framesImagesList[index].id = `frame_img_${index}`;
    });
  }

  setFramesIventListeners(frame) {
    frame.addEventListener('click', () => mainCanvas.refresh());
    frame.addEventListener('click', () => this.active(frame, '.frame'));
  }

  active(elem, target) {
    const items = document.querySelectorAll(target);
    items.forEach(element => {
      if (element.classList.contains('active')) element.classList.remove('active');
    });

    elem.classList.add('active');
  }

  simpleBresenhams(cX0, cY0, cX1, cY1, divider, ctx) {
    const penSize = this.getPenSize();
    const dx = Math.abs(cX1 - cX0);
    const dy = Math.abs(cY1 - cY0);
    const sx = cX0 < cX1 ? 1 : -1;
    const sy = cY0 < cY1 ? 1 : -1;
    let err = dx - dy;
    let coordX = null;
    let coordY = null;

    while (true) {
      coordX = cX0;
      coordY = cY0;
      coordX *= divider;
      coordY *= divider;

      ctx.fillRect(coordX, coordY, divider * penSize, divider * penSize);

      if (cX0 === cX1 && cY0 === cY1) {
        break;
      }
      const err2 = 2 * err;
      if (err2 >= -dy) {
        err -= dy;
        cX0 += sx;
      }
      if (err2 <= dx) {
        err += dx;
        cY0 += sy;
      }
    }
  }

  circleBresenhams(x0, y0, x, y, divider, ctx) {
    const penSize = this.getPenSize();
    const radius = Math.sqrt((x - x0) ** 2 + (y - y0) ** 2);
    let x1 = 0;
    let y1 = radius;
    let gap = 0;
    let delta = 1 - 2 * radius;

    while (y1 >= 0) {
      ctx.fillRect(
        Math.floor((x0 + x1) / divider) * divider,
        Math.floor((y0 - y1) / divider) * divider,
        divider * penSize,
        divider * penSize
      );
      ctx.fillRect(
        Math.floor((x0 - x1) / divider) * divider,
        Math.floor((y0 - y1) / divider) * divider,
        divider * penSize,
        divider * penSize
      );
      ctx.fillRect(
        Math.floor((x0 - x1) / divider) * divider,
        Math.floor((y0 + y1) / divider) * divider,
        divider * penSize,
        divider * penSize
      );
      ctx.fillRect(
        Math.floor((x0 + x1) / divider) * divider,
        Math.floor((y0 + y1) / divider) * divider,
        divider * penSize,
        divider * penSize
      );

      gap = 2 * (delta + y1) - 1;
      if (delta < 0 && gap <= 0) {
        x1 += 1;
        delta += 2 * x1 + 1;
      } else if (delta > 0 && gap > 0) {
        y1 -= 1;
        delta -= 2 * y1 + 1;
      } else {
        x1 += 1;
        delta += 2 * (x1 - y1);
        y1 -= 1;
      }
    }
  }

  getPixelColor(imgData, x, y) {
    const index = (y * imgData.width + x) * 4;
    const rgba = {};

    rgba.r = imgData.data[index];
    rgba.g = imgData.data[index + 1];
    rgba.b = imgData.data[index + 2];
    rgba.a = imgData.data[index + 3];
    return rgba;
  }

  convertHexToRgba(hex) {
    const regExp = /(.*?)(rgb|rgba)\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/;
    const stringColor = hexToRgba(hex);
    const result = stringColor.match(regExp);
    const rgba = {
      r: result[3],
      g: result[4],
      b: result[5],
      a: result[6]
    };
    return rgba;
  }
}
