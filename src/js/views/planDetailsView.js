import View from "./View";
import icons from "url:../../img/icons.svg";
import planIcons from "url:../../img/icon-plan.svg";
import { formatCurrency, formatDate } from "../helpers.js";

class PlanDetailsView extends View {
  _parentElement = document.querySelector(".content");

  addHandlerRenderEdit(handler) {
    this._parentElement?.addEventListener("click", (e) => {
      // Check for element
      if (
        e.target.classList.contains("menu__item") ||
        e.target.classList.contains("btn-plan--withdrawal")
      ) {
        // return;
        const { id } = this._data;
        const goToPage = e.target.dataset.item;

        handler(goToPage, id);
      }
    });
  }

  _getNextDepositDate(data) {
    const date = new Date(data.startDate).setMonth(
      new Date(data.startDate).getMonth() + 1
    );

    return new Intl.DateTimeFormat(navigator.language, {
      dateStyle: "long",
    }).format(new Date(date));
  }

  _generateMarkup() {
    this._parentElement = document.querySelector(".plan__details-container");
    const { data, id } = this._data;

    // Get plan that matches id
    const plan = data.account.plan.recent.find((el) => el.id.endsWith(id));

    return `
      ${this._generateMarkupDetails(plan)}
      ${this._generateMarkupHistory(plan)}
    `;
  }

  _generateMarkupDetails(data) {
    const recent = this._data.data.account.transactions.plan.recent.filter(
      (el) => el.num === data.id && !el.planWithdrawal
    );
    const totalDeposit = recent.reduce((acc, num) => acc + +num.amount, 0);

    const percentage = (totalDeposit * 100) / data.target;

    return `
      <header class="plan__details-header margin-bottom-sm">
        <h2 class="header-subtitle">Detail Plan</h2>
        ${
          !data.withdrawn
            ? `
            <button class="btn-menu btn-plan btn-plan--${
              data.completed ? "withdrawal" : "edit"
            }" ${data.completed ? `data-item=wd` : ""}>
            ${
              !data.completed
                ? `
                <span>Edit</span>
                <ul class="menu__list">
                  ${this._generateMarkupMenuItem(data)}
                </ul>
              `
                : "Withdrawal"
            }
            </button>
            `
            : ""
        }
      </header>

      <figure class="plan__overview margin-bottom-md">
        <div class="plan__icon-box margin-bottom-sm">
          <svg class="plan__icon plan__icon--big">
            <use href="${planIcons}#icon-${data.category}"></use>
          </svg>
        </div>
        <figcaption class="plan__overview-content">
          <div class="plan__group">
            <p class="plan__name">${data.name}</p>
            <p class="plan__price">
              <span class="plan__price--current">${
                recent.length > 0
                  ? formatCurrency(totalDeposit, "NGN")
                  : formatCurrency(0, "NGN")
              }</span> /
              <span class="plan__price--total">${formatCurrency(
                data.target,
                "NGN"
              )}</span>
            </p>
          </div>
          <div class="plan__progress-container">
            <strong class="plan__progress-percent">${percentage.toFixed(
              2
            )}%</strong>
          </div>
        </figcaption>

        <div class="plan__race">
          <div class="plan__progress-bar">
            <div class="plan__progress-bar--range" style="width: ${percentage}%"></div>
          </div>
        
          <svg class="plan__race-icon">
            <use href="${icons}#icon-checkered-flag"></use>
          </svg>
        </div>

        <p class="plan__upcoming-date">
          <span>${this._generateMarkupUpcomingDateMessage(data)}</span>
        </p>
      </figure>
    `;
  }

  _generateMarkupUpcomingDateMessage(data) {

    if (!data.completed && !data.withdrawal)
      return `Your ${data.nextDate ? "next" : "first"} deposit ${
        data.pendingPayment ? "was supposed to be" : "is"
      } ${
        data.nextDate ? formatDate(data.nextDate) : formatDate(data.startDate)
      }`;

    if (data.completed && !data.withdrawn)
      return `Plan completed and funds not withdrawn`;

    if (data.completed && data.withdrawn)
      return `Plan completed and funds withdrawn`;
  }

  _generateMarkupMenuItem(data) {
    // Plan is active
    if (data.active)
      return `
        <li class="menu__item" data-item="mt">Make deposit</li>
        <li class="menu__item" data-item="dp">Change deposit</li>
        <li class="menu__item" data-item="gt">Change target</li>
        <li class="menu__item" data-item="tp">Change type</li>
        <li class="menu__item" data-item="dg">Change card</li>
        <li class="menu__item" data-item="al">${
          data.active ? "Deactivate" : "Activate"
        } plan</li>
        <li class="menu__item" data-item="en">Delete plan</li>
      `;

    // Plan is not active
    if (!data.active)
      return `
        <li class="menu__item" data-item="dp">Change deposit</li>
        <li class="menu__item" data-item="gt">Change target</li>
        <li class="menu__item" data-item="tp">Change type</li>
        <li class="menu__item" data-item="dg">Change card</li>
        <li class="menu__item" data-item="al">${
          data.active ? "Deactivate" : "Activate"
        } plan</li>
        <li class="menu__item" data-item="en">Delete plan</li>
      `;
  }

  _generateMarkupHistory(data) {
    const recent = this._data.data.account.transactions.plan.recent
      .filter((el) => el.num === data.id)
      .reverse();
    return `
      <div class="plan__history">
        <header class="plan__history-header margin-bottom-sm">
          <h2 class="header-subtitle">Saving History</h2>
        </header>

        <ul class="plan__history-list">
          ${
            recent.length < 1
              ? `<p class="empty-transaction">No transaction performed yet</p>`
              : `${recent
                  .map((el) => this._generateMarkupHistoryItem(el))
                  .join("")}`
          }
        </ul>
      </div>
    `;
  }

  _generateMarkupHistoryItem(data) {
    return `
      <li class="plan__history-item">
        <div class="plan__history-content">
          <svg class="plan__icon plan__icon--small">
            <use href="${planIcons}#icon-${data.category}"></use>
          </svg>
          <div class="plan__history-details">
            <strong class="plan__history-details--date"
              >${data.date}</strong
            >
            <p class="plan__history-details--time">at ${data.time}</p>
          </div>
          <p class="plan__history-deposit">${formatCurrency(
            data.amount,
            "NGN"
          )}</p>
        </div>
      </li>
    `;
  }
}

export default new PlanDetailsView();
