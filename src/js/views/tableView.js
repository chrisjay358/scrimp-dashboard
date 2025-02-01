import { formatCurrency } from "../helpers.js";

class TableView {
  _generateMarkup(cell, data, view) {
    return `
      <table class="table">
        <thead class="table__header">
          <tr class="table__row">
            ${cell.map(this._generateMarkupHeadCell).join("")}
          </tr>
        </thead>
        <tbody class="table__body">
          ${data.map((el) => this._generateMarkupTableData(el, view)).join("")}
        </tbody>
     </table>
    `;
  }

  _generateMarkupHeadCell(data) {
    return `
    <th class="table__heading">${data}</th>
    `;
  }

  _generateMarkupTableData(data, view) {
    if (data.name && !view)
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

    if (data.recipient && !view)
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

    if (view) {
      return `
        <tr class="table__row">
          <td class="table__data">${data.recipient}</td>
          <td class="table__data">${data.id}</td>
          <td class="table__data">${data.date}</td>
          <td class="table__data">${formatCurrency(data.amount, "NGN").toString(
            2
          )}</td>
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
}

export default new TableView();
