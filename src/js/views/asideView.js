import View from "./View.js";
import icons from "url:../../img/icons.svg";
import { formatCurrency } from "../helpers.js";
import exchangeView from "./exchangeView.js";

class AsideView extends View {
  _parentElement = document.querySelector(".aside");

  addHandlerRenderUser(handler) {}

  addHandlerQuickTransfer(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      const form = e.target.classList.contains("quick-transfer__form");

      const inputEl = e.target.querySelector(".quick-transfer__amount");

      const recipinet = e.target.querySelector(".quick-transfer__recipient");

      // Guard clause
      if (!form) return;

      // Get button text content
      const button = e.submitter.textContent.toLowerCase();

      // Get form data
      const formData = Object.fromEntries([...new FormData(e.target)]);

      // Button text content is clear
      if (button === "clear") {
        // Clear elements
        if (recipinet) recipinet.value = "";
        inputEl.value = "";
        return;
      }

      // Button text content is transfer
      if (button === "transfer" && formData.amount) handler(formData);
    });
  }

  _getRandomNumber(max) {
    const random = Math.floor(Math.random() * (max - 0)) + 0;
    return random;
  }

  _generateMarkup() {
    return `
      ${this._generateMarkupCard()} ${this._generateMarkupExchange()} ${this._generateMarkupQuickTransfer()}
    `;
  }

  _generateMarkupCard() {
    const recent = this._data.account.card.recent;
    const card = recent[this._getRandomNumber(recent.length)];
    const balance = this._data.account.transactions.card.recent
      .filter((el) => el.card.endsWith(+card.number.slice(-3)))
      .reduce((acc, num) => acc + +num.amount, 0);

    if (!card) return `<p class="empty-transaction">No card created yet</p>`;
    return `
      <div class="card card--home">
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
    `;
  }

  _generateMarkupExchange() {
    return `
      <div class="exchange">
        ${exchangeView._generateMarkup()}
      </div>
    `;
  }

  _generateMarkupQuickTransfer() {
    const recipeint = this._data.account.recipients.recent;

    return `
      <div class="quick-transfer">
        <header class="quick-transfer__header">
          <h2 class="header__subtitle">Quick Transfer</h2>
        </header>

        <form class="quick-transfer__form">
          ${
            recipeint.length >= 1
              ? `
              <div class="quick-transfer__form-group">
                <select name="recipient" class="quick-transfer__recipient">
                  <option value="">--Select a recipient--</option>
                  ${recipeint
                    .map((el) => this._generateMarkupRecipient(el))
                    .join("")}
                </select>
              </div>
                  `
              : "<p class='empty-recipient'>No recipient</p>"
          }
          <div class="quick-transfer__form-group">
            <label for="card-number" class="quick-transfer__label">Enter Amount</label>
            <input type="number" name="amount" id="transfer-number" class="quick-transfer__amount" step="0.01">
          </div>
            
          <div class="quick-transfer__buttons">
          <button class="btn btn--quick-transfer">Transfer</button>
          <button class="btn btn--quick-clear">Clear</button>
          </div>
        </form>

      </div>
    `;
  }

  _generateMarkupRecipient(data) {
    return `
      <option value="${data.username}">${data.fullname}</option>
    `;
  }
}

export default new AsideView();
