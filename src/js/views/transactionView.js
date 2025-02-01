import View from "./View";
import tableView from "./tableView.js";
import icons from "url:../../img/icons.svg";

class TransactionView extends View {
  _parentElement = document.querySelector(".main--transaction");
  _headCells = [
    "Recipient",
    "Transaction ID",
    "Amount",
    "Date",
    "Time",
    "Type",
    "Card",
    "Category",
    "Status",
  ];

  addHandlerRenderTab(handler) {
    this._parentElement?.addEventListener("click", (e) => {
      // Check for element
      const account = e.target.closest(".transactions__account");

      // Guard clause
      if (!account) return;

      // Get Card number
      const cardNum = account.querySelector("span")?.textContent;

      // Get accout name
      const accountName = account.firstElementChild.textContent.toLowerCase();

      // Select active tab container
      const container = e.target.closest(".transactions__account-container");

      // Select all child elements
      const children = container.children;

      // Remove active class
      Array.from(children, (item) => {
        item.classList.remove(`transactions__account--active`);
      });

      // Add active class
      account.classList.add(`transactions__account--active`);

      // Get order value
      const orderValue = document.querySelector(".transactions__order").value;

      if (accountName === "all") handler(null, "transactions", orderValue);
      if (accountName !== "all") handler(cardNum, "transactions", orderValue);
    });
  }

  addHandlerSearch(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      e.preventDefault();

      // Check for element
      const form = e.target.closest(".transactions__form");

      // Guard clause
      if (!form) return;

      // Get sort value
      const order = document.querySelector(".transactions__order").value;

      // Get search query
      const entry = document.querySelector(".transactions__entry-input").value;
      // Get input query

      const [[, query]] = [...new FormData(e.target)];

      // Clear input element
      e.srcElement[0].value = "";

      handler(query, order, entry);
    });
  }

  addHandlerChangeOrder(handler) {
    this._parentElement?.addEventListener("change", (e) => {
      // Check for element
      const order = e.target.closest(".transactions__order");

      // Guard clause
      if (!order) return;

      // Get value
      const value = e.target.value;

      // Get query
      const searchQuery = this._data.query;

      handler(value, "transactions", searchQuery);
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
      const type = "card";

      handler(id, type);
    });
  }

  addHandlerCount(handler) {
    this._parentElement?.addEventListener("change", (e) => {
      // Check for element
      const entryInput = e.target.closest(".transactions__entry-input");

      // Guard clause
      if (!entryInput) return;

      const orderValue = document.querySelector(".transactions__order").value;

      handler(e.target.value, orderValue);
    });
  }

  addHandlerClick(handler) {
    this._parentElement?.addEventListener("click", (e) => {
      // Check for element
      const btn = e.target.closest(".transactions__pagination-btn");

      // Guard clause
      if (!btn) return;

      // Get value
      const value = +btn.dataset.goto;

      // Get order value
      const orderValue = document.querySelector(".transactions__order").value;

      handler(value, orderValue);
    });
  }

  _generateMarkup() {
    this._generateMarkupAccount();
    // transactionAccountView._generateMarkup();
    return `
      <div class="transactions">
        ${this._generateMarkupAccount()}
        ${this._generateMarkupTable()}
      </div>
    `;
    // ${this._generateMarkupCardTable()}
  }

  _generateMarkupAccount() {
    const cards = this._data.user.account.card.recent;

    return `
      <div class="transactions__account-container">
        <button class="transactions__account transactions__account--active">
          <p class="transactions__account-total">All</p>
        </button>

        ${cards.map((el) => this._generateMarkupButton(el)).join("")}

      </div>
    `;
  }

  _generateMarkupButton(data) {
    return `
      <button class="transactions__account">
        <p class="transactions__account-name">${
          data.title[0].toUpperCase() + data.title.slice(1)
        }</p>
        <div class="transactions__account-details">
          <svg class="card__icon">
            <use href="${icons}#icon-${data.issuer}"></use>
          </svg>
          <span>${data.number.slice(-4)}</span>
        </div>
      </button>
    `;
  }

  _generateMarkupTable() {
    const recent = this._data.user.account.transactions.card.recent;
    const curPage = this._data.page;

    return `
      <div class="transactions__table-container">
        <header class="transactions__header">
          <h2 class="heading-subtitle">Transactions</h2>

          <div action="#" class="transactions__form-box">
            <form class="transactions__form">
              <input
                type="search"
                name="transaction-search"
                id="transaction-search"
                class="transactions__search"
                placeholder="Search Recipient or ID"
              />

              <button class="transactions__btn">Search</button>
            </form>

            <select
              name="transactions-sort"
              id="transactions-sort"
              class="transactions__order">
              <option value="old">Old</option>
              <option value="new">New</option>
              <option value="high">High price</option>
              <option value="low">Low price</option>
            </select>
          </div>
        </header>

        <div class="transactions__table-box">
          ${tableView._generateMarkup(this._headCells, recent)}
          ${
            recent.length < 1
              ? `<p class="empty-transaction">No transaction performed yet</p>`
              : ""
          }
        </div>

        <div class="transactions__footer">
          <div class="transactions__result-box">
            <p class="transactions__counter">
              <span>Show</span>
              <input
                type="number"
                name="counter-number"
                id="counter-number"
                class="transactions__entry-input"
                value="${this._data.results}"
              />
              <span>entries</span>
            </p>
            <p class="transactions__result">
              Shwoing
              <strong class="transactions__result--group">1 - 10</strong>
              of
              <strong class="transactions__result--total">${
                recent.length
              }</strong>
              transactions
              <strong class="transactions__result--total">
              in page ${curPage}.
              </strong>
            </p>
         </div>
          <div class="transactions__pagination">
            ${this._generateMarkupPagination(recent)}
          </div>
        </div>
      </div>

    `;
  }

  _generateMarkupPagination(recent) {
    const curPage = this._data.page;
    const numPages = Math.ceil(recent.length / this._data.results);

    // Page 1, and there are other pages
    if (curPage === 1 && numPages > 1) {
      return `
        <button
          class="transactions__pagination-btn transactions__pagination-btn--next" data-goto="${
            curPage + 1
          }">
          <span>Page ${curPage + 1}</span>

          <svg class="pagination__icon">
            <use href="${icons}#icon-arrow-right"></use>
          </svg>
        </button>
      `;
    }

    // Last page
    if (curPage === numPages && numPages > 1) {
      return `
        <button
          class="transactions__pagination-btn transactions__pagination-btn--prev" data-goto="${
            curPage - 1
          }">
          <svg class="pagination__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>

          <span>Page ${curPage - 1}</span>
        </button>
      `;
    }

    // Other page
    if (curPage < numPages) {
      return `
        <button
          class="transactions__pagination-btn transactions__pagination-btn--prev" data-goto="${
            curPage - 1
          }">
          <svg class="pagination__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>

          <span>Page ${curPage - 1}</span>
        </button>

        <button
          class="transactions__pagination-btn transactions__pagination-btn--next" data-goto="${
            curPage + 1
          }">
          <span>Page ${curPage + 1}</span>

          <svg class="pagination__icon">
            <use href="${icons}#icon-arrow-right"></use>
          </svg>
        </button>
      `;
    }

    // Page 1, and there are NO other pages
    return "";
  }
}

export default new TransactionView();
