export default class Color {
  constructor(parametr) {
    this.parametr = parametr;
  }

  get primaryColor() {
    const color = document.querySelector('#main');
    return color.value;
  }

  get secondaryColor() {
    const color = document.querySelector('#secondary');
    return color.value;
  }

  get backgroundColor() {
    const color = '#343a40';
    return color;
  }
}
