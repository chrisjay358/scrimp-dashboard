import icons from "url:../../img/icons.svg";

class TransactionFooterView {
  _parentElement;

  render(data, transactions) {
    this._data = data;
    this._transactions = transactions;
    this._page;
    this._parentElement = document.querySelector(".transactions__footer");

    const markup = this._generateMarkup();

    this._parentElement.innerHTML = "";

    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  _resultMessage(data) {
    const recent = this._data.searchResult
      ? this._data.searchResult
      : this._data.filteredResult
      ? this._data.filteredResult
      : data;
    const transactions = this._transactions;

    if (transactions.length > 1) {
      const resultStart = recent.findIndex(
        (el) => el.id === this._transactions[0].id
      );

      const resultEnd = recent.findIndex(
        (el) => el.id === this._transactions.at(-1).id
      );

      return `${resultStart + 1} - ${resultEnd + 1}`;
    }

    if (transactions.length <= 1) {
      const result = recent.findIndex(
        (el) => el.id === this._transactions[0].id
      );

      return `${result + 1}`;
    }
  }

  _generateMarkup() {
    const recent = this._data.user.account.transactions.card.recent;
    const curPage = this._data.page;

    return `
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
          <strong class="transactions__result--group">${this._resultMessage(
            recent
          )}</strong>
          of
          <strong class="transactions__result--total">${
            this._data.searchResult
              ? this._data.searchResult.length
              : this._data.filteredResult
              ? this._data.filteredResult.length
              : recent.length
          }</strong>
          ${this._data.searchResult ? "results" : "transactions"}
          <strong class="transactions__result--total">
            in page ${curPage}.
          </strong>
        </p>
      </div>
      <div class="transactions__pagination">
        ${this._generateMarkupPagination(recent)}
      </div>
    `;
  }

  _generateMarkupPagination(data) {
    const recent = this._data.searchResult
      ? this._data.searchResult
      : this._data.filteredResult
      ? this._data.filteredResult
      : data;
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
          <span>Page ${curPage + 1} </span>

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

export default new TransactionFooterView();
