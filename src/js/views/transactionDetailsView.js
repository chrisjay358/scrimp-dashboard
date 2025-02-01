import { formatCurrency } from "../helpers";

class TransactionDetailsView {
  _parentElement = document.querySelector(".content");

  constructor() {
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

  render(data) {
    this._data = data;

    // Get element
    const overlay = document.querySelector(".overlay");

    const markup = this._generateMarkup();

    // Remove element
    if (overlay) overlay.remove();

    this._parentElement.insertAdjacentHTML("beforeend", markup);

    // Get element
    const transactionEl = document.querySelector(".overlay__transaction");

    // Remove the class
    setTimeout(() => transactionEl.classList.remove("no-show"), 10);
  }

  _generateMarkup() {
    const { data, transactionData } = this._data;

    const sender = `${data.firstname} ${data.lastname}`;
    const receiver =
      transactionData.description &&
      transactionData.recipient.split(" ").slice(-2).join(" ");

    const name = transactionData;

    return `
      <div class="overlay overlay--receipt">
        <div class="overlay__transaction overlay__transaction--details no-show">
          <button class="overlay__btn-close">x</button>

          <div class="overlay__content overlay__content--transaction">
            <header class="overlay__header">
              <h2 class="overlay__heading">Transaction Details</h2>
              <span class="overlay__subheading">${
                transactionData.category
              }</span>
            </header>

            <ul class="details__list">
              <li class="details__item">
                <h3 class="details__title">Date</h3>
                <p class="details__text">${transactionData.date}</p>
              </li>
              <li class="details__item">
                <h3 class="details__title">Time</h3>
                <p class="details__text">${transactionData.time}</p>
              </li>

              ${
                transactionData.description
                  ? `<li class="details__item">
                    <h3 class="details__title">Sender</h3>
                    <p class="details__text">${sender}</p>
                  </li>`
                  : ""
              }

              <li class="details__item">
                <h3 class="details__title">Transaction Fee</h3>
                <p class="details__text">Free</p>
              </li>

              <li class="details__item">
                <h3 class="details__title">Recipient</h3>
                <p class="details__text">${
                  transactionData.description
                    ? `${receiver}`
                    : transactionData.recipient
                    ? transactionData.recipient
                    : transactionData.name
                }</p>
              </li>

              <li class="details__item">
                <h3 class="details__title">Amount</h3>
                <p class="details__text">${formatCurrency(
                  transactionData.amount,
                  "NGN"
                )}</p>
              </li>

              ${
                transactionData.card
                  ? `
                  <li class="details__item">
                    <h3 class="details__title">Card</h3>
                    <p class="details__text">**** **** **** ${transactionData.card}</p>
                  </li>
                `
                  : ""
              }
              

              <li class="details__item">
              <h3 class="details__title">ID</h3>
              <p class="details__text">${transactionData.id}</p>
            </li>

              <li class="details__item">
              <h3 class="details__title">Type</h3>
              <p class="details__text">${transactionData.type}</p>
            </li>

              <li class="details__item">
                <h3 class="details__title">Status</h3>
                <p class="details__text">${transactionData.status}</p>
              </li>

              ${
                transactionData.description
                  ? `<li class="details__item">
              <h3 class="details__title">Description</h3>
              <p class="details__text">${transactionData.description}</p>
            </li>`
                  : ""
              }
              
            </ul>
          </div>
        </div>
      </div>
    `;

    if (this._parentElement.querySelector(".overlay"))
      this._parentElement.querySelector(".overlay").remove();

    this._parentElement.insertAdjacentHTML("beforeend", markup);
  }
}

export default new TransactionDetailsView();
