import View from "./View.js";

class SettingsView extends View {
  _parentElement = document.querySelector(".main--settings");

  constructor() {
    super();
    this._addHandlerHideWindow();
  }

  _addHandlerHideWindow() {
    this._parentElement
      ?.closest(".content")
      .addEventListener("click", function (e) {
        if (
          e.target.classList.contains("overlay") ||
          e.target.classList.contains("overlay__btn-close")
        ) {
          e.target.closest(".overlay").remove();
        }
      });
  }

  addHandlerRenderTab(handler) {
    this._parentElement?.addEventListener("click", (e) => {
      // Check for element
      const preview = e.target.classList.contains("tab__content--preview");

      // Guard clause
      if (!preview) return;

      // Get data attribute
      const btn = e.target.dataset.btn;

      // Select active tab
      const container = e.target.closest(".tab__container--preview");

      // Select all child elements
      const children = container.children;

      // Remove active class
      Array.from(children, (item) => {
        item.classList.remove(`tab--active`);
      });

      // // Add active class
      e.target.classList.add(`tab--active`);

      // Set type
      const type = "settings";

      handler(btn, type);
    });
  }

  addHandlerUpdateProfile(handler) {
    this._parentElement?.addEventListener("submit", function (e) {
      // Check for element
      const profile = e.target.classList.contains("preview__form--profile");
      const limit = e.target.classList.contains("preview__form--limit");

      // Guard clause
      if (!profile || !limit) return;

      // Get form data
      const dataArr = [...new FormData(e.target)];
      const obj = Object.fromEntries(dataArr);

      // Gaurd clause
      if (!obj) return;

      handler(obj);
    });
  }

  addHandlerRenderBeneficiaryRemoval(handler) {
    this._parentElement?.addEventListener("click", (e) => {
      // Check for element
      const btn = e.target.classList.contains("beneficiary__btn-remove");

      // Guard clause
      if (!btn) return;

      // Get username
      const fullname =
        this._parentElement.querySelector(".beneficiary__name").textContent;

      const username = this._parentElement.querySelector(
        ".beneficiary__username"
      ).textContent;

      handler(fullname, username);
    });
  }

  addHandlerRenderAccountRemoval(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      e.preventDefault();
      // Check for element
      const btn = e.target.classList.contains("preview__form--delete-account");

      // Guard clause
      if (!btn) return;

      // Get properties
      const fullname = `${this._data.firstname} ${this._data.lastname}`;
      const username = this._data.username;

      handler(fullname, username);
    });
  }

  update(data, value) {
    this._data = data;
    this._parentElement = document.querySelector(".preview__content");

    let markup;

    if (value === "pf") markup = this._generateMarkupProfile(this._data);
    if (value === "bc") markup = this._generateMarkupBeneficiary(this._data);
    if (value === "lt") markup = this._generateMarkupLimit(this._data);
    if (value === "da") markup = this._generateMarkupDeleteAccount(this._data);

    this._parentElement.innerHTML = "";
    this._parentElement.insertAdjacentHTML("beforeend", markup);
  }

  _generateMarkup() {
    return `
      <div class="preview">
        <div class="tab__container tab__container--preview margin-bottom-md">
          <button class="tab__content tab__content--preview tab--active" data-btn="pf">My Profile</button>
          <button class="tab__content tab__content--preview" data-btn="bc">Beneficiaries</button>
          <button class="tab__content tab__content--preview" data-btn="lt">Limits</button>
          <button class="tab__content tab__content--preview" data-btn="da">Delect Account</button>
        </div>


        <div class="preview__content">
          ${this._generateMarkupProfile(this._data)}
        </div>
      </div>
    `;
  }

  _generateMarkupProfile(data) {
    return `
      <figure class="preview__user margin-bottom-md">
        <div class="preview__user-img">
          <p class="preview__user-name">
            ${data.firstname[0]}${data.lastname[0]}
          </p>
        </div>
      </figure>

      <form class="preview__form preview__form--profile">
        <div class="form__groups">
          <div class="form__group">
            <label for="first-name" class="form__label">
              First Name
            </label>
            <input
              type="text"
              name="first-name"
              id="first-name"
              class="form__input preview__input"
              value="${data.firstname}"
              disabled
            />
          </div>

          <div class="form__group">
            <label for="last-name" class="form__label">
              Last Name
            </label>
            <input
              type="text"
              name="last-name"
              id="lasr-name"
              class="form__input preview__input"
              value="${data.lastname}"
              disabled
              readonly
            />
          </div>
        </div>

        <div class="form__groups">
          <div class="form__group">
            <label for="username" class="form__label">
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              class="form__input preview__input"
              value="${data.username}"
              readonly
              disabled
            />
          </div>

          <div class="form__group">
            <label for="email" class="form__label">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              class="form__input preview__input"
              value="${data.email}"
              readonly
              disabled
            />
          </div>
        </div>

        <div class="form__groups">
          <div class="form__group">
            <label for="phone" class="form__label">
              Phone no
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
              class="form__input preview__input"
              value="${data.phone}"
              eadonly
              disabled
            />
          </div>

          <div class="form__group">
            <label for="country" class="form__label">
              Country
            </label>
            <input
              type="text"
              name="country"
              id="country"
              class="form__input preview__input"
              value="Nigeria"
              readonly
              disabled
            />
          </div>
        </div>

        <div class="form__groups">
          <div class="form__group">
            <label for="nationality" class="form__label">
              Nationality
            </label>

            <input
              type="text"
              name="nationality"
              id="nationality"
              class="form__input ${data.nationality ? " preview__input" : ""}"
              ${
                data.nationality
                  ? `value=${data.nationality[0].toUpperCase()}${data.nationality.slice(
                      1
                    )}`
                  : ""
              }
              ${data.nationality ? "readonly" : ""}
              ${data.nationality ? "disabled" : ""}
              ${data.nationality ? "" : "required"}
              placeholder="Where are you really from?"
            />
          </div>
              
          <div class="form__group">
            <label for="address" class="form__label">
              Address
            </label>

            <input
              type="text"
              name="address"
              id="address"
              class="form__input ${data.address ? " preview__input" : ""}"
              ${
                data.address
                  ? `value=${data.address[0].toUpperCase()}${data.address.slice(
                      1
                    )}`
                  : ""
              }
              ${data.address ? "readonly" : ""}
              ${data.address ? "disabled" : ""}
              ${data.address ? "" : "required"}
              placeholder="Where do you live?"
            />
          </div>
        </div>
              
        <div class="form__groups">
          <div class="form__group">
            <label for="dob" class="form__label">
              Date of Birth
            </label>

            <input
              type="date"
              name="dob"
              id="dob"
              class="form__input ${data.dob ? " preview__input" : ""}"
              ${data.dob ? `value=${data.dob}` : ""}
              ${data.dob ? "readonly" : ""}
              ${data.dob ? "disabled" : ""}
              ${data.dob ? "" : "required"}
            />
          </div>
              
          <div class="form__group">
            <label for="username" class="form__label">
            Occupation
            </label>

            <input
              type="text"
              name="occupation"
              id="occupation"
              class="form__input ${data.occupation ? "preview__input" : ""}"
              ${
                data.occupation
                  ? `value=${data.occupation[0].toUpperCase()}${data.occupation.slice(
                      1
                    )}`
                  : ""
              }
              ${data.occupation ? "readonly" : ""}
              ${data.occupation ? "disabled" : ""}
              ${data.occupation ? "" : "required"}
              placeholder="Your occupation"
            />
          </div>
        </div>
        <button class="preview__button ">Save</button>
      </form>
    `;
  }

  _generateMarkupBeneficiary() {
    const recipeint = this._data.account.recipients.recent;

    return `
   


      ${
        recipeint.length >= 1
          ? `
          <ul class="beneficiary__list">
            ${recipeint
              .map((el) => this._generateMarkupBeneficiaryItem(el))
              .join("")}
          </ul>
              `
          : "<p class='empty-recipient'>No beneficiary</p>"
      }

  `;
  }

  _generateMarkupBeneficiaryItem(data) {
    const name = data.fullname.split(" ");
    return `
      <li class="beneficiary__item">
      <button class="beneficiary__btn-remove">x</button>
        <figure class="beneficiary__content">
          <div class="beneficiary__avatar">${name[0][0].toUpperCase()}${name[1][0].toUpperCase()}</div>
          <figcaption class="beneficiary__details">
            <p class="beneficiary__name">${data.fullname}</p>
            <span class="beneficiary__username">${data.username}</span>
          </figcaption>
        </figure>
     </li>
    `;
  }

  _generateMarkupLimit(data) {
    return `
      <form class="preview__form preview__form--limit">
        <div class="form__group">
          <label for="deposit-limit" class="form__label">
            Deposit Limit
          </label>
          <input
            type="number"
            name="deposit"
            id="deposit-limit"
            class="form__input"
            value="${data.account.limit.deposit}"
            min="100000"
            />
            </div>
            
            <div class="form__group">
            <label for="transfer-limit" class="form__label">
            Transfer Limit
            </label>
            <input
            type="number"
            name="transfer"
            id="transfer-limit"
            class="form__input"
            value="${data.account.limit.transfer}"
          />
        </div>

        <button class="preview__button">Increase Transaction Limit</button>
      </form>
    `;
  }

  _generateMarkupDeleteAccount(data) {
    return `
      <form class="preview__form preview__form--delete-account">

        <button class="preview__button preview__button--delete">Delete Account</button>
      </form>
    `;
  }
}

export default new SettingsView();
