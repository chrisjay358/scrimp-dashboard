import planIcons from "url:../../img/icon-plan.svg";
import { formatCurrency } from "../helpers";

class PlanTableView {
  _parentElement;
  _messageActive = `No ongoing plans`;
  _messageInactive = `No inactive plans`;
  _messageCompleted = `No completed plans`;

  _message(value) {
    if (value === "at") return this._messageActive;

    if (value === "na") return this._messageInactive;

    if (value === "cp") return this._messageCompleted;
  }

  _filteredPlans(value) {
    const recent = this._data.account.plan.recent;

    if (value === "at") return recent.filter((el) => el.active);

    if (value === "na")
      return recent.filter((el) => !el.active && !el.completed);

    if (value === "cp") return recent.filter((el) => el.completed);
  }

  _orderedPlans(value, plans) {
    if (value === "default") return plans;

    if (value === "old") return plans.reverse();

    if (value === "low") return plans.sort((a, b) => a.target - b.target);

    if (value === "high") return plans.sort((a, b) => b.target - a.target);
  }

  _setDate(date) {
    return new Intl.DateTimeFormat(navigator.language, {
      dateStyle: "long",
    }).format(new Date(date));
  }

  update(data, value) {
    this._data = data;
    this._parentElement = document.querySelector(".plan__list");
    const activeTab = document.querySelector(".tab--active").dataset.btn;

    const recent = this._filteredPlans(activeTab);

    let markup, plans;

    this._filteredPlans(activeTab);

    plans = this._orderedPlans(value, recent);
    markup =
      plans.length > 0
        ? `${plans.map((el) => this._generateMarkup(el)).join("")}`
        : `<p class="empty-transaction">${this._message(activeTab)}</p>`;

    this._parentElement.innerHTML = "";
    this._parentElement.insertAdjacentHTML("beforeend", markup);
  }

  render(data, value, order) {
    this._data = data;
    this._parentElement = document.querySelector(".plan__list");

    const recent = this._filteredPlans(value);

    let markup, plans;

    plans = this._orderedPlans(order, recent);
    markup =
      plans.length > 0
        ? `${plans.map((el) => this._generateMarkup(el)).join("")}`
        : `<p class="empty-transaction">${this._message(value)}</p>`;

    this._parentElement.innerHTML = "";
    this._parentElement.insertAdjacentHTML("beforeend", markup);
  }

  _generateMarkup(data) {
    const recent = this._data.account.transactions.plan.recent.filter(
      (el) => el.num === data.id && !el.planWithdrawal
    );

    const totalDeposit = recent.reduce((acc, num) => acc + +num.amount, 0);

    const percentage = (totalDeposit * 100) / data.target;

    return `
      <li class="plan__item">
        <div class="plan__item-content" data-id=${data.id.slice(-3)}>
          <svg class="plan__icon plan__icon--small">
            <use href="${planIcons}#icon-${data.category}"></use>
          </svg>
          <div class="plan__details">
            <p class="plan__name">${data.name}</p>
            <p class="plan__subscription">
              <span class="plan__subscription--cycle"
                >${data.type[0].toUpperCase() + data.type.slice(1)} saving</span
              >:
              <span class="plan__subscription--amount">${formatCurrency(
                data.deposit,
                "NGN"
              ).slice(0, -3)}</span>
            </p>
          </div>

          <p class="plan__price">
            <span class="plan__price--current">${
              recent.length > 0
                ? formatCurrency(totalDeposit, "NGN")
                : formatCurrency(0, "NGN")
            }</span>
          </p>

          <div class="plan__progress-container">
            <div class="plan__progress-bar">
              <div class="plan__progress-bar--range" style="width: ${percentage}%"></div>
            </div>
            <strong class="plan__progress-percent">${
              percentage ? Math.trunc(percentage) : 0
            }%</strong>
          </div>

          <p class="plan__upcoming">
            <span class="plan__upcoming--text">${
              data.nextDate && !data.completed
                ? "Next Deposit"
                : data.nextDate && data.completed
                ? ""
                : "First Deposit"
            }</span>
            <span class="plan__upcoming--date">${
              data.nextDate && !data.completed
                ? data.nextDate
                : data.nextDate && data.completed
                ? "Completed"
                : this._setDate(data.startDate)
            }</span>
          </p>
        </div>
      </li>
    `;
  }
}

export default new PlanTableView();
