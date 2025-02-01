import View from "./View.js";
import icons from "url:../../img/icons.svg";
import planIcons from "url:../../img/icon-plan.svg";
import { formatCurrency, checkDate, getNextDate } from "../helpers.js";

class PlanView extends View {
  _parentElement = document.querySelector(".main--plan");
  _updateDate = [];

  constructor() {
    super();
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

  addHandlerRenderCreatePlan(handler) {
    this._parentElement?.addEventListener("click", (e) => {
      if (e.target.closest(".btn-plan--add")) {
        handler();
      }
    });
  }

  addHandlerChangeOrder(handler) {
    this._parentElement?.addEventListener("change", (e) => {
      if (e.target.closest(".plan__order")) {
        // Get order value
        const order = e.target.value;

        const type = "plan";

        handler(order, type);
      }
    });
  }

  addHandlerRenderDetails(handler) {
    this._parentElement?.addEventListener("click", (e) => {
      if (e.target.closest(".plan__item")) {
        // Get id
        const id = e.target
          .closest(".plan__item")
          .querySelector(".plan__item-content").dataset.id;

        handler(id);
      }
    });
  }

  addHandlerUpdateDeposit(handler) {
    const plans = this._updateDate;

    // Check that length is not empty
    if (plans.length > 0)
      plans.forEach((el, i, arr) => {
        handler(el[0], el[1]);
      });
  }

  addHandlerRenderTab(handler) {
    this._parentElement?.addEventListener("click", (e) => {
      if (e.target.classList.contains("tab__content--plan")) {
        // Get data attribute
        const btn = e.target.dataset.btn;
        const activeTab = document.querySelector(".plan__order").value;

        // Select active tab
        const container = e.target.closest(".tab__content-container");

        // Select all child elements
        const children = container.children;

        // Remove active class
        Array.from(children, (item) => {
          item.classList.remove(`tab--active`);
        });

        // Add active class
        e.target.classList.add(`tab--active`);

        handler(btn, "plan", activeTab);
      }
    });
  }

  _checkCardBalance(data) {
    const cardBalance = this._data.account.transactions.card.recent
      .filter((el) => el.card.endsWith(+data.card))
      .reduce((acc, num) => acc + +num.amount, 0);

    return cardBalance > data.deposit;
  }

  _checkTransactionHistory(data) {
    // Get transactions
    const recent = this._data.account.transactions.plan.recent;
    const transactionObj = recent
      .filter((el) => el.num === data.id && !el.selfDeposit)
      ?.at(-1);

    if (recent.length < 1 || !transactionObj) return;

    // Get last transaction date
    const lastTransactionDate = new Intl.DateTimeFormat(navigator.language, {
      dateStyle: "long",
    }).format(transactionObj ? new Date(transactionObj.date) : "");

    const date = data.nextDate ? data.nextDate : data.startDate;
    const dateElapsed = getNextDate(date, data.type);
    const timeElapsed = 1000 * 60 * 60 * 24;
    const timePassed = Math.round(
      (dateElapsed - Date.parse(lastTransactionDate)) / timeElapsed
    );

    return timePassed;
  }

  _getNextDepositDate(data) {
    let depositDate;

    // Next date does not exist
    if (!data.nextDate) {
      // Start date matches today's date and available card balance is greater than deposit amount
      if (checkDate(data.startDate) < 1 && this._checkCardBalance(data)) {
        // Check that last transaction date cycle does not exist [So it does not debit multiple times]
        if (!this._checkTransactionHistory(data)) {
          // Update deposit date
          depositDate = getNextDate(data.startDate, data.type);

          // Check for pending payment
          data.pendingPayment = "";

          // Empty the array before push
          this._updateDate = [];

          // Add to array
          this._updateDate.push([data, depositDate]);
        }
      }

      // Start date matches today's date and available card balance is low
      if (checkDate(data.startDate) < 1 && !this._checkCardBalance(data)) {
        // Set pending payment
        data.pendingPayment = true;

        // Set date to start date
        depositDate = data.startDate;
      }

      // Start date does not match today's date
      if (checkDate(data.startDate) >= 1) {
        // Set date to start date
        depositDate = data.startDate;
      }
    }

    // Next date exist
    if (data.nextDate) {
      // Next date matches today's date and available card balance is greater than deposit amount
      if (checkDate(data.nextDate) < 1 && this._checkCardBalance(data)) {
        // Last transaction date cycle has reached for another transaction
        if (this._checkTransactionHistory(data) < 1) {
          // Update deposit date
          depositDate = getNextDate(data.nextDate, data.type);

          // Check for pending payment
          data.pendingPayment = "";

          // Empty the array before push
          this._updateDate = [];

          // Add to array
          this._updateDate.push(data);
        }

        // Last transaction date cycle has not reached
        if (this._checkTransactionHistory(data) > 1) {
          depositDate = data.nextDate;
        }
      }

      // Next date matches today's date and available card balance is low
      if (checkDate(data.nextDate) < 1 && !this._checkCardBalance(data)) {
        // Set pending payment to true
        data.pendingPayment = true;

        depositDate = data.nextDate;
      }

      // If next date does not match today's date
      if (checkDate(data.nextDate) >= 1) {
        depositDate = data.nextDate;
      }
    }

    return new Intl.DateTimeFormat(navigator.language, {
      dateStyle: "long",
    }).format(new Date(depositDate));
  }

  _getRandomNumber(min, max) {
    const random = Math.floor(Math.random() * (max - min)) + min;

    // Random array is empty
    if (this._random.length < 1) {
      // Push to array
      this._random.push(random);
      return random;
    }

    // Random array is not empty and contains new random number
    if (this._random.length > 0 && this._random.includes(random)) {
      return this._getRandomNumber(min, max);
    }

    // Random array is not empty and doesn't contain new random number
    if (this._random.length > 0 && !this._random.includes(random)) {
      // Push to array
      this._random.push(random);
      return random;
    }
  }

  _randomPlans() {
    let num1, num2;

    // Get active plans
    const activePlans = this._data.account.plan.recent.filter(
      (el) => el.active
    );

    // Get lenfth of active plans
    const length = activePlans.length;

    // Create empty array
    this._random = [];

    //  Check length if 2 or less
    if (activePlans.length <= 2) return activePlans;

    // Assign values
    num1 = this._getRandomNumber(0, length);
    num2 = this._getRandomNumber(0, length);

    // Create empty array
    this._random = [];

    return activePlans.filter((el, i) => i === num1 || i === num2);
  }

  _generateMarkup() {
    return `
      <div class="plan">
        ${this._generateMarkupContent()}
        ${this._generateMarkupTable()}
      </div>

      <aside class="plan__details-container">
        <p class="overview__text">SELECT A PLAN</p>
      </aside>
    `;
  }

  _generateMarkupContent() {
    const plans = this._randomPlans();

    return `
      <div class="plan__content-container">
        <header class="plan__content-header margin-bottom-md">
          <h2 class="header-subtitle">Goals</h2>
          <button class="btn-plan btn-plan--add">
            <span>Add New Plan</span>
            <svg class="btn-plan__icon">
              <use href="${icons}#icon-plus1"></use>
            </svg>
          </button>
        </header>

        <div class="plan__content-box ${
          plans.length < 1 ? "margin-bottom-sm" : "margin-bottom-md"
        }">
          <p class="plan__subheading">${
            plans.length < 1
              ? "Create a plan to begin your journey!"
              : `Keep it up! You're almost there!`
          }</p>
          <div class="plan__savings-container">
            ${
              plans.length < 1
                ? ``
                : `${plans
                    .map((el) => this._generateMarkupSavingPlan(el))
                    .join("")}`
            }
          </div>
        </div>
      </div>
    `;
  }

  _generateMarkupSavingPlan(data) {
    const recent = this._data.account.transactions.plan.recent.filter(
      (el) => el.num === data.id
    );
    const totalDeposit = recent.reduce((acc, num) => acc + +num.amount, 0);

    const percentage = (totalDeposit * 100) / data.target;

    return `
      <article class="savings__plan" data-id=${data.id.slice(-3)}>
        <svg class="savings__plan-icon plan__icon plan__icon--small">
          <use href="${planIcons}#icon-${data.category}"></use>
        </svg>
        <div class="savings__plan-name">${data.name}</div>
        <div class="savings__plan-price">
          <span class="savings__plan-price--current">${
            recent.length > 0
              ? formatCurrency(totalDeposit, "NGN")
              : formatCurrency(0, "NGN")
          }</span>
        </div>
        <div class="savings__plan-percent">${
          percentage ? percentage.toFixed(2) : 0
        }%</div>
        <div class="savings__plan-range-box">
          <div class="savings__plan-range"  style="width: ${percentage}%"></div>
        </div>
      </article>
    `;
  }

  _generateMarkupTable() {
    const plans = this._data.account.plan.recent.filter((el) => el.active);
    return `
      <div class="plan__table-container">
        <header class="plan__table-header margin-bottom-sm">
          <h2 class="plan__heading">Ongoing Plans</h2>
        </header>
        <div class="plan__tabs-containers tab__container tab__container--plan margin-bottom-sm">
          <div class=" tab__content-container">
            <button class="tab__content tab__content--plan tab--active" data-btn="at">Active</button>
            <button class="tab__content tab__content--plan" data-btn="na">Not Active</button>
            <button class="tab__content tab__content--plan" data-btn="cp">Completed</button>
          </div>

          <form action="#" class="plan__tabs-form">
            <select name="planOrder" id="" class="plan__order">
              <option value="default">Default</option>
              <option value="old">Old</option>
              <option value="low">Price: Low - high</option>
              <option value="high">Price: High - low</option>
            </select>
          </form>
        </div>

        <ul class="plan__list">
          ${
            plans.length < 1
              ? `<p class="empty-transaction">No plans created yet</p>`
              : `${plans
                  .map((el) => this._generateMarkupTableItem(el))
                  .join("")}`
          }
        </ul>
      </div>
    `;
  }

  _generateMarkupTableItem(data) {
    const recent = this._data.account.transactions.plan.recent.filter(
      (el) => el.num === data.id
    );
    const totalDeposit = recent.reduce((acc, num) => acc + +num.amount, 0);

    const percentage = (totalDeposit * 100) / data.target;

    const nextDeposit = this._getNextDepositDate(data);

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
              data.nextDate ? "Next" : data.pendingPayment ? "Pending" : "First"
            } Deposit</span>
            <span class="plan__upcoming--date">${nextDeposit}</span>
          </p>
        </div>
      </li>
    `;
  }
}

export default new PlanView();
