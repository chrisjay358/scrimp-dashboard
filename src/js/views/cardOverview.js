import icons from "url:../../img/icons.svg";
import { formatCurrency } from "../helpers";

class cardOverview {
  _parentElement = document.querySelector(".content");

  addHandlerRenderCardDeletion(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      // Check for ele,emt
      const form = e.target.classList.contains("overview__form--delete");

      // Guard clause
      if (!form) return;

      handler(this._card, this._balance);
    });
  }

  addHandlerRenderCardPayment(handler) {
    this._parentElement?.addEventListener("click", (e) => {
      // Get element
      const btn = e.target.closest(".overview__btn-payment");

      // Guard clause
      if (!btn) return;

      handler(this._cardNum);
    });
  }

  addHandlerUpdateCardLimit(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      // Check for element
      const form = e.target.classList.contains("overview__form--limit");

      // Guard clause
      if (!form) return;

      // Get form data
      const dataArr = [...new FormData(e.target)];
      const formData = Object.fromEntries(dataArr);

      // Add card number
      formData.number = this._cardNum;

      handler(formData, this._goToTab, this._cardNum);
    });
  }

  addHandlerUpdateCard(handler) {
    // Set parent element
    this._parentElement = document.querySelector(".content");

    this._parentElement?.addEventListener("submit", (e) => {
      // Check for element
      const form = e.target.classList.contains("overview__form--settings");

      // Guard clause
      if (!form) return;

      // Get form data
      const dataArr = [...new FormData(e.target)];
      const formData = Object.fromEntries(dataArr);

      // Check if checkbox is checked
      if (formData.title) {
        const status = document.querySelector(".overview__form-input--status");
        formData.status = status.checked;
      }

      // Get parent element
      const parentContainer = document.querySelector(".showcase");

      // Get selected showcase tab
      const showcase = parentContainer.querySelector(".showcase--active");

      // Get card number
      formData.number =
        showcase?.querySelector(".showcase__digit").textContent ??
        this._cardNum;

      handler(formData, this._goToTab, this._cardNum);
    });
  }

  _addHandlerSelectActive(value) {
    // Get parent container
    const container = document.querySelector(".tab__container--overview");

    // Get child elements
    const children = container.children;

    // Remove active class
    Array.from(children, (item) => {
      item.classList.remove(`tab--active`);
    });

    // Get cuurent tab element
    const item = Array.from(children).find(
      (item) => item.dataset.btn === value
    );

    // Add active class
    item.classList.add("tab--active");
  }

  addHandlerRenderTab(handler) {
    // Get parene element
    const parentElement = document.querySelector(".main--card");

    parentElement?.addEventListener("click", (e) => {
      // Check for element
      const target = e.target.classList.contains("tab__content--overview");

      // Guard clause
      if (!target) return;

      const goToTab = e.target.dataset.btn;

      // Get parent element
      const parentContainer = document.querySelector(".showcase");

      // Set new properties
      this.goToTab = goToTab;

      const type = "card";

      handler(goToTab, this._cardNum, type);
    });
  }

  _getBalance(number) {
    const transactions = this._data.account.transactions.card.recent.filter(
      (el) => el.card.endsWith(+number)
    );

    return transactions.reduce((acc, num) => acc + +num.amount, 0);
  }

  render(data, goToTab, cardNum) {
    // Set properties
    this._data = data;
    this._parentElement = document.querySelector(".overview");
    this._cardNum = cardNum;
    this._goToTab = goToTab;

    // Get card
    this._card = this._data.account.card.recent.find((el) =>
      el.number.endsWith(+this._cardNum)
    );

    // Get card balance
    this._balance = this._getBalance(this._cardNum);

    const markup = this._generateMarkup(this._card, this._balance, goToTab);

    this._parentElement.innerHTML = "";

    this._parentElement.insertAdjacentHTML("beforeend", markup);

    this._addHandlerSelectActive(goToTab);
  }

  _generateMarkup(card, balance, goToTab) {
    return `
      <div class="overview__display">
        <div class="card card--spending">
          <div class="card__header">
            <p class="card__name">${card.title[0].toUpperCase()}${card.title.slice(
      1
    )}</p>
            <span class="card__issuer">
              <svg class="card__icon">
                <use href="${icons}#icon-${card.issuer}"></use>
              </svg>
            </span>
          </div>
          <div class="card__body">
            <div class="card__balance">${formatCurrency(balance, "NGN")}</div>
            <div class="card__details">
              <div class="card__number">${card.number
                .slice(-4)
                .padStart(card.number.length, "*")}</div>
              <div class="card__expiry-date">EXP ${card.expiryDate}</div>
            </div>
          </div>
          <div class="card__footer">
            <div class="card__holder-name">${card.name.toUpperCase()}</div>
            <div class="card__ccv">${card.ccv}</div>
          </div>
        </div>
        ${
          card.status
            ? `<button class="overview__btn-payment">Make payment</button>`
            : ""
        }
      </div>

      <div class="overview__content-container">
        <div class="tab__container tab__container--overview">
          <button class="tab__content tab__content--overview tab--active" data-btn="dt">Details</button>
          <button class="tab__content tab__content--overview" data-btn="lt">Limits</button>
          <button class="tab__content tab__content--overview" data-btn="st">Settings</button>
          <button class="tab__content tab__content--overview" data-btn="dc">Delete</button>
        </div>

        <div class="overview__content">
          ${this._generateMarkupContent(card, balance, goToTab)}
        </div>
      </div>
          `;
  }

  _generateMarkupContent(card, balance, value) {
    if (value === "dt") return this._generateMarkupDetails(card, balance);
    if (value === "lt") return this._generateMarkupLimit(card);
    if (value === "st") return this._generateMarkupSettings(card);
    if (value === "dc") return this._generateMarkupDelete(card);
  }

  _generateMarkupDetails(card, balance) {
    return `
      <header class="overview__content-header margin-bottom-sm">
        <h2 class="header__subtitle">Card information</h2>
      </header>

      <ul class="list">
        <li class="list__item">
          <h3 class="list__heading">Card Title</h3>
          <p class="list__text">
            ${card.title[0].toUpperCase()}${card.title.slice(1)}
          </p>
        </li>

        <li class="list__item">
          <h3 class="list__heading">Card Issuer</h3>
          <p class="list__text">
            ${card.issuer[0].toUpperCase()}${card.issuer.slice(1)}
          </p>
        </li>

        <li class="list__item">
          <h3 class="list__heading">Balance</h3>
          <p class="list__text">${formatCurrency(balance, "NGN")}</p>
        </li>

        <li class="list__item">
          <h3 class="list__heading">Card number</h3>
          <p class="list__text">${card.number}</p>
        </li>

        <li class="list__item">
          <h3 class="list__heading">Currency</h3>
          <p class="list__text">${card.currency}</p>
        </li>

        <li class="list__item">
          <h3 class="list__heading">Name on card</h3>
          <p class="list__text">${
            card.name[0].toUpperCase() + card.name.slice(1)
          }</p>
        </li>

        <li class="list__item">
          <h3 class="list__heading">Expiry date</h3>
          <p class="list__text">${card.expiryDate}</p>
        </li>

        <li class="list__item">
          <h3 class="list__heading">CCV</h3>
          <p class="list__text">${card.ccv}</p>
        </li>

        <li class="list__item">
          <h3 class="list__heading">Status</h3>
          <p class="list__text">${card.status ? "Active" : "Inactive"}</p>
        </li>

        <li class="list__item">
          <h3 class="list__heading">Card Type</h3>
          <p class="list__text">${card.type}</p>
        </li>
      </ul>
    `;
  }

  _generateMarkupLimit(data) {
    return `
      <header class="overview__content-header margin-bottom-sm">
        <h2 class="header__subtitle">Card Limits</h2>
      </header>

      <form class="overview__form overview__form--limit">
        <div class="overview__form-group margin-bottom-sm">
          <label for="transfer-limit" class="form__label overview__form-label">Deposit Limit</label>
          <input type="number" name="deposit" id="transfer-limit" class="form__input form-input overview__form-input--transfer" placeholder="Enter limit" ${
            data.limit.deposit ? `value=${data.limit.deposit}` : ""
          }>
        </div>
        
        <div class="overview__form-group margin-bottom-md">
          <label for="monthly-limit" class="form__label overview__form-label">Monthly Limit</label>
          <input type="number" name="monthly" id="monthly-limit" class="form__input form-input overview__form-input--monthly" placeholder="Enter limit" ${
            data.limit.monthly ? `value=${data.limit.monthly}` : ""
          }>
        </div>
        <button class="overview__form-btn">Increase limit</button>
      </form>
    `;
  }

  _generateMarkupSettings(data) {
    return `
      <header class="overview__content-header margin-bottom-sm">
        <h2 class="header__subtitle">Card settings</h2>
      </header>

      <form class="overview__form overview__form--settings">
        <div class="overview__form-group margin-bottom-sm">
          <label for="card-title" class="form__label overview__form-label">Card title</label>
          <input type="text" name="title" id="card-title" class="form__input overview__form-input--title" value="${
            data.title[0].toUpperCase() + data.title.slice(1)
          }">
        </div>
        <div class="overview__form-group margin-bottom-sm">
          <label for="card-name" class="form__label overview__form-label">Name on card</label>
          <input type="text" name="name" id="card-name" class="form__input  overview__form-input--name" value="${
            data.name[0].toUpperCase() + data.name.slice(1)
          }">
        </div>
        <div class="overview__form-group margin-bottom-md">
          <label for="card-status" class="form__label overview__form-label">Status</label>
          <input type="checkbox" name="status" id="card-status" value='status' class="overview__form-input--status" ${
            data.status ? "checked" : ""
          }>
        </div>
        <button class="overview__form-btn">Change</button>
      </form>
    `;
  }

  _generateMarkupDelete(data) {
    return `
      <header class="overview__content-header margin-bottom-sm">
        <h2 class="header__subtitle">Card Deletion</h2>
      </header>

      <form class="overview__form overview__form--delete">
        <div class="overview__form-group margin-bottom-sm">
          <label for="card-title" class="form__label overview__form-label">Delete card</label>
        </div>

        <button class="overview__form-btn overview__form-btn--delete">Remove card</button>
      </form>
    `;
  }
}

export default new cardOverview();
