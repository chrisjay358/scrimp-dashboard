class SingupView {
  _formElement = document.querySelector(".signup__form");
  _messageUsername = "Username already taken! Try another one";
  _messageEmail = "Email already exist! Try another one";
  _messagePassword = "Password does not match";

  addHandlerSignup(handler) {
    this._formElement?.addEventListener("submit", (e) => {
      e.preventDefault();

      // Get form data
      const dataArr = [...new FormData(e.target)];
      const data = Object.fromEntries(dataArr);

      // Set types
      const typeUser = "username";
      const typeEmail = "email";
      const typeConfirm = "confirm";

      handler(data, typeUser, typeEmail, typeConfirm);
    });
  }

  addHandlerCheckUsername(handler) {
    this._formElement
      ?.querySelector(".form__input--username")
      .addEventListener("blur", function (e) {
        // Set type
        const type = "username";
        handler(this.value, type);
      });
  }

  addHandlerCheckEmail(handler) {
    this._formElement
      ?.querySelector(".form__input--email")
      .addEventListener("blur", function (e) {
        // Set type
        const type = "email";
        handler(this.value, type);
      });
  }

  addHandlerCheckPassword(handler) {
    this._formElement
      ?.querySelector(".form__input--password")
      .addEventListener("input", function (e) {
        handler(this.value);
      });
  }

  addHandlerCheckConfirmPassword(handler) {
    // Get password element
    const password = document.querySelector(".form__input--password");

    this._formElement
      ?.querySelector(".form__input--confirm")
      .addEventListener("input", function (e) {
        // Set Type
        const type = "confirm";
        handler(this.value, password.value, type);
      });
  }

  renderError(type) {
    const element = document.querySelector(`.form__input--${type}`);
    const parent = element.closest(`.form__group--${type}`);

    const markup = `
    <div class="error__message-box">
      <span class="error__message">
        ${
          type === "username"
            ? this._messageUsername
            : type === "email"
            ? this._messageEmail
            : this._messagePassword
        }
      </span>
    </div>
    `;

    if (parent.querySelector(".error__message-box"))
      parent.querySelector(".error__message-box").remove();

    element.closest(".form__group").insertAdjacentHTML("beforeend", markup);
  }

  removeError(type) {
    const element = document.querySelector(`.form__input--${type}`);
    const parent = element.closest(`.form__group--${type}`);

    if (parent.querySelector(".error__message-box"))
      parent.querySelector(".error__message-box").remove();
  }

  showcaseError() {
    // Get character element
    const charactersEl = document.querySelector(
      ".form__password-requirement--characters"
    );

    // Get number element
    const numberEl = document.querySelector(
      ".form__password-requirement--number"
    );

    // Remove class
    charactersEl.classList.remove("form__success-text");
    numberEl.classList.remove("form__success-text");

    // Add class
    charactersEl.classList.add("form__error-text");
    numberEl.classList.add("form__error-text");
  }

  showcaseSuccess(character, number) {
    // Get character element
    const charactersEl = document.querySelector(
      ".form__password-requirement--characters"
    );
    // Get number element
    const numberEl = document.querySelector(
      ".form__password-requirement--number"
    );

    // Add class
    if (character)
      charactersEl.classList.replace("form__error-text", "form__success-text");

    // Add class
    if (number)
      numberEl.classList.replace("form__error-text", "form__success-text");
  }

  showCase(type, className) {
    const element = document.querySelector(
      `.form__password-requirement--${type}`
    );
    if (className === "error") {
      element.classList.remove("form__success-text");
      element.classList.add(`form__${className}-text`);
    } else {
      element.classList.replace("form__error-text", `form__${className}-text`);
    }
  }
}

export default new SingupView();
