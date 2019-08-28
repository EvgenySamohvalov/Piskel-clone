import Frames from '../frames/frames';
import Canvas from '../Canvas/Canvas';
import Color from './Color/Color';
import Instruments from '../instruments/instruments';

const mainCanvas = new Canvas(640, 640, 'mainCanvas', 'mainCanvas');
const renderCanvas = new Canvas(640, 640, 'renderCanvas', 'renderCanvas');
const canvasHelper = new Canvas(640, 640, 'canvasHelper', 'canvasHelper');
const colors = new Color('main');
const instruments = new Instruments();
const frames = new Frames();

export default class Tools {
  PenTool() {
    this.changeTool();

    const eraser = document.querySelector('#eraser_tool');
    const mirror = document.querySelector('#mirror_tool');
    const dithering = document.querySelector('#dithering_tool');
    const canvas = [mainCanvas.getCanvas().canvas][0];
    const ctx = [mainCanvas.getCanvas().ctx][0];
    let pixelsNumber = instruments.getCanvasSize();
    let penSize = instruments.getPenSize();
    let divider = canvas.width / pixelsNumber;

    let x0 = null;
    let y0 = null;
    let x1 = null;
    let y1 = null;
    let coordX = null;
    let coordY = null;

    function draw(e) {
      x1 = Math.floor(e.offsetX / divider);
      y1 = Math.floor(e.offsetY / divider);

      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;

      while (true) {
        coordX = x0;
        coordY = y0;

        if (dithering.classList.contains('active')) {
          if ((coordX + coordY) % 2 === 0) ctx.fillStyle = colors.primaryColor;
          else ctx.fillStyle = colors.secondaryColor;
        }

        coordX *= divider;
        coordY *= divider;

        if (mirror.classList.contains('active')) {
          ctx.fillRect(canvas.width - coordX - divider, coordY, divider * penSize, divider * penSize);
        }
        ctx.fillRect(coordX, coordY, divider * penSize, divider * penSize);

        if (x0 === x1 && y0 === y1) break;
        const err2 = 2 * err;
        if (err2 > -dy) {
          err -= dy;
          x0 += sx;
        }
        if (err2 < dx) {
          err += dx;
          y0 += sy;
        }
      }
    }

    function startDrawing(e) {
      if (e.button === 1) return;

      pixelsNumber = instruments.getCanvasSize();
      penSize = instruments.getPenSize();
      divider = canvas.width / pixelsNumber;

      ctx.imageSmoothingEnabled = false;

      if (eraser.classList.contains('active')) ctx.fillStyle = colors.backgroundColor;
      else ctx.fillStyle = colors.primaryColor;

      if (e.button === 2) ctx.fillStyle = colors.secondaryColor;

      x0 = Math.floor(e.offsetX / divider);
      y0 = Math.floor(e.offsetY / divider);

      ctx.moveTo(x0, y0);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('click', draw);
      if (e.button === 2) {
        canvas.addEventListener('mouseup', draw);
      }
    }

    function stopDrawing(e) {
      canvas.removeEventListener('mousemove', draw);
      if (e.button === 2) {
        canvas.addEventListener('mouseup', draw);
        frames.render();
      }
      frames.render();
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
  }

  mirrorTool() {
    this.changeTool();

    this.PenTool();
  }

  StrokeTool() {
    this.changeTool();

    const canvas = [mainCanvas.getCanvas().canvas][0];
    const ctx = [mainCanvas.getCanvas().ctx][0];

    const canvasContainer = document.querySelector('.canvas-main-container');
    canvasContainer.appendChild(renderCanvas.create().canvas);
    renderCanvas.getCanvas().ctx.drawImage(canvas, 0, 0);
    instruments.showCanvasInfo(renderCanvas);

    let pixelsNumber = instruments.getCanvasSize();
    let divider = canvas.width / pixelsNumber;
    let x0 = null;
    let y0 = null;
    let x1 = null;
    let y1 = null;
    let isDrawing = false;

    function draw(e) {
      pixelsNumber = instruments.getCanvasSize();
      divider = canvas.width / pixelsNumber;

      renderCanvas.getCanvas().ctx.drawImage(canvas, 0, 0);

      x1 = Math.floor(e.offsetX / divider);
      y1 = Math.floor(e.offsetY / divider);

      instruments.simpleBresenhams(x0, y0, x1, y1, divider, renderCanvas.getCanvas().ctx);
    }

    function startDrawing(e) {
      if (e.button === 1) return;

      isDrawing = true;

      pixelsNumber = instruments.getCanvasSize();
      divider = canvas.width / pixelsNumber;

      renderCanvas.getCanvas().ctx.drawImage(canvas, 0, 0);
      renderCanvas.getCanvas().canvas.style.opacity = '1';

      renderCanvas.getCanvas().ctx.fillStyle = colors.primaryColor;
      ctx.fillStyle = colors.primaryColor;
      if (e.button === 2) {
        renderCanvas.getCanvas().ctx.fillStyle = colors.secondaryColor;
        ctx.fillStyle = colors.secondaryColor;
      }

      x0 = Math.floor(e.offsetX / divider);
      y0 = Math.floor(e.offsetY / divider);

      renderCanvas.getCanvas().ctx.moveTo(x0, y0);
      renderCanvas.getCanvas().canvas.addEventListener('mousemove', draw);
    }

    function stopDrawing(e) {
      renderCanvas.getCanvas().canvas.removeEventListener('mousemove', draw);
      renderCanvas.getCanvas().canvas.style.opacity = '0';

      x1 = Math.floor(e.offsetX / divider);
      y1 = Math.floor(e.offsetY / divider);

      instruments.simpleBresenhams(x0, y0, x1, y1, divider, ctx);
      isDrawing = false;
      frames.render();
    }

    function stopDrawingOut(e) {
      renderCanvas.getCanvas().canvas.removeEventListener('mousemove', draw);

      if (e.type === 'mouseout' && !isDrawing) return;

      x1 = Math.floor(e.offsetX / divider);
      y1 = Math.floor(e.offsetY / divider);

      instruments.simpleBresenhams(x0, y0, x1, y1, divider, ctx);
      frames.render();
      renderCanvas.getCanvas().canvas.style.opacity = '0';
    }

    renderCanvas.getCanvas().canvas.addEventListener('mousedown', startDrawing);
    renderCanvas.getCanvas().canvas.addEventListener('mouseout', stopDrawingOut);
    renderCanvas.getCanvas().canvas.addEventListener('mouseup', stopDrawing);
  }

  strangeTool() {
    this.changeTool();
    const canvas = [mainCanvas.getCanvas().canvas][0];
    const ctx = [mainCanvas.getCanvas().ctx][0];
    let x0 = null;
    let y0 = null;
    let x1 = null;
    let y1 = null;
    let cX0 = null;
    let cY0 = null;
    let cX1 = null;
    let cY1 = null;

    function draw(e) {
      const pixelsNumber = instruments.getCanvasSize();
      const divider = canvas.width / pixelsNumber;
      x1 = e.offsetX;
      y1 = e.offsetY;
      cX1 = Math.floor(x1 / divider);
      cY1 = Math.floor(y1 / divider);
      cX0 = Math.floor(x0 / divider);
      cY0 = Math.floor(y0 / divider);

      const dx = Math.abs(cX1 - cX0);
      const dy = Math.abs(cY1 - cY0);
      const sx = cX0 < cX1 ? 1 : -1;
      const sy = cY0 < cY1 ? 1 : -1;
      let err = dx - dy;

      while (true) {
        ctx.fillRect(cX0 * divider, cY0 * divider, divider, divider);
        if (cX0 === cX1 && cY0 === cY1) break;
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

    function startDrawing(e) {
      ctx.beginPath();
      ctx.fillStyle = colors.primaryColor;
      if (e.button === 2) ctx.fillStyle = colors.secondaryColor;

      x0 = e.offsetX;
      y0 = e.offsetY;
      x0 = Math.floor(x0);
      y0 = Math.floor(y0);
      ctx.moveTo(x0, y0);
      canvas.addEventListener('mousemove', draw);
    }

    function stopDrawing() {
      canvas.removeEventListener('mousemove', draw);
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
  }

  eraserTool() {
    this.changeTool();

    this.PenTool();
  }

  bucketTool() {
    this.changeTool();

    const canvas = [mainCanvas.getCanvas().canvas][0];
    const ctx = [mainCanvas.getCanvas().ctx][0];

    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let fillColor = null;

    function pickColors(event) {
      if (event.button === 2) {
        fillColor = instruments.convertHexToRgba(colors.secondaryColor);
        ctx.fillStyle = colors.secondaryColor;
      } else {
        ctx.fillStyle = colors.primaryColor;
        fillColor = instruments.convertHexToRgba(colors.primaryColor);
      }
    }

    function colorArea(e) {
      imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      let cX0 = e.offsetX;
      let cY0 = e.offsetY;

      cX0 = Math.floor(cX0);
      cY0 = Math.floor(cY0);

      const rgba0 = instruments.getPixelColor(imgData, cX0, cY0);

      const pixelStack = [[cX0, cY0]];
      const colorLayerData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const startR = rgba0.r;
      const startG = rgba0.g;
      const startB = rgba0.b;

      if (startR == fillColor.r && startG == fillColor.g && startB == fillColor.b) return;

      while (pixelStack.length) {
        let newPos = [];
        let pixelPos = null;
        let reachLeft = null;
        let reachRight = null;
        let x = null;
        let y = null;

        newPos = pixelStack.pop();
        [x, y] = [newPos[0], newPos[1]];

        pixelPos = (y * canvas.width + x) * 4;

        while (y >= 0 && matchStartColor(pixelPos)) {
          y -= 1;
          pixelPos -= canvas.width * 4;
        }

        pixelPos += canvas.width * 4;
        reachLeft = false;
        reachRight = false;

        while (y < canvas.height - 1 && matchStartColor(pixelPos)) {
          y += 1;
          colorPixel(pixelPos);
          if (x > 0) {
            if (matchStartColor(pixelPos - 4)) {
              if (!reachLeft) {
                pixelStack.push([x - 1, y]);
                reachLeft = true;
              }
            } else if (reachLeft) {
              reachLeft = false;
            }
          }
          if (x < canvas.width - 1) {
            if (matchStartColor(pixelPos + 4)) {
              if (!reachRight) {
                pixelStack.push([x + 1, y]);
                reachRight = true;
              }
            } else if (reachRight) {
              reachRight = false;
            }
          }
          pixelPos += canvas.width * 4;
        }
      }
      ctx.putImageData(colorLayerData, 0, 0);

      function matchStartColor(pixelPos) {
        const r = colorLayerData.data[pixelPos];
        const g = colorLayerData.data[pixelPos + 1];
        const b = colorLayerData.data[pixelPos + 2];

        return r == startR && g == startG && b == startB;
      }

      function colorPixel(pixelPos) {
        colorLayerData.data[pixelPos] = fillColor.r;
        colorLayerData.data[pixelPos + 1] = fillColor.g;
        colorLayerData.data[pixelPos + 2] = fillColor.b;
        colorLayerData.data[pixelPos + 3] = 255;
      }
      frames.render();
    }

    canvas.addEventListener('mousedown', pickColors);
    canvas.addEventListener('mouseup', e => colorArea(e));
  }

  rectangleTool() {
    this.changeTool();

    const canvas = [mainCanvas.getCanvas().canvas][0];
    const ctx = [mainCanvas.getCanvas().ctx][0];

    const canvasContainer = document.querySelector('.canvas-main-container');
    canvasContainer.appendChild(renderCanvas.create().canvas);
    renderCanvas.getCanvas().ctx.drawImage(canvas, 0, 0);
    instruments.showCanvasInfo(renderCanvas);

    let pixelsNumber = instruments.getCanvasSize();
    let divider = canvas.width / pixelsNumber;
    let x0 = null;
    let y0 = null;
    let x1 = null;
    let y1 = null;
    let isDrawing = false;

    function draw(e) {
      pixelsNumber = instruments.getCanvasSize();
      divider = canvas.width / pixelsNumber;

      renderCanvas.getCanvas().ctx.drawImage(canvas, 0, 0);

      x1 = Math.floor(e.offsetX / divider);
      y1 = Math.floor(e.offsetY / divider);
      renderCanvas.getCanvas().ctx.imageSmoothingEnabled = false;

      instruments.simpleBresenhams(x0, y0, x1, y0, divider, renderCanvas.getCanvas().ctx);
      instruments.simpleBresenhams(x1, y0, x1, y1, divider, renderCanvas.getCanvas().ctx);
      instruments.simpleBresenhams(x1, y1, x0, y1, divider, renderCanvas.getCanvas().ctx);
      instruments.simpleBresenhams(x0, y1, x0, y0, divider, renderCanvas.getCanvas().ctx);
    }

    function startDrawing(e) {
      isDrawing = true;
      pixelsNumber = instruments.getCanvasSize();
      divider = canvas.width / pixelsNumber;

      renderCanvas.getCanvas().ctx.drawImage(canvas, 0, 0);
      renderCanvas.getCanvas().canvas.style.opacity = '1';

      renderCanvas.getCanvas().ctx.fillStyle = colors.primaryColor;
      ctx.fillStyle = colors.primaryColor;
      if (e.button === 2) {
        renderCanvas.getCanvas().ctx.fillStyle = colors.secondaryColor;
        ctx.fillStyle = colors.secondaryColor;
      }

      x0 = Math.floor(e.offsetX / divider);
      y0 = Math.floor(e.offsetY / divider);

      renderCanvas.getCanvas().ctx.moveTo(x0, y0);
      renderCanvas.getCanvas().canvas.addEventListener('mousemove', draw);
    }

    function stopDrawing(e) {
      renderCanvas.getCanvas().canvas.removeEventListener('mousemove', draw);
      renderCanvas.getCanvas().canvas.style.opacity = '0';

      ctx.imageSmoothingEnabled = false;

      x1 = Math.floor(e.offsetX / divider);
      y1 = Math.floor(e.offsetY / divider);

      instruments.simpleBresenhams(x0, y0, x1, y0, divider, ctx);
      instruments.simpleBresenhams(x1, y0, x1, y1, divider, ctx);
      instruments.simpleBresenhams(x1, y1, x0, y1, divider, ctx);
      instruments.simpleBresenhams(x0, y1, x0, y0, divider, ctx);

      isDrawing = false;
      frames.render();
    }

    function stopDrawingOut(e) {
      renderCanvas.getCanvas().canvas.removeEventListener('mousemove', draw);
      renderCanvas.getCanvas().canvas.style.opacity = '0';

      ctx.imageSmoothingEnabled = false;

      if (e.type === 'mouseout' && !isDrawing) return;

      x1 = Math.floor(e.offsetX / divider);
      y1 = Math.floor(e.offsetY / divider);

      instruments.simpleBresenhams(x0, y0, x1, y0, divider, ctx);
      instruments.simpleBresenhams(x1, y0, x1, y1, divider, ctx);
      instruments.simpleBresenhams(x1, y1, x0, y1, divider, ctx);
      instruments.simpleBresenhams(x0, y1, x0, y0, divider, ctx);

      frames.render();
    }

    renderCanvas.getCanvas().canvas.addEventListener('mousedown', startDrawing);
    renderCanvas.getCanvas().canvas.addEventListener('mouseout', stopDrawingOut);
    renderCanvas.getCanvas().canvas.addEventListener('mouseup', stopDrawing);
  }

  moveTool() {
    this.changeTool();
    const canvas = [mainCanvas.getCanvas().canvas][0];
    const ctx = [mainCanvas.getCanvas().ctx][0];

    const canvasContainer = document.querySelector('.canvas-main-container');
    canvasContainer.appendChild(renderCanvas.create().canvas);
    renderCanvas.getCanvas().ctx.drawImage(canvas, 0, 0);
    instruments.showCanvasInfo(renderCanvas);

    const renderCtx = renderCanvas.getCanvas().ctx;
    const renderCanvasC = renderCanvas.getCanvas().canvas;

    renderCtx.imageSmoothingEnabled = false;

    let pixelsNumber = instruments.getCanvasSize();
    let divider = canvas.width / pixelsNumber;
    let x0 = null;
    let y0 = null;
    let x1 = null;
    let y1 = null;
    let isDrawing = false;

    function move(e) {
      pixelsNumber = instruments.getCanvasSize();
      divider = canvas.width / pixelsNumber;

      renderCanvas.clearCanvas();
      // .getCanvas()
      // .ctx.clearRect(
      //   0,
      //   0,
      //   renderCanvas.getCanvas().canvas.height,
      //   renderCanvas.getCanvas().canvas.width
      // );

      x1 = e.offsetX;
      y1 = e.offsetY;

      x1 = Math.floor(x1 / divider);
      y1 = Math.floor(y1 / divider);

      canvas.style.opacity = '0';

      renderCtx.drawImage(canvas, (x1 - x0) * divider, (y1 - y0) * divider);
    }

    function startMoving(e) {
      renderCanvas.getCanvas().ctx.drawImage(canvas, 0, 0);
      canvas.style.opacity = '0';
      canvasHelper.getCanvas().canvas.style.opacity = '0';
      pixelsNumber = instruments.getCanvasSize();
      divider = canvas.width / pixelsNumber;
      x0 = e.offsetX;
      y0 = e.offsetY;
      isDrawing = true;

      x0 = Math.floor(x0);
      y0 = Math.floor(y0);
      x0 = Math.floor(x0 / divider);
      y0 = Math.floor(y0 / divider);

      renderCanvasC.style.opacity = '1';

      renderCanvasC.addEventListener('mousemove', move);
    }

    function stopMoving(e) {
      renderCanvasC.removeEventListener('mousemove', move);

      x1 = Math.floor(e.offsetX / divider);
      y1 = Math.floor(e.offsetY / divider);

      ctx.imageSmoothingEnabled = false;
      isDrawing = false;

      mainCanvas.clearCanvas();
      canvas.style.opacity = '1';
      ctx.drawImage(renderCanvasC, 0, 0);
      frames.render();

      canvasHelper.getCanvas().canvas.style.opacity = '1';
      renderCanvasC.style.opacity = '0';
    }

    function stopMovingOut(e) {
      renderCanvasC.removeEventListener('mousemove', move);
      if (e.type === 'mouseout' && !isDrawing) return;

      x1 = Math.floor(e.offsetX / divider);
      y1 = Math.floor(e.offsetY / divider);

      ctx.imageSmoothingEnabled = false;

      mainCanvas.clearCanvas();
      canvas.style.opacity = '1';
      ctx.drawImage(renderCanvasC, 0, 0);
      frames.render();

      canvasHelper.getCanvas().canvas.style.opacity = '1';
      renderCanvasC.style.opacity = '0';
    }

    renderCanvasC.addEventListener('mousedown', startMoving);
    renderCanvasC.addEventListener('mouseout', stopMovingOut);
    renderCanvasC.addEventListener('mouseup', stopMoving);
  }

  colorSwap() {
    this.changeTool();

    let canvas = [mainCanvas.getCanvas().canvas][0];
    let ctx = [mainCanvas.getCanvas().ctx][0];
    let pixelsNumber = instruments.getCanvasSize();
    let divider = canvas.width / pixelsNumber;
    let fillColor = null;

    ctx.fillStyle = colors.primaryColor;

    function pickColors(event) {
      if (event.button === 2) {
        fillColor = instruments.convertHexToRgba(colors.secondaryColor);
        ctx.fillStyle = colors.secondaryColor;
      } else {
        ctx.fillStyle = colors.primaryColor;
        fillColor = instruments.convertHexToRgba(colors.primaryColor);
      }
    }

    function colorArea(e) {
      [canvas, ctx] = [[mainCanvas.getCanvas().canvas][0], [mainCanvas.getCanvas().ctx][0]];
      pixelsNumber = instruments.getCanvasSize();
      divider = canvas.width / pixelsNumber;

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let cX0 = e.offsetX;
      let cY0 = e.offsetY;

      cX0 = Math.floor(cX0);
      cY0 = Math.floor(cY0);

      const rgba0 = instruments.getPixelColor(imgData, cX0, cY0);

      const startR = rgba0.r;
      const startG = rgba0.g;
      const startB = rgba0.b;

      [canvas, ctx] = [[mainCanvas.getCanvas().canvas][0], [mainCanvas.getCanvas().ctx][0]];
      pixelsNumber = instruments.getCanvasSize();

      divider = canvas.width / pixelsNumber;

      if (startR == fillColor.r && startG == fillColor.g && startB == fillColor.b) return;

      let i = 0;
      let j = 0;

      while (i < canvas.height) {
        j = 0;
        while (j < canvas.width) {
          const rgba1 = instruments.getPixelColor(imgData, j, i);

          if (startR == rgba1.r && startG == rgba1.g && startB == rgba1.b) {
            ctx.fillRect(j, i, 1, 1);
          }
          j += 1;
        }
        i += 1;
      }
      frames.render();
    }

    canvas.addEventListener('mousedown', pickColors);
    canvas.addEventListener('mouseup', e => colorArea(e));
  }

  rotateTool() {
    const canvas = [mainCanvas.getCanvas().canvas][0];
    const ctx = [mainCanvas.getCanvas().ctx][0];
    const canvas2 = canvasHelper.getCanvas().canvas;
    const ctx2 = canvasHelper.getCanvas().ctx;

    ctx.save();
    ctx2.drawImage(canvas, 0, 0);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.drawImage(canvas2, -canvas.width / 2, -canvas.width / 2);
    ctx.restore();

    frames.render();
  }

  ditheringTool() {
    this.changeTool();

    this.PenTool();
  }

  circleTool() {
    this.changeTool();

    const canvas = [mainCanvas.getCanvas().canvas][0];
    const ctx = [mainCanvas.getCanvas().ctx][0];

    const canvasContainer = document.querySelector('.canvas-main-container');
    canvasContainer.appendChild(renderCanvas.create().canvas);
    renderCanvas.getCanvas().ctx.drawImage(canvas, 0, 0);
    instruments.showCanvasInfo(renderCanvas);

    let pixelsNumber = instruments.getCanvasSize();
    let divider = canvas.width / pixelsNumber;
    let x0 = null;
    let y0 = null;
    let x1 = null;
    let y1 = null;
    let isDrawing = false;

    function draw(e) {
      pixelsNumber = instruments.getCanvasSize();
      divider = canvas.width / pixelsNumber;

      renderCanvas.getCanvas().ctx.drawImage(canvas, 0, 0);

      x1 = Math.floor(e.offsetX / divider);
      y1 = Math.floor(e.offsetY / divider);

      instruments.circleBresenhams(
        x0 * divider,
        y0 * divider,
        x1 * divider,
        y1 * divider,
        divider,
        renderCanvas.getCanvas().ctx
      );
    }

    function startDrawing(e) {
      if (e.button === 1) return;

      isDrawing = true;

      pixelsNumber = instruments.getCanvasSize();
      divider = canvas.width / pixelsNumber;

      renderCanvas.getCanvas().ctx.drawImage(canvas, 0, 0);
      renderCanvas.getCanvas().canvas.style.opacity = '1';

      renderCanvas.getCanvas().ctx.fillStyle = colors.primaryColor;
      ctx.fillStyle = colors.primaryColor;
      if (e.button === 2) {
        renderCanvas.getCanvas().ctx.fillStyle = colors.secondaryColor;
        ctx.fillStyle = colors.secondaryColor;
      }

      x0 = Math.floor(e.offsetX / divider);
      y0 = Math.floor(e.offsetY / divider);

      renderCanvas.getCanvas().ctx.moveTo(x0, y0);
      renderCanvas.getCanvas().canvas.addEventListener('mousemove', draw);
    }

    function stopDrawing(e) {
      renderCanvas.getCanvas().canvas.removeEventListener('mousemove', draw);
      renderCanvas.getCanvas().canvas.style.opacity = '0';

      x1 = Math.floor(e.offsetX / divider);
      y1 = Math.floor(e.offsetY / divider);

      instruments.circleBresenhams(
        x0 * divider,
        y0 * divider,
        x1 * divider,
        y1 * divider,
        divider,
        ctx
      );
      isDrawing = false;
      frames.render();
    }

    function stopDrawingOut(e) {
      renderCanvas.getCanvas().canvas.removeEventListener('mousemove', draw);

      if (e.type === 'mouseout' && !isDrawing) return;

      x1 = Math.floor(e.offsetX / divider);
      y1 = Math.floor(e.offset / divider);

      instruments.circleBresenhams(
        x0 * divider,
        y0 * divider,
        x1 * divider,
        y1 * divider,
        divider,
        ctx
      );
      frames.render();
      renderCanvas.getCanvas().canvas.style.opacity = '0';
    }

    renderCanvas.getCanvas().canvas.addEventListener('mousedown', startDrawing);
    renderCanvas.getCanvas().canvas.addEventListener('mouseout', stopDrawingOut);
    renderCanvas.getCanvas().canvas.addEventListener('mouseup', stopDrawing);
  }

  flipTool() {
    this.changeTool();

    const canvas = [mainCanvas.getCanvas().canvas][0];
    const ctx = [mainCanvas.getCanvas().ctx][0];
    const canvas2 = canvasHelper.getCanvas().canvas;
    const ctx2 = canvasHelper.getCanvas().ctx;

    ctx.save();

    ctx2.drawImage(canvas, 0, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(canvas2, -canvas.width, 0);

    ctx.restore();
  }

  keyPess(event) {
    const toolsList = document.querySelectorAll('.tool');

    if (event.code == 'KeyP') {
      instruments.active(toolsList[0], '.tool');
      this.PenTool(event);
    } else if (event.code == 'KeyL') {
      instruments.active(toolsList[1], '.tool');
      this.mirrorTool();
    } else if (event.code == 'KeyB') {
      instruments.active(toolsList[2], '.tool');
      this.bucketTool();
    } else if (event.code == 'KeyK') {
      instruments.active(toolsList[3], '.tool');
      this.colorSwap();
    } else if (event.code == 'KeyE') {
      instruments.active(toolsList[4], '.tool');
      this.eraserTool();
    } else if (event.code == 'KeyS') {
      instruments.active(toolsList[5], '.tool');
      this.StrokeTool();
    } else if (event.code == 'Digit7') {
      instruments.active(toolsList[6], '.tool');
      this.strangeTool();
    } else if (event.code == 'KeyR') {
      instruments.active(toolsList[7], '.tool');
      this.rectangleTool();
    } else if (event.code == 'KeyC') {
      instruments.active(toolsList[8], '.tool');
      this.circleTool();
    } else if (event.code == 'KeyM') {
      instruments.active(toolsList[9], '.tool');
      this.moveTool();
    } else if (event.code == 'KeyD') {
      instruments.active(toolsList[11], '.tool');
      this.ditheringTool();
    } else if (event.code == 'KeyT') {
      instruments.active(toolsList[12], '.tool');
      this.rotateTool();
    } else if (event.code == 'KeyF') {
      instruments.active(toolsList[13], '.tool');
      this.flipTool();
    }
  }

  addEventListeners() {
    const toolsList = document.querySelectorAll('.tool');

    toolsList[0].addEventListener('click', e => this.PenTool(e));
    toolsList[1].addEventListener('click', () => this.mirrorTool());
    toolsList[2].addEventListener('click', () => this.bucketTool());
    toolsList[3].addEventListener('click', () => this.colorSwap());
    toolsList[4].addEventListener('click', () => this.eraserTool());
    toolsList[5].addEventListener('click', () => this.StrokeTool());
    toolsList[6].addEventListener('click', () => this.strangeTool());
    toolsList[7].addEventListener('click', () => this.rectangleTool());
    toolsList[8].addEventListener('click', () => this.circleTool());
    toolsList[9].addEventListener('click', () => this.moveTool());
    toolsList[11].addEventListener('click', () => this.ditheringTool());
    toolsList[12].addEventListener('click', () => this.rotateTool());
    toolsList[13].addEventListener('click', () => this.flipTool());
  }

  changeTool() {
    const canvasContainer = document.querySelector('.canvas-main-container');
    if (canvasContainer.querySelector('#renderCanvas')) {
      canvasContainer.removeChild(renderCanvas.getCanvas().canvas);
    }
    const image = mainCanvas.convertToFrame(640);
    const canvas = mainCanvas.getCanvas().canvas.cloneNode();
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0, 640, 640);

    mainCanvas.getCanvas().canvas.parentNode.replaceChild(canvas, mainCanvas.getCanvas().canvas);

    canvas.addEventListener('mouseup', () => {
      frames.render();
    });
    canvas.addEventListener('mouseout', frames.render);
    instruments.showCanvasInfo(mainCanvas);
  }
}
