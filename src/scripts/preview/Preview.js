export default class Preview {
  getParent() {
    const parent = document.querySelector('#preview');
    return parent;
  }

  getChild() {
    return this.getParent().childNodes[0];
  }

  showRate() {
    const rng = document.querySelector('#frame_rate');

    rng.addEventListener('input', () => {
      const rngValue = document.querySelector('#fps_value');
      rngValue.innerHTML = rng.value;
    });

    return rng.value;
  }

  startAnimation(counter) {
    const framesList = document.querySelectorAll('.imgFrame');
    const rng = document.querySelector('#frame_rate');
    const container = document.querySelector('#preview');
    rng.value = parseInt(rng.value, 10);

    const fpsValue = 1000 / rng.value;

    function animateFrames(frame) {
      container.style.backgroundImage = `url("${frame.src}")`;
      return 1;
    }

    if (counter < framesList.length) {
      if (rng.value != 0) {
        animateFrames(framesList[counter]);
        counter += 1;
      }
    } else counter = 0;

    setTimeout(() => this.startAnimation(counter), fpsValue);
    return 1;
  }
}
