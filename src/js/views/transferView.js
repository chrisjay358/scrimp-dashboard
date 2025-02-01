import View from "./View";
import { formatCurrency, getMonth, getYear } from "../helpers";

class TransferView extends View {
  _parentElement = document.querySelector(".main--transfer");

  constructor() {
    super();
    this._addHandlerCheckRecipient();
    this._addHandlerHideWindow();
    this._addHandlerRemoveSummary();
  }

  _addHandlerHideWindow() {
    this._parentElement
      ?.closest(".content")
      .addEventListener("click", function (e) {
        // Check for element
        const overlay = e.target.classList.contains("overlay");
        const overlayBtn = e.target.classList.contains("overlay__btn-close");

        // Guard clause
        if (!overlay && !overlayBtn) return;

        // Remove overlay
        e.target.closest(".overlay").remove();
      });
  }

  _addHandlerRemoveSummary() {
    this._parentElement?.addEventListener("click", (e) => {
      // Check for element
      const btn = e.target.classList.contains("details__btn-close");

      // Guard clause
      if (!btn) return;

      // Remove element
      e.target.parentElement.parentElement.remove();
    });
  }

  addHandlerRenderRecipient(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      e.preventDefault();
      // Check for element
      const form = e.target.classList.contains("transfer__form");

      // Guard clause
      if (!form) return;

      // Get user data
      const { data } = this._data;

      // Get form data
      const dataArr = [...new FormData(e.target)];
      const formData = Object.fromEntries(dataArr);

      // Get balance for selected card
      const balance = this._checkCardBalance(formData.card);

      // Get remaining spending balance
      const remainingMonthlyExpenseBalance =
        this._getCardMonthlyLimit(formData.card) -
        this._getCardTotalExpenses(formData.card);

      // Set values
      const cardMonthlyLimit = this._getCardMonthlyLimit(formData.card);
      const cardTotalExpenses = this._getCardTotalExpenses(formData.card);

      // Get username
      const username = data.username.toLowerCase();
      // Empty fields
      if (
        !formData.card &&
        !formData.amount &&
        !formData.username &&
        !formData.description
      )
        return this._renderError("Fields cannot be empty");

      // No card selected
      if (!formData.card) return this._renderError("Select a card to debit!");

      // No description
      if (!formData.description)
        return this._renderError("Desecription cannot be empty!");

      // Monthly spending limit has reach for card
      if (cardTotalExpenses >= cardMonthlyLimit)
        return this._renderError("Monthly spending limit reached");

      // Cannot send funds to self
      if (formData.username.toLowerCase() === username)
        return this._renderError("Cannot transfer to self!");

      // Only amount is greater than balance
      if (
        +formData.transferAmount > balance &&
        this._checkUsername(formData.username)
      )
        return this._renderError("Low balnace... Try again!");

      // Transfer amount lesser/equal 0
      if (+formData.transferAmount <= 0)
        return this._renderError(`Amount must exceed 0`);

      // Total card expenses + transfer amount is not greater than monthly limit
      if (cardTotalExpenses + +formData.transferAmount > cardMonthlyLimit)
        return this._renderError(
          `Amount exceeds limit. Remaining monthly limit for ${getMonth()} is ${formatCurrency(
            remainingMonthlyExpenseBalance,
            "NGN"
          )}`
        );

      // Only username doesn't exist
      if (
        !this._checkUsername(formData.username) &&
        +formData.transferAmount < balance
      )
        return this._renderError("User does not exist!");

      // Username doesn't exist and amount is greater than balance
      if (
        !this._checkUsername(formData.username) &&
        +formData.transferAmount > balance
      )
        // return this._renderError("Check the username and amount");
        return this._renderError("User does not exist & low balance!");

      handler(formData);
    });
  }

  _addHandlerCheckRecipient() {
    this._parentElement?.addEventListener("change", (e) => {
      e.preventDefault();
      // Check for element
      const recipient = e.target.classList.contains(
        "transfer__input--username"
      );

      // Guard clause
      if (!recipient) return;

      // Get target's value
      const value = e.target.value;

      // Check if recipient exist
      if (!this._checkUsername(e.target.value))
        return this._renderError("The user nor dey seh");
    });
  }

  _checkUsername(data) {
    const { users } = this._data;
    return users.some((e) => e.toLowerCase() === data.toLowerCase());
  }

  _checkCardBalance(cardNum) {
    const { data } = this._data;
    const recent = data.account.transactions.card.recent;
    const transactions = recent.filter((el) => el.card === cardNum);
    const total = transactions.reduce((acc, el) => acc + +el.amount, 0);
    return total;
  }

  _getCardMonthlyLimit(cardNum) {
    const { data } = this._data;
    // Get limit
    return data.account.card.recent.find((card) =>
      card.number.endsWith(cardNum)
    )?.limit.monthly;
  }

  _getCardTotalExpenses(cardNum) {
    const { data } = this._data;
    // Get total deposit
    return data.account.transactions.card.recent
      .filter(
        (el) =>
          el.amount < 1 &&
          el.type === "Debit" &&
          el.month === getMonth() &&
          el.year === getYear() &&
          el.card.endsWith(cardNum)
      )
      .map((el) => Math.abs(el.amount))
      .reduce((acc, deposit) => acc + deposit, 0);
  }

  _generateMarkup() {
    const { transactionData } = this._data;

    if (transactionData)
      return `
        ${this._generateMarkupTransfer()}
        ${this._generateMarkupTransferTransaction()}
      `;

    if (!transactionData)
      return `
        ${this._generateMarkupTransfer()}
    `;
  }

  _generateMarkupTransfer() {
    const { data, transferData } = this._data;
    const cards = data.account.card.recent;

    return `
      <div class="transfer">
        <header class="transfer__header">
          <h2 class="header__subtitle">Send Funds</h2>
        </header>

        <form action="" class="transfer__form">
          <div class="transfer__form-group">
            <label for="card" class="transfer__label">Please Select a Card</label>
            <select name="card" id="select-card" class="transfer__card">
              <option value="">Card to debit</option>
              ${cards.map((el) => this._generateMarkupCard(el)).join("")}
            </select>
          </div>

          <div class="transfer__form-group">
            <label for="username" class="transfer__label">
              Recipient's Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              class="transfer__input transfer__input--username"
              placeholder="Enter username"
              ${
                transferData?.recipient ? `value=${transferData.recipient}` : ""
              } 
            />
          </div>

          <div class="transfer__form-group">
            <label for="amount" class="transfer__label">
              Enter Ammount
            </label>
            <input
              type="number"
              name="transferAmount"
              id="amount"
              step="0.01"
              class="transfer__input transfer__input--amount"
              placeholder="0.00"
              ${transferData?.amount ? `value=${transferData.amount}` : ""} 
            />
          </div>

          <div class="transfer__form-group">
            <label for="transfer-description" class="transfer__label">
              Transaction Desctiption
            </label>
            <textarea name="description" id="transfer-description" class="transfer__description" minlength="3" maxlength="20"
            placeholder="Please express reason for funds"></textarea>
          </div>
          
          <button class="transfer__btn">Send</button>
          </form>
        </div>
    `;
  }

  _generateMarkupCard(data) {
    return `
      <option value="${data.number.slice(-4)}">${
      data?.title[0].toUpperCase() + data.title.slice(1)
    } - ${data.number.slice(-4)}</option>
    `;
  }

  _generateMarkupTransferTransaction() {
    const { data, transactionData } = this._data;
    const sender = `${data.firstname} ${data.lastname}`;
    const receiver = transactionData.recipient.split(" ").slice(-2).join(" ");

    return `
      <div class="details">
        <header class="details__header">
          <h2 class="details__heading">Transfer Summary</h2>
          <button class="details__btn-close">x</button>
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

          <li class="details__item">
            <h3 class="details__title">Sender's Name</h3>
            <p class="details__text">${sender}</p>
          </li>

          <li class="details__item">
            <h3 class="details__title">Transaction Fee</h3>
            <p class="details__text">Free</p>
          </li>

          <li class="details__item">
            <h3 class="details__title">Recipient's Name</h3>
            <p class="details__text">${receiver}</p>
          </li>

          <li class="details__item">
            <h3 class="details__title">Transfer Amount</h3>
            <p class="details__text">${formatCurrency(
              Math.abs(transactionData.amount),
              "NGN"
            )}</p>
          </li>

          <li class="details__item">
            <h3 class="details__title">Status</h3>
            <p class="details__text">${transactionData.status}</p>
          </li>

          <li class="details__item">
            <h3 class="details__title">Transfer ID</h3>
            <p class="details__text">${transactionData.id}</p>
          </li>

          <li class="details__item">
            <h3 class="details__title">Description</h3>
            <p class="details__text">${transactionData.description}</p>
          </li>
        </ul>
      </div>
    `;
  }

  _renderError(message) {
    const ewe = "Deposit amount cannot be larger than target amount";
    const formElement = document.querySelector(".transfer__form");
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

export default new TransferView();
