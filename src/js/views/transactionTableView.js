import { formatCurrency } from "../helpers";
import tableView from "./tableView.js";

class TransactionTableView {
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

  update(data) {
    this._data = data;
    this._parentElement = document.querySelector(
      ".transactions__table-container"
    );
    // Get table body element
    const tableBody = this._parentElement.querySelector(".table__body");

    // Get table box element
    const tableBox = this._parentElement.querySelector(
      ".transactions__table-box"
    );

    // Get empty transactiom element
    const emptyTransactionEl =
      this._parentElement.querySelector(".empty-transaction");

    let markup, searchResult;

    searchResult = this._data;

    markup =
      searchResult.length > 0
        ? `${searchResult.map((el) => this._generateMarkup(el)).join("")}`
        : `${this._generateMarkupEmpty(searchResult)}`;

    if (searchResult.length > 0) {
      tableBody.innerHTML = "";
      // Remove the element, weird table behaviour
      if (emptyTransactionEl) emptyTransactionEl.remove();
      tableBody.insertAdjacentHTML("beforeend", markup);
    }

    if (searchResult.length < 1) {
      tableBox.innerHTML = "";
      tableBox.insertAdjacentHTML("beforeend", markup);
    }
  }

  render(data, order) {
    this._data = data;
    this._parentElement = document.querySelector(
      ".transactions__table-container"
    );

    // Get table body element
    const tableBody = this._parentElement.querySelector(".table__body");

    let markup, transactions;

    transactions = this._data;
    markup = `${transactions.map((el) => this._generateMarkup(el)).join("")}`;

    tableBody.innerHTML = "";
    tableBody.insertAdjacentHTML("beforeend", markup);
  }

  _generateMarkupEmpty(transactions) {
    return `
      ${tableView._generateMarkup(this._headCells, transactions)}
      ${
        transactions.length < 1
          ? `<p class="empty-transaction">No result found</p>`
          : ""
      };
    `;
  }

  _generateMarkup(data) {
    if (data.name)
      return `
        <tr class="table__row">
          <td class="table__data">${data.name}</td>
          <td class="table__data">${data.id}</td>
          <td class="table__data">${formatCurrency(data.amount, "NGN").toString(
            2
          )}</td>
          <td class="table__data">${data.date}</td>
          <td class="table__data">${data.type}</td>
          <td class="table__data">${data.category}</td>
          <td class="table__data">
            <span class="table__data-status table__data-status--${data.status.toLowerCase()}">
              ${data.status}
            </span>
          </td>
        </tr>
    `;

    if (data.recipient)
      return `
        <tr class="table__row">
          <td class="table__data">${data.recipient}</td>
          <td class="table__data">${data.id}</td>
          <td class="table__data">${formatCurrency(data.amount, "NGN").toString(
            2
          )}</td>
          <td class="table__data">${data.date}</td>
          <td class="table__data">${data.time}</td>
          <td class="table__data">${data.type}</td>
          <td class="table__data">${data.card}</td>
          <td class="table__data">${data.category}</td>
          <td class="table__data">
            <span class="table__data-status table__data-status--${data.status.toLowerCase()}">
              ${data.status}
            </span>
          </td>
        </tr>
    `;
  }
}

export default new TransactionTableView();
