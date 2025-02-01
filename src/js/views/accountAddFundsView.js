import { formatCurrency } from "../helpers.js";
import View from "./View.js";
import { formatCurrency } from "../helpers.js";

class AccountAddFundsView extends View {
  _parentElement = document.querySelector(".content");
  _processingMessage = "Confirming payment";
  _confirmationMessage = "Confrimed";

  addHandlerFundAccount(handler) {
    // Get the form element
    const form = document.querySelector(".overlay__form--funds");
    this._parentElement?.addEventListener("submit", (e) => {
      e.preventDefault();

      // Check for element
      const form = e.target.classList.contains("overlay__form--funds");

      // Guard clause
      if (!form) return;

      // Get deposit limit
      const depositLimit = +this._data.account.limit.deposit;

      // Get form data
      const dataArr = [...new FormData(e.target)];
      const dataObj = Object.fromEntries(dataArr);


      // Deposit amount greater deposit limit
      if (+dataObj.amount > depositLimit)
        return this._renderError(
          `Amount cannot exceed deposit limit of ${formatCurrency(
            depositLimit,
            "NGN"
          )}`
        );

      // Deposit amount lesser/equal 0
      if (+dataObj.amount <= 0)
        return this._renderError(`Amount must exceed 0`);

      // Deposit amount lesser/equal deposit limit
      if (+dataObj.amount <= depositLimit) {
        handler(dataObj, this);
      }
    });
  }

  render(data) {
    this._data = data;
    const overlay = this._parentElement.querySelector(".overlay");
    const markup = this._generateMarkup();

    if (overlay) overlay.remove();

    this._parentElement.insertAdjacentHTML("beforeend", markup);
  }

  _generateMarkup() {
    return `
      <div class="overlay">
        <div class="overlay__fund overlay__form--add-funds">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">Sender's Info</h2>
            </header>

            <form class="overlay__form overlay__form--funds">
              <div class="overlay__form-group overlay__form-group--name">
                <label for="name" class="overlay__form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  class="overlay__form-input overlay__form-input--name"
                  placeholder="Enter name"
                  required
                />
              </div>
              <div class="overlay__form-group overlay__form-group--amount">
                <label for="amount" class="overlay__form-label">Amount</label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  step="0.01"
                  class="overlay__form-input overlay__form-input--funding-amount"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <button class="overlay__btn-send">Confirm payment</button>
            </form>
          </div>
        </div>
      </div>
   `;
  }

  _renderError(message) {
    const formElement = document.querySelector(".overlay__form");

    const markup = `
    <div class="form__error-box">
      <p class="form__error-text">
        ${message}
      </p>
    </div>
    `;

    if (document.querySelector(".form__error-box"))
      document.querySelector(".form__error-box").remove();

    formElement?.insertAdjacentHTML("beforebegin", markup);

    setTimeout(() => document.querySelector(".form__error-box").remove(), 3000);
  }
}

export default new AccountAddFundsView();
