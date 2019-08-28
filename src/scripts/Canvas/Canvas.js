export default class Canvas {
  constructor(height, width, classT, idT) {
    this.height = height;
    this.width = width;
    this.classT = classT;
    this.idT = idT;
  }

  create() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = this.width;
    canvas.height = this.height;
    canvas.className = this.classT;
    canvas.id = this.idT;
    ctx.fillStyle = '#343a40';
    ctx.fillRect(0, 0, this.height, this.width);
    const obj = {};
    obj.canvas = canvas;
    obj.ctx = ctx;

    return obj;
  }

  getCanvas() {
    const obj = {};
    obj.canvas = document.querySelector(`#${this.idT}`);
    obj.ctx = obj.canvas.getContext('2d');

    return obj;
  }

  cloneCanvas(parentCanvas, width, height) {
    const newCtx = parentCanvas.getContext('2d');
    newCtx.clearRect(0, 0, width, height);
    newCtx.drawImage(this.getCanvas().canvas, 0, 0, width, height);

    return newCtx;
  }

  clearCanvas() {
    this.getCanvas().ctx.fillStyle = '#343a40';
    this.getCanvas().ctx.fillRect(0, 0, this.height, this.width);
  }

  convertToFrame(size) {
    const framesList = document.querySelectorAll('.frame');
    const imgUrl = this.getCanvas().canvas.toDataURL();
    const img = new Image();
    img.src = imgUrl;
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;
    img.classList = 'imgFrame';
    img.id = `frame_img_${framesList.length - 1}`;

    return img;
  }

  convertToImg(size) {
    const imgUrl = this.getCanvas().canvas.toDataURL();
    const img = new Image();
    img.src = imgUrl;
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;
    img.style.imageRendering = 'pixelated';

    return img;
  }

  refresh() {
    const framesList = document.querySelectorAll('.frame');
    let activeFrame = null;

    framesList.forEach(elem => {
      if (elem.classList.contains('active')) activeFrame = elem;
    });

    const activeImg = activeFrame.querySelector('.imgFrame');

    this.clearCanvas();
    this.getCanvas().ctx.imageSmoothingEnabled = false;
    this.getCanvas().ctx.drawImage(
      activeImg,
      0,
      0,
      this.getCanvas().canvas.width,
      this.getCanvas().canvas.height
    );
  }

  resize(event, selectSize, canvasHelper) {
    const canvas = [this.getCanvas().canvas][0];
    const ctx = [this.getCanvas().ctx][0];
    const framesImages = document.querySelectorAll('.imgFrame');
    const image = this.convertToImg(canvas.width);
    const framesList = document.querySelectorAll('.frame');

    const helperCtx = canvasHelper.getCanvas().ctx;

    const defaultSizeIndex = selectSize.selectedIndex;

    function resizeTwo(mainCanvas) {
      let scale = null;
      let scaleDefault = null;
      let size = null;
      let sizeDefault = null;

      const selectedSizeIndex = selectSize.selectedIndex;

      if (defaultSizeIndex === selectedSizeIndex) {
        selectSize.removeEventListener('change', resizeTwo);
        return;
      }

      if (defaultSizeIndex === 0) scaleDefault = 1;
      else scaleDefault = defaultSizeIndex * 2;
      if (selectedSizeIndex === 0) scale = 1;
      else scale = selectedSizeIndex * 2;

      mainCanvas.clearCanvas();

      ctx.imageSmoothingEnabled = false;

      if (scaleDefault < scale) {
        scale /= scaleDefault;
        sizeDefault = canvas.width;
        size = canvas.width / scale;
      } else {
        scaleDefault /= scale;
        sizeDefault = canvas.width / scaleDefault;
        size = canvas.width;
      }

      ctx.drawImage(image, 0, 0, sizeDefault, sizeDefault, 0, 0, size, size);
      ctx.imageSmoothingEnabled = false;

      framesImages.forEach((elem, index) => {
        canvasHelper.clearCanvas();
        helperCtx.imageSmoothingEnabled = false;
        helperCtx.drawImage(elem, 0, 0, sizeDefault, sizeDefault, 0, 0, size, size);

        const currentImg = canvasHelper.convertToFrame('104px');
        currentImg.id = `frame_img_${index}`;
        currentImg.draggable = 'true';
        framesList[index].replaceChild(currentImg, framesList[index].querySelector('.imgFrame'));
        framesList[index].style.backgroundImage = `url("${currentImg.src}")`;
      });

      selectSize.removeEventListener('change', resizeTwo);
    }

    selectSize.addEventListener('change', () => resizeTwo(this));
  }
}
