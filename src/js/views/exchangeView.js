import { formatCurrency } from "../helpers";

class ExchangeView {
  _parentElement = document.querySelector(".content");

  addHandlerCurrencyChange(handler) {
    this._parentElement?.addEventListener("change", (e) => {
      const currency = e.target.classList.contains("exchange__currency");
      const form = e.target.parentElement.parentElement;

      // Guard clause
      if (!currency) return;

      // Get form data
      const formData = Object.fromEntries([...new FormData(form)]);
      const { currentCurrency, newCurrency } = formData;

      // Reassign the currency values
      this._curCurrency = currentCurrency;
      this._newCurrency = newCurrency;

      handler(currentCurrency, newCurrency);
    });
  }

  addHandlerCurrencySwap(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      const button = e.submitter.classList.contains("btn--swap");
      const form = e.target.classList.contains("exchange__form");
      e.preventDefault();

      // Guard clause
      if (!button) return;

      // Get form data
      const formData = Object.fromEntries([...new FormData(e.target)]);
      const { currentCurrency, newCurrency } = formData;

      // Reassign the currency values
      this._curCurrency = newCurrency;
      this._newCurrency = currentCurrency;

      handler(newCurrency, currentCurrency);
    });
  }

  addHandlerCurrencyConverter(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      const button = e.submitter.classList.contains("btn--exchange");
      const form = e.target.classList.contains("exchange__form");
      e.preventDefault();

      // Guard clause
      if (!button) return;

      // Get form data
      const dataArr = [...new FormData(e.target)];
      const dataObj = Object.fromEntries(dataArr);

      // Get values from the form
      const { currentAmount, currentCurrency, newAmount, newCurrency } =
        dataObj;

      // Empty field
      if (!currentAmount) return this._renderError("Input an amount");

      handler(currentAmount, currentCurrency, newCurrency);
    });
  }

  getData(currency, rate) {
    this._currencies = currency;
    this._rate = rate;
    this._curCurrency = "USD";
    this._newCurrency = "NGN";
  }

  update(newAmount, rate) {
    if (newAmount) {
      const exchange = document.querySelector(
        ".exchange__currency-amount--new"
      );
      exchange.value = newAmount.toFixed(2);
    }

    if (rate) {
      const exchange = document.querySelector(".exchange");

      this._rate = rate;

      const markup = this._generateMarkup();

      exchange.innerHTML = "";
      exchange.insertAdjacentHTML("beforeend", markup);
    }
  }

  _generateMarkup() {
    return `
      <header class="exchange__header">
        <h2 class="header__subtitle">Exchange</h2>
        <select
          name="exchange-type"
          id="exchange-type"
          class="exchange__type"
        >
          <option value="currency">Currency</option>
        </select>
      </header>

      <form class="exchange__form">
        <div>
          <div class="exchange__form-group">
              <select name="currentCurrency" id="current-currency" class="exchange__currency exchange__currency--current">
              ${this._currencies
                .map((el) =>
                  this._generateMarkupCurrencies(el, this._curCurrency)
                )
                .join("")}
              </select>

              <input
                type="number"
                name="currentAmount"
                step="0.01"
                id="current-amount"
                class="exchange__currency-amount exchange__currency-amount--current"
              />
            </div>

            <div class="exchange__form-group">
              <select name="newCurrency" id="new-currency" class="exchange__currency exchange__currency--new">
                ${this._currencies
                  .map((el) =>
                    this._generateMarkupCurrencies(el, this._newCurrency)
                  )
                  .join("")}
              </select>

              <input
                type="number"
                name="newAmount"
                id="new-amount"
                class="exchange__currency-amount exchange__currency-amount--new"
                value="${this._converted ? this._converted : ""}"
                disabled
              />
            </div>
          </div>

          <div class="exchange__info">
            <span class="exchange__rate">1 ${
              this._curCurrency
            } = ${formatCurrency(this._rate, "NGN")}</span>
            <button class="btn btn--swap">Swap</button>
          </div>
          <button class="btn btn--exchange"> Convert</button>
      </form>
    `;
  }

  _generateMarkupCurrencies(data, text) {
    return `
      <option value="${data.short_code}" title='${data.name}' ${
      data.short_code === text ? "selected" : ""
    }>${data.short_code}</option>
    `;
  }

  _renderError(message) {
    const formElement = document.querySelector(".exchange__form");
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
}

export default new ExchangeView();
