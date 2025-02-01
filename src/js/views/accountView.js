import View from "./View.js";
import tableView from "./tableView.js";
import { formatCurrency } from "../helpers.js";

class AccountView extends View {
  _parentElement = document.querySelector(".main--account");
  _headCells = [
    "Name",
    "Transaction ID",
    "Amount",
    "Date",
    "Type",
    "Category",
    "Status",
  ];

  addHandlerRenderAddFunds(handler) {
    this._parentElement.addEventListener("click", (e) => {
      // Get element
      const btn = e.target.classList.contains("btn--fund");

      // Guard clause
      if (!btn) return;

      handler();
    });
  }

  addHandlerRenderTopup(handler) {
    this._parentElement?.addEventListener("click", (e) => {
      e.preventDefault();
      // Check for btn
      const btn = e.target.classList.contains("btn--top");

      // Guard clause
      if (!btn) return;

      handler();
    });
  }

  addHandlerRenderReceipt(handler) {
    this._parentElement?.addEventListener("click", (e) => {
      // Check for element
      const transaction = e.target.closest(".table__row");

      // Guard clause
      if (!transaction) return;

      // Get id
      const id = transaction.children[1].textContent;

      // Set type
      const type = "bank";

      handler(id, type);
    });
  }

  _generateMarkup() {
    return `
    <div class="account">
      <div class="account__details">
        ${this._generateMarkupAccountBalance()}
        ${this._generateMarkupAccountInfo()}
      </div>
      ${this._generateMarkupAccountTable()}
    </div>
    `;
  }

  _generateMarkupAccountBalance() {
    const recent = this._data.account.transactions.bank.recent;

    return `
      <div class="account__balance-box">
        <header class="account__header margin-bottom-sm">
          <h2 class="header-subtitle">Account Balance</h2>
        </header>
        <p class="account__balance">${
          recent.length > 0
            ? formatCurrency(
                recent.reduce((acc, num) => acc + +num.amount, 0),
                "NGN"
              )
            : "0.00"
        }</p>
        <p class="account__balance-label">Wallet balance</p>
        <div class="account__btn-group">
          <button class="account__btn btn--fund">Add Funds</button>
          <button class="account__btn btn--top">Top up card</button>
        </div>
      </div>
    `;
  }

  _generateMarkupAccountInfo() {
    return `
      <div class="account__info">
        <header class="account__header margin-bottom-sm">
          <h2 class="header-subtitle">Account Info</h2>
        </header>
        <div class="account__group">
          <p class="account__title account__title--holder">
            ${this._data.firstname} ${this._data.lastname}
          </p>
          <span class="account__label">Account Holder</span>
        </div>
        <div class="account__group">
          <p class="account__title account__title--bank">Gbemide Plc</p>
          <span class="account__label">Bank Name</span>
        </div>
        <div class="account__group">
          <p class="account__title account__title--number">
            ${this._data.account.number}
          </p>
          <span class="account__label">Account Number</span>
        </div>
      </div>
    `;
  }

  _generateMarkupAccountTable() {
    const recent = this._data.account.transactions.bank.recent;

    return `
      <div class="account__table-container">
        <header class="account__table-header">
          <h2 class="heading-subtitle">Recent Transactions</h2>
        </header>
        <div class="account__table-box">
          ${tableView._generateMarkup(this._headCells, recent)}
          ${
            recent.length < 1
              ? `<p class="empty-transaction">No transaction performed yet</p>`
              : ""
          }
        </div>
      </div>
   `;
  }
}

export default new AccountView();
