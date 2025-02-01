import icons from "url:../../img/icons.svg";

export default class View {
  _data;

  render(data) {
    this._data = data;

    const markup = this._generateMarkup();

    this.clear();

    this._parentElement?.insertAdjacentHTML("afterbegin", markup);
  }

  clear() {
    this._parentElement.innerHTML = "";
  }

  clearSpinner(name) {
    const element = document.querySelector(`.${name}`);
    element.innerHTML = "";
  }

  renderOverlaySpinner() {
    const element = document.querySelector(`.overlay__content`);
    const markup = `
      <div class="overlay__spinner">
        <svg class="total__icon--loader">
          <use href="${icons}#icon-loader"></use>
        </svg>
        <p class="overlay__confirm-text">${this._processingMessage}, please wait...</p>
      </div>
    `;

    element.innerHTML = "";
    element.insertAdjacentHTML("afterbegin", markup);
  }

  renderConfirmationSpinner(name, message) {
    const element = document.querySelector(`.overlay__content`);
    const markup = `
      <div class="overlay__spinner">
        <svg class="total__icon--smile">
          <use href="${icons}#icon-smile"></use>
        </svg>
        <p class="overlay__confirm-text">${this._confirmationMessage}! Thank you</p>
      </div>
    `;

    element.innerHTML = "";
    element.insertAdjacentHTML("afterbegin", markup);
  }

  removeOverlay() {
    if (document.querySelector(".overlay"))
      document.querySelector(".overlay").remove();
  }
}
