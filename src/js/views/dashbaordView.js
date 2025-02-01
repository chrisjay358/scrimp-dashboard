import View from "./View.js";
import icons from "url:../../img/icons.svg";
import planIcons from "url:../../img/icon-plan.svg";

import { formatCurrency } from "../helpers.js";
import tableView from "./tableView.js";

import Chart from "chart.js/auto";

class dashboardView extends View {
  _parentElement = document.querySelector(".main--dashboard");
  _navList = document.querySelector(".nav__list");
  _navElements = document.querySelectorAll(".nav__link");
  _random = [];
  _headCells = [
    "Recipient",
    "Transaction ID",
    "Date",
    "Amount",
    "Card",
    "Category",
    "Status",
  ];
  _ctx;
  _myChart;
  love = document.querySelector(".analytics__chart");

  addHandlerLogout(handler) {
    this._navList?.addEventListener("click", (e) => {
      // Check for element
      const btn = e.target.closest(".nav__log-out");

      // Guard clause
      if (!btn) return;

      handler();
    });
  }

  addHandlerHighlight() {
    this._navElements.forEach((link) => {
      if (link.getAttribute("href") === location.pathname)
        link.classList.add("nav__link--active");
    });
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

  _sortPlans() {
    const { user } = this._data;

    // Initialize variables
    let num1, num2, num3;

    // Get active plans
    const plans = user.account.plan.recent.filter((el) => el.active);

    // Get length of active plans
    const length = plans.length;

    // Check length
    if (plans.length < 4) return plans;

    num1 = this._getRandomNumber(0, length);
    num2 = this._getRandomNumber(0, length);
    num3 = this._getRandomNumber(0, length);

    // Create empty array
    this._random = [];

    return plans.filter((el, i) => i === num1 || i === num2 || i === num3);
  }

  _generateMarkup() {
    return `${this._generateMarkupTotalView()}  ${this._generateMarkupChart()} ${this._generateMarkupSavingsPlan()} ${this._generateMarkupRecentTable()}`;
  }

  _generateMarkupTotalView() {
    const { user } = this._data;
    const transactions = user.account.transactions;
    const bank = transactions.bank.recent.reduce(
      (acc, el) => acc + +el.amount,
      0
    );
    const card = transactions.card.recent.reduce(
      (acc, el) => acc + +el.amount,
      0
    );

    const totalBalance = bank + card;

    const totalIncome = transactions.bank.recent
      .filter((el) => el.amount > 0)
      .reduce((acc, el) => acc + +el.amount, 0);

    const totalDebit = transactions.card.recent
      .filter((el) => el.description || el.payment)
      .reduce((acc, el) => acc + +el.amount, 0);

    const totalSavings = transactions.card.recent
      .filter((el) => el.category.includes("Plan"))
      .reduce((acc, el) => acc + +el.amount, 0);

    return `
      <div class="total">
        <article class="total__balance">
          <svg class="total__icon">
            <use href="${icons}#icon-wallet"></use>
          </svg>
          <p class="total__heading">Total Balance</p>
          <p class="total__figure">${formatCurrency(totalBalance, "NGN")}</p>
        </article>
        <article class="total__income">
          <svg class="total__icon">
            <use href="${icons}#icon-inflow"></use>
          </svg>
          <p class="total__heading">Total Income</p>
          <p class="total__figure">${formatCurrency(totalIncome, "NGN")}</p>
        </article>
        <article class="total__expenses">
          <svg class="total__icon">
            <use href="${icons}#icon-outflow"></use>
          </svg>
          <p class="total__heading">Total Expenses</p>
          <p class="total__figure">${formatCurrency(
            Math.abs(totalDebit),
            "NGN"
          )}</p>
        </article>
        <article class="total__savings">
          <svg class="total__icon">
            <use href="${icons}#icon-pig"></use>
          </svg>
          <p class="total__heading">Savings Balance</p>
          <p class="total__figure">${formatCurrency(
            Math.abs(totalSavings),
            "NGN"
          )}</p>
        </article>
      </div>
    `;
  }

  _generateMarkupChart() {
    return `
      <div class="analytics">
        <article class="analytics__chart-box">
          <canvas id="myCharts" class="analytics__chart"></canvas>
        </article>
      </div>
    `;
  }

  _generateMarkupSavingsPlan() {
    const plans = this._sortPlans();
    return `
      <div class="savings">
        <header class="savings__header">
          <h2 class="heading-subtitle">Savings Plan</h2>
          <a href="plans.html" class="view__all">View All</a>
        </header>
        
        <div class="savings__plan-box">
          ${
            plans.length < 1
              ? `<p class="empty-transaction">No plans created yet</p>`
              : `${plans.map((el) => this._generateMarkupPlan(el)).join("")}`
          }
        </div>
      </div>
    `;
  }

  _generateMarkupPlan(data) {
    const { user } = this._data;
    const recent = user.account.transactions.plan.recent.filter(
      (el) => el.num === data.id
    );
    const totalDeposit = recent.reduce((acc, num) => acc + +num.amount, 0);

    const percentage = (totalDeposit * 100) / data.target;
    return `
      <div class="savings__plan">
        <svg class="plan__icon savings__plan-icon">
          <use href="${planIcons}#icon-${data.category}"></use>
        </svg>
        <div class="savings__plan-name">${data.name}</div>
        <div class="savings__plan-price">
          <span class="savings__plan-price--current">${formatCurrency(
            totalDeposit,
            "NGN"
          )}</span>
        </div>
        <div class="savings__plan-percent">${
          percentage ? percentage.toFixed(2) : 0
        }%</div>
        <div class="savings__plan-range-box">
          <div class="savings__plan-range"  style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }

  _generateMarkupRecentTable() {
    const { user } = this._data;
    const recent = user.account.transactions.card.recent
      .toReversed()
      .slice(0, 6);

    return `
      <div class="recent">
        <header class="recent__header">
          <h2 class="heading-subtitle">Recent Transactions</h2>
          <a href="transactions.html" class="view__all">View All</a>
        </header>

        <div class="transactions__table-box">
          ${tableView._generateMarkup(this._headCells, recent, "dashbaord")}
          ${
            recent.length < 1
              ? `<p class="empty-transaction">No transaction performed yet</p>`
              : ""
          }
        </div>
      </div>

    `;
  }

  renderChart() {
    const { config } = this._data;
    this._ctx = document.querySelector(".analytics__chart");

    this._myChart = new Chart(this._ctx, config);
  }

  update() {
    this._myChart.update("active");
  }
}

export default new dashboardView();
