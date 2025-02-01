import View from "./View";
import { formatCurrency, getMonth, getYear } from "../helpers";

class CardTopUpView extends View {
  _parentElement = document.querySelector(".content");
  _processingMessage = "Funding card";
  _confirmationMessage = "Funded";

  addHandlerTopUpCard(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      e.preventDefault();
      // Check for element
      const form = e.target.classList.contains("overlay__form--card-topup");

      // Guard clause
      if (!form) return;

      // Get account balance
      const balance = this._data.account.transactions.bank.recent.reduce(
        (acc, num) => acc + +num.amount,
        0
      );

      // Get card name from selected text content
      const cardTitle = e.target[0].selectedOptions[0].textContent;

      // Get form data
      const formData = Object.fromEntries([...new FormData(e.target)]);

      const remainingMonthlyDepositBalance =
        this._getCardDepositLimit(formData.card) -
        this._getCardTotalDeposit(formData.card);

      // Check that card total deposit is not greater than card deposit limit
      if (
        this._getCardTotalDeposit(formData.card) >=
        this._getCardDepositLimit(formData.card)
      )
        return this._renderError("Monthly deposit limit reached");

      // Check that account balance is greater than funding amount
      if (+formData.fundingAmount > balance)
        return this._renderError("Low account balance, try again");

      // Check that funding amount equal/lesser 0
      if (+formData.fundingAmount <= 0)
        return this._renderError(`Amount must exceed 0`);

      // Check that card total deposit + new deposit is not greater than card limit
      if (
        this._getCardTotalDeposit(formData.card) + +formData.fundingAmount >
        this._getCardDepositLimit(formData.card)
      )
        return this._renderError(
          `Amount exceeds limit. Remaining deposit limit for ${getMonth()} is ${formatCurrency(
            remainingMonthlyDepositBalance,
            "NGN"
          )}`
        );

      // Add selected text content to form data
      formData.name = cardTitle;
      formData.topup = true;

      handler(formData, this);
    });
  }

  _getCardDepositLimit(cardNum) {
    // Get limit
    const limit = this._data.account.card.recent.find((card) =>
      card.number.endsWith(cardNum)
    )?.limit.deposit;
    return limit;
  }

  _getCardTotalDeposit(cardNum) {
    // Get total deposit
    return this._data.account.transactions.bank.recent
      .filter(
        (el) =>
          el.topup &&
          el.month === getMonth() &&
          el.year === getYear() &&
          el.name.includes(cardNum)
      )
      .map((el) => Math.abs(el.amount))
      .reduce((acc, deposit) => acc + deposit, 0);
  }

  render(data) {
    this._data = data;
    const overlay = document.querySelector(".overlay");

    const markup = this.generateMarkup();

    if (overlay) overlay.remove();

    this._parentElement.insertAdjacentHTML("beforeend", markup);
  }

  generateMarkup() {
    const cards = this._data.account.card.recent;

    return `
      <div class="overlay">
        <div class="overlay__card overlay__card--topup">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">Card Top Up</h2>
            </header>
            <form class="overlay__form overlay__form--card-topup">
              <div class="overlay__form-group margin-bottom-sm">
                <label for="card-type" class="overlay__form-label">Select card</label>
                <select name="card" id="card-type" class="overlay__form-select overlay__form-select--type" required>
                <option value="">Card to debit</option>
                ${cards.map((el) => this._generateMarkupCard(el)).join("")}
                </select>
              </div>

              <div class="overlay__form-group overlay__form-group--amount">
                <label for="amount" class="overlay__form-label">Amount</label>
                <input
                  type="number"
                  name="fundingAmount"
                  id="amount"
                  step="0.01"
                  class="overlay__form-input overlay__form-input--amount"
                  placeholder="Enter amount"
                  required
                />
            </div>
            <div class="overlay__btn-group">
              <button class="overlay__btn-form overlay__btn-form--topup">Top up</button>
            </div>
            </form>
          </div>
        </div>
      </div>
   `;
  }

  _generateMarkupCard(data) {
    return `
      <option value="${data.number.slice(-4)}">${
      data.title[0].toUpperCase() + data.title.slice(1)
    } - ${data.number.slice(-4)}</option>
    `;
  }

  _renderError(message) {
    const formElement = document.querySelector(".overlay__form--card-topup");
    const markup = `
    <div class="form__error-box">
      <p class="form__error-text">
        ${message}
      </p>
    </div>
    `;

    // Remove overlay
    if (document.querySelector(".form__error-box"))
      document.querySelector(".form__error-box").remove();

    formElement?.insertAdjacentHTML("beforebegin", markup);

    setTimeout(() => {
      document.querySelector(".form__error-box").remove();
    }, 3000);
  }
}

export default new CardTopUpView();
