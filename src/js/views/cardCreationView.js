import View from "./View.js";
import { formatCurrency } from "../helpers.js";

class CardCreationView extends View {
  _parentElement = document.querySelector(".content");
  _processingMessage = "Creating card";
  _confirmationMessage = "Created";
  _obj = {};

  addHandlerCardCreation(handler) {
    let data = [];

    this._parentElement?.closest(".content").addEventListener("submit", (e) => {
      e.preventDefault();

      // Check for form
      const form = e.target.classList.contains("overlay__form--card-creation");

      // Guard clause
      if (!form) return;

      // Get goToPage value from btn
      const goToPage = e.submitter.dataset.form;

      // Get form data
      const dataArr = [...new FormData(e.target)];

      // Push data to array
      data.push(dataArr);

      // Get flattened array
      const flatDataArr = dataArr.flat();

      // Assign the values from the dataArr to an obj
      flatDataArr?.forEach((element, index, array) => {
        if (index % 2 === 0) {
          this._obj[element] = array[index + 1];
        }
      });

      // Check if title already exist
      if (this._obj.cardTitle && this._checkTitle(this._obj.cardTitle))
        return this._renderError("Title already exist, try another!");

      if (goToPage === "cd") {
        // Bank transactions
        const recent = this._data.account.transactions.bank.recent;

        // Available balance
        const availableBalance =
          recent.length > 0
            ? recent.reduce((acc, num) => acc + +num.amount, 0)
            : 0;

        // Get funding value
        const fundingAmount = document.querySelector(
          ".overlay__form-input--amount"
        );

        // Check if funding amount is greater than account balance
        if (+fundingAmount.value > availableBalance)
          return this._renderError("Low balance. Top up account!");

        // Check if deposit amount lesser/equal 0
        if (+fundingAmount.value <= 0)
          return this._renderError(`Amount must exceed 0`);

        handler(goToPage, this._obj, this);
      }

      handler(goToPage);
    });
  }

  addHandlerBackClick(handler) {
    this._parentElement?.closest(".content").addEventListener("click", (e) => {
      if (e.target.classList.contains("overlay__btn-form--back")) {
        const cardType = document.querySelector(".overlay__form-select--type");
        const cardTitle = document.querySelector(".overlay__form-input--title");

        const btn = e.target.dataset.form;
        if (cardType) {
          cardType.value;
        }

        if (cardTitle && this._obj.cardTitle) {
          cardTitle.setAttribute("value", this._obj.cardTitle);
          cardTitle.value = 1;
        }
        handler(btn);
      }
    });
  }

  _checkTitle(title) {
    return this._data.account.card.recent
      .map((el) => el.title?.toLowerCase())
      .includes(title.toLowerCase());
  }

  render(data, value) {
    this._data = data;

    const overlay = document.querySelector(".overlay");
    let markup;

    if (!value || value === "ct") markup = this._generateMarkup();
    if (value === "cc") markup = this._generateMarkupCardCustomize();
    if (value === "cf") markup = this._generateMarkupCardFund();

    if (overlay) overlay.remove();

    this._parentElement.insertAdjacentHTML("beforeend", markup);
  }

  _generateMarkup() {
    return `
      ${this._generateMarkupCardType()}
    `;
  }

  _generateMarkupCardType() {
    return `
      <div class="overlay">
        <div class="overlay__card overlay__card--creation">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">Create A New Card</h2>
            </header>
            <form class="overlay__form overlay__form--card-creation">
              <div class="overlay__form-group margin-bottom-md">
                <label for="card-type" class="overlay__form-label">Choose card type</label>
                <select name="cardType" id="card-type" class="overlay__form-select overlay__form-select--type" required>
                  <option value="">Please select a type</option>
                  <option value="Virtual">Virtual</option>
                </select>
              </div>
              <div class="overlay__btn-group">
                <button class="overlay__btn-form overlay__btn-form--next" data-form="cc">Continue</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  _generateMarkupCardCustomize() {
    return `
      <div class="overlay">
        <div class="overlay__card overlay__card--creation">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">Create A New Card</h2>
            </header>

            <div class="card card--overlay margin-bottom-sm">
              <div class="card__header">
                <p class="card__name">Card title</p>
                <span class="card__issuer"></span>
              </div>
              <div class="card__footer">
                <div class="card__holder-name">Full name</div>
              </div>
            </div>
        
            <form class="overlay__form overlay__form--card-creation">
              <div class="overlay__form-group margin-bottom-sm">
                <label for="card-title" class="overlay__form-label">Card title</label>
                <input type="text" name="cardTitle" id="card-title" class="overlay__form-input overlay__form-input--title" placeholder="Enter card title" required>
              </div>

              <div class="overlay__form-group margin-bottom-sm">
                <label for="card-issuer" class="overlay__form-label">Select card issuer</label>
                <select name="cardIssuer" id="card-issuer" class="overlay__form-select overlay__form-select--issuer" required>
                  <option value="">Please select issuer</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="visa">Visa</option>
                </select>
              </div>

              <div class="overlay__form-group margin-bottom-md">
                <label for="card-name" class="overlay__form-label">Name on card</label>
                <input type="text" name="cardName" id="card-name" class="overlay__form-input overlay__form-input--name" placeholder="Enter name on card" required>
              </div>

              <div class="overlay__btn-group">
                <a class="overlay__btn-form overlay__btn-form--back" data-form="ct">back</a>
                <button class="overlay__btn-form overlay__btn-form--next" data-form="cf">Create Card</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  _generateMarkupCardFund() {
    const recent = this._data.account.transactions.bank.recent;

    return `
      <div class="overlay">
        <div class="overlay__card overlay__card--creation">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">Create A New Card</h2>
            </header>

            <form class="overlay__form overlay__form--card-creation">
              <div class="overlay__form-group margin-bottom-sm">
                <label for="funding-account" class="overlay__form-label">Select Funding Account</label>
                <select name="fundingAccount" id="funding-account" class="overlay__form-select" required>
                  <option value="">Please select account</option>
                  <option value="account-ng">NGN - ${
                    recent.length > 0
                      ? formatCurrency(
                          recent.reduce((acc, num) => acc + +num.amount, 0),
                          "NGN"
                        )
                      : "0.00"
                  }</option>
                </select>
              </div>
              <div class="overlay__form-group margin-bottom-md">
                <label for="funding-amount" class="overlay__form-label">Enter amount</label>
                <input type="number" name="fundingAmount" id="funding-amount" step="0.01" class="overlay__form-input overlay__form-input--amount" required>
              </div>

              <div class="overlay__btn-group">
                <a class="overlay__btn-form overlay__btn-form--back" data-form="cc">back</a>
                <button class="overlay__btn-form overlay__btn-form--next"data-form="cd" >Create Card</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  _renderError(message) {
    const formElement = document.querySelector(".overlay__form--card-creation");

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

    setTimeout(() => {
      document.querySelector(".form__error-box").remove();
    }, 3000);
  }

  _testrun() {
    return `
      <div class="overlay__form-group overlay__form-group--color margin-bottom-sm">
        <label for="card-color" class="overlay__form-label">Select card color</label>
        <input type="color" name="card-color" id="card-color" required>
      </div>
    `;
  }
}

export default new CardCreationView();
