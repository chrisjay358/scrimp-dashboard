import View from "./View";
import { formatCurrency, getMonth, getYear } from "../helpers";

class CardPaymentView extends View {
  _parentElement = document.querySelector(".content");
  _processingMessage = "Making payment";
  _confirmationMessage = "Payment made";

  addHandlerMakePayment(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      // Check for element
      const form = e.target.classList.contains("overlay__form--card-payment");

      // Guard clause
      if (!form) return;

      // Get form data
      const dataArr = [...new FormData(e.target)];
      const formData = Object.fromEntries(dataArr);

      // Get remaining spending balance
      const remainingMonthlyExpenseBalance =
        this._getCardMonthlyLimit() - this._getCardTotalExpenses();

      // Set values
      const cardMonthlyLimit = this._getCardMonthlyLimit();
      const cardTotalExpenses = this._getCardTotalExpenses();

      // Get card available balance
      const cardBalance = this._data.account.transactions.card.recent
        .filter((el) => el.card.endsWith(+this._cardNumber))
        .reduce((acc, num) => acc + +num.amount, 0);

      // Monthly spending limit has reach for card
      if (cardTotalExpenses >= cardMonthlyLimit)
        return this._renderError("Monthly spending limit reached");

      // Check that card balance is capable
      if (+formData.deposit > cardBalance)
        return this._renderError("Low balance... Top up!");

      // Check that deposit amount is lesser/equal 0
      if (+formData.deposit <= 0)
        return this._renderError(`Amount must exceed 0`);

      // Total card expenses + transfer amount is not greater than monthly limit
      if (cardTotalExpenses + +formData.deposit > cardMonthlyLimit)
        return this._renderError(
          `Amount exceeds limit. Remaining monthly limit for ${getMonth()} is ${formatCurrency(
            remainingMonthlyExpenseBalance,
            "NGN"
          )}`
        );

      handler(formData, this);
    });
  }

  _getCardMonthlyLimit() {
    // Get limit
    return this._data.account.card.recent.find((card) =>
      card.number.endsWith(+this._cardNumber)
    )?.limit.monthly;
  }

  _getCardTotalExpenses() {
    // Get total deposit
    return this._data.account.transactions.card.recent
      .filter(
        (el) =>
          el.amount < 1 &&
          el.type === "Debit" &&
          el.month === getMonth() &&
          el.year === getYear() &&
          el.card.endsWith(+this._cardNumber)
      )
      .map((el) => Math.abs(el.amount))
      .reduce((acc, deposit) => acc + deposit, 0);
  }

  render(data, cardNumber) {
    this._data = data;
    this._cardNumber = cardNumber;

    const overlay = document.querySelector(".overlay");

    const markup = this._generateMarkup();
    if (overlay) overlay.remove();

    this._parentElement.insertAdjacentHTML("beforeend", markup);
  }

  _generateMarkup() {
    const cards = this._data.account.card.recent;

    return `
      <div class="overlay">
        <div class="overlay__card overlay__card--payment">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">Make payment</h2>
            </header>
        
            <form class="overlay__form overlay__form--card-payment">
              <div class="overlay__form-group">
                <label for="recipient-name" class="overlay__form-label">Recipient name</label>
                <input type="text" name="recipient" id="recipient-name" class="overlay__form-input overlay__form-input--recipient" placeholder="Enter recipient name" required>
              </div>

              <div class="overlay__form-group">
                <label for="card-category" class="overlay__form-label">Category</label>
                <select name="category" id="card-category" class="overlay__form-select overlay__form-select--type" required>
                  <option value="">Select category</option>
                  <option value="housing">Hosuing</option>
                  <option value="transportation">Transportation</option>
                  <option value="flight">Flight</option>
                  <option value="food">Food</option>
                  <option value="utilities">Utilities</option>
                  <option value="clothing">Clothing</option>
                  <option value="medical">Healthcare</option>
                  <option value="insurance">Insurance</option>
                  <option value="personal">Personal</option>
                  <option value="investment">Investment</option>
                  <option value="education">Education</option>
                  <option value="savings">Savings</option>
                  <option value="gift">Gift</option>
                  <option value="miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div class="overlay__form-group">
                <label for="select-card" class="overlay__form-label">Select card</label>
                <select name="card" id="select-card" class="overlay__form-select overlay__form-select--type" required>
                  <option value="">Card to debit</option>
                  ${cards.map((el) => this._generateMarkupCard(el)).join("")}
                </select>
              </div>

              <div class="overlay__form-group overlay__form-group--deposit">
                <label for="card-deposit" class="overlay__form-label">Deposit amount</label>
                <input type="number" name="deposit" id="card-deposit" step="0.01" class="overlay__form-input overlay__form-input--deposit" placeholder="Enter amount" required>
              </div>

              <button class="overlay__btn-form overlay__btn-card--pay">Make payment</button>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  _generateMarkupCard(data) {
    return `
      <option value="${data.number.slice(-4)}">
        ${data.title} - ${data.number.slice(-4)}
      </option>
    `;
  }

  _renderError(Message) {
    const formElement = document.querySelector(".overlay__form");
    const markup = `
      <div class="form__error-box">
        <p class="form__error-text">
          ${Message}
        </p>
      </div>
    `;

    if (document.querySelector(".form__error-box"))
      document.querySelector(".form__error-box").remove();

    formElement?.insertAdjacentHTML("beforebegin", markup);

    setTimeout(() => {
      document.querySelector(".form__error-box").remove();
    }, 3000);
  }
}

export default new CardPaymentView();
