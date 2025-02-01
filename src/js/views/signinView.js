class SinginView {
  _formElement = document.querySelector(".login__form");

  addHandlerAuthenticate(handler) {
    this._formElement?.addEventListener("submit", function (e) {
      e.preventDefault();
      // Get form data
      const dataArr = [...new FormData(e.target)];
      const data = Object.fromEntries(dataArr);
      handler(data);
    });
  }

  renderError() {
    const markup = `
    <div class="form__error-box">
      <p class="form__error-text">
      Incorrect username or password. Please try again!
      </p>
    </div>
    `;

    if (document.querySelector(".form__error-box"))
      document.querySelector(".form__error-box").remove();

    this._formElement.insertAdjacentHTML("beforebegin", markup);

    this._formElement.querySelector(".form__input--password").value = "";

    setTimeout(() => {
      document.querySelector(".form__error-box").remove();
    }, 3000);
  }
}

export default new SinginView();
