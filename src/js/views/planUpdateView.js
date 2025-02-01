import View from "./View";
import { formatCurrency } from "../helpers";

class PlanUpdateView extends View {
  _parentElement = document.querySelector(".content");
  _processingMessage;
  _confirmationMessage;

  addHandlerEditPlan(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      if (e.target.classList.contains("overlay__form-update--plan")) {
        // Set message
        this._processingMessage = "Updating plan";
        this._confirmationMessage = "Updated";

        // Get total plan deposit
        const totalDeposit = this._data.account.transactions.plan.recent
          .filter((el) => el.num === this._plan.id)
          .reduce((acc, num) => acc + +num.amount, 0);

        // Get plan target amount
        const planTarget = this._plan.target;

        // Get form data
        const dataArr = [...new FormData(e.target)];
        const dataObj = Object.fromEntries(dataArr);


        // DEPOSIT AMOUNT
        // Deposit amount greater than target
        if (+dataObj.deposit > +planTarget) {
          return this._renderError("Amount cannot excced target!");
        }

        // Deposit amount lesser than 100 (minimum amount)
        if (+dataObj.deposit < 100) {
          return this._renderError("Amount cannot be less than 100!");
        }

        // Deposit amount is less than target and greater than 100(minimum amount)
        if (+dataObj.deposit < +planTarget && +dataObj.deposit > 100) {
          // Add id
          dataArr.push({ id: this._id });


          handler(this._id, dataArr, this);
        }

        // TAREGT AMOUNT
        // Target amount is lesser than total Deposit
        if (+dataObj.target < totalDeposit)
          return this._renderError(
            "Taregt cannot be less than plan total deposit!"
          );

        // Target amount is greater than total Deposit
        if (+dataObj.target > totalDeposit) {
          // Add id
          dataArr.push({ id: this._id });

          handler(this._id, dataArr, this);
        }

        // TYPE
        // New type is equal/same as current type
        if (dataObj.type === this._plan.type) {
          return this._renderError("Cannot select same type");
        }

        // New type is different from  current type
        if (dataObj.type && dataObj.type !== this._plan.type) {
          // Add id
          dataArr.push({ id: this._id });

          handler(this._id, dataArr, this);
        }

        // CARD
        // New card is equal/same as current card
        if (dataObj.card === this._plan.card) {
          return this._renderError("Cannot select same card");
        }

        // New card is different from  current card
        if (dataObj.card && dataObj.card !== this._plan.card) {
          // Add id
          dataArr.push({ id: this._id });

          // Check for pending payment
          if (this._plan.pendingPayment)
            return handler(this._id, dataArr, this, this._plan);

          handler(this._id, dataArr, this);
        }
      }
    });
  }

  addHandlerMakeDeposit(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      // Check for element
      if (e.target.classList.contains("overlay__form-update--deposit")) {
        // Set message
        this._processingMessage = "Making deposit";
        this._confirmationMessage = "Deposited";

        // Set plan (To stop mutation of data)
        const plan = { ...this._plan };

        // Get card balance
        const cardBalance = this._data.account.transactions.card.recent
          .filter((el) => el.card.endsWith(+plan.card))
          .reduce((acc, num) => acc + +num.amount, 0);

        const remainingBalance = +plan.target - +this._planTotalDeposit;

        // Get form data
        const dataArr = [...new FormData(e.target)];
        const dataObj = Object.fromEntries(dataArr);

        // Remove and set properties
        delete plan.deposit;
        plan.makeDeposit = dataObj.deposit;

        // Card doesn't exist anymore
        if (!this._getPlanCard())
          return this._renderError(
            "Card no longer exist. Please select another card!"
          );

        // Deposit amount lesser/equal 0
        if (+dataObj.deposit <= 0)
          return this._renderError(`Amount must exceed 0`);

        // Deposit amount greater than card balnace
        if (+dataObj.deposit > cardBalance)
          return this._renderError("Low funds. Please try again!");

        // Deposit amount greater than plan target amount
        if (+dataObj.deposit > +plan.target)
          return this._renderError(
            "Amount cannot be greater than target amount!"
          );

        if (+dataObj.deposit > remainingBalance)
          return this._renderError(
            `Amount cannot be greater than remaining balance of ${formatCurrency(
              remainingBalance,
              "NGN"
            )}!`
          );

        handler(this._id, plan, this);
      }
    });
  }

  addHandlerPlanWithdrawal(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      if (e.target.classList.contains("overlay__form-plan--withdrawal")) {
        // Set message
        this._processingMessage = "Withdrawing funds";
        this._confirmationMessage = "Withdrawn";

        // Get form data
        const dataArr = [...new FormData(e.target)];
        const formData = Object.fromEntries(dataArr);

        // Set properties
        formData.recipient = `${this._plan.name} - Plan completion`;
        formData.withdrawalAmount = this._planTotalDeposit;
        formData.withdrawal = true;
        formData.id = this._plan.id;
        formData.type = this._plan.type;
        formData.category = this._plan.category;

        handler(this._id, formData, this);
      }
    });
  }

  addHandlerDeactivate(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      // Check for element
      if (e.target.classList.contains("overlay__form-update--deactivate")) {
        // Set message
        this._processingMessage = `${
          this._plan.active ? "Deactivating" : "Activating"
        } plan`;
        this._confirmationMessage = `${
          this._plan.active ? "Deactivated" : "Activated"
        }`;

        // Get text content
        const confirmation = e.submitter.textContent.toLowerCase();

        handler(this._id, confirmation, this);
      }
    });
  }

  addHandlerDeletePlan(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      // Check for element
      if (e.target.classList.contains("overview__form-plan--deletion")) {
        // Set message
        this._processingMessage = "Deleting plan";
        this._confirmationMessage = "Deleted";

        // Get text content
        const confirmation = e.submitter.textContent.toLowerCase();

        // Set type
        const type = "plan";

        this._getPlanCard();

        // Get transaction object
        const transaction = this._getTransaction();

        handler(this._id, confirmation, type, transaction, this);
      }
    });
  }

  _getPlanCard() {
    // Get card
    const getCard = this._data.account.card.recent.find((el) =>
      el.number.endsWith(+this._plan.card)
    );

    return getCard;
  }

  _getTransaction() {
    // Card still exist
    if (this._getPlanCard())
      return {
        recipient: `${this._plan.name} - Plan deletion`,
        refundAmount: this._planTotalDeposit,
        category: "Plan refund",
        card: this._plan.card,
      };

    // Card doesn't exist
    if (!this._getPlanCard())
      return {
        name: `${this._plan.name} - Plan deletion`,
        refundAmount: this._planTotalDeposit,
      };
  }

  render(data, goToPage, id) {
    // Set properties
    this._data = data;
    this._id = id;
    this._plan = data.account.plan.recent.find((el) => el.id.endsWith(id));

    this._planTotalDeposit = this._data.account.transactions.plan.recent
      .filter((el) => el.num === this._plan.id)
      .reduce((acc, num) => acc + +num.amount, 0);

    // Get overlay element
    const overlay = document.querySelector(".overlay");
    let markup;

    // Set go to page
    if (goToPage === "mt") markup = this._generateMarkupMakeDeposit(this._plan);
    if (goToPage === "dp")
      markup = this._generateMarkupUpdateDepositAmount(this._plan);
    if (goToPage === "gt")
      markup = this._generateMarkupUpdateTargetAmount(this._plan);
    if (goToPage === "tp") markup = this._generateMarkupUpdateType(this._plan);
    if (goToPage === "dg") markup = this._generateMarkupUpdateCard();
    if (goToPage === "wd") markup = this._generateMarkupWithdrawal();
    if (goToPage === "al") markup = this._generateMarkupDeactivate(this._plan);
    if (goToPage === "en") markup = this._generateMarkupDelete();

    // Remove overlay
    if (overlay) overlay.remove();

    // Insert Html
    this._parentElement.insertAdjacentHTML("beforeend", markup);

    // Set active type
    if (goToPage === "tp")
      document.querySelector(".overlay__form-select--type").value =
        this._plan.type;

    // Set active card
    if (goToPage === "dg")
      document.querySelector(".overlay__form-select--card").value =
        this._plan.card;

    // Set active card
    if (goToPage === "wd")
      document.querySelector(".overlay__form-select--card").value =
        this._plan.card;
  }

  _generateMarkupMakeDeposit({ deposit }) {
    return `
      <div class="overlay">
        <div class="overlay__plan overlay__plan--update">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">Make deposit</h2>
            </header>

            <form class="overlay__form overlay__form-update--deposit">
              <div class="overlay__form-group margin-bottom-md">
                <label for="plan-deposit" class="overlay__form-label">Deposit amount</label>
                <input type="number" name="deposit" id="plan-deposit" step="0.01" class="overlay__form-input overlay__form-input--deposit" placeholder="Enter savings amount" value="${deposit}" required>
              </div>

              <div class="overlay__btn-group">
                <button class="overlay__btn-form overlay__btn-form--update">Make deposit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  _generateMarkupUpdateDepositAmount({ deposit }) {
    return `
      <div class="overlay">
        <div class="overlay__plan overlay__plan--update">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">Update deposit amount</h2>
            </header>

            <form class="overlay__form overlay__form-update--plan">
              <div class="overlay__form-group margin-bottom-md">
                <label for="plan-deposit" class="overlay__form-label">Deposit amount</label>
                <input type="number" name="deposit" id="plan-deposit" step="0.01" class="overlay__form-input overlay__form-input--deposit" placeholder="Enter savings amount" value="${deposit}" required>
              </div>

              <div class="overlay__btn-group">
                <button class="overlay__btn-form overlay__btn-form--update">Update deposit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  _generateMarkupUpdateTargetAmount({ target }) {
    return `
      <div class="overlay">
        <div class="overlay__plan overlay__plan--update">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">Update target amount</h2>
            </header>

            <form class="overlay__form overlay__form-update--plan">
              <div class="overlay__form-group margin-bottom-sm">
                <label for="plan-target" class="overlay__form-label">Target amount</label>
                <input type="number" name="target" id="plan-target" step="0.01" class="overlay__form-input overlay__form-input--amount" placeholder="Enter target amount" value="${target}" required>
              </div>

              <div class="overlay__btn-group">
                <button class="overlay__btn-form overlay__btn-form--update">Update target</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  _generateMarkupUpdateType() {
    return `
      <div class="overlay">
        <div class="overlay__plan overlay__plan--update">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">Update type</h2>
            </header>

            <form class="overlay__form overlay__form-update--plan">
              <div class="overlay__form-group margin-bottom-sm">
                <label for="plan-type" class="overlay__form-label">Budget type</label>
                <select name="type" id="plan-type" class="overlay__form-select overlay__form-select--type" required>
                  <option value="">Select budget type</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div class="overlay__btn-group">
                <button class="overlay__btn-form overlay__btn-form--update">Update type</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  _generateMarkupUpdateCard() {
    const cards = this._data.account.card.recent;

    return `
      <div class="overlay">
        <div class="overlay__plan overlay__plan--update">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">Update card</h2>
            </header>

            <form class="overlay__form overlay__form-update--plan">
              <div class="overlay__form-group margin-bottom-sm">
                <label for="plan-card" class="overlay__form-label">Select card</label>
                <select name="card" id="plan-card" class="overlay__form-select overlay__form-select--card" required>
                  <option value="">Card to debit</option>
                  ${cards.map((el) => this._generateMarkupCard(el)).join("")}
                </select>
              </div>

              <div class="overlay__btn-group">
                <button class="overlay__btn-form overlay__btn-form--update">Update card</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  _generateMarkupWithdrawal() {
    const cards = this._data.account.card.recent;

    return `
      <div class="overlay">
        <div class="overlay__plan overlay__plan--withdrawal">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">Withdrawal</h2>
            </header>

            <form class="overlay__form overlay__form-plan--withdrawal">
              <div class="overlay__form-group margin-bottom-sm">
                <label for="plan-card" class="overlay__form-label">Select card</label>
                <select name="card" id="plan-card" class="overlay__form-select overlay__form-select--card" required>
                  <option value="">Card to debit</option>
                  ${cards.map((el) => this._generateMarkupCard(el)).join("")}
                </select>
              </div>

              <div class="overlay__btn-group">
                <button class="overlay__btn-form overlay__btn-form--withdraw">Withdraw</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  _generateMarkupDeactivate({ active }) {
    return `
      <div class="overlay">
        <div class="overlay__plan overlay__plan--confirm">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">${
                active ? "Deactivate" : "Activate"
              } plan</h2>
            </header>

            <form class="overlay__form overlay__form-update--deactivate">
              <p class="overlay__message margin-bottom-sm">Are you sure you want to ${
                active ? "deactivate" : "activate"
              } this plan?</p>

              <div class="overlay__btn-group">
              <button class="overlay__btn-form overlay__btn-form--no">No</button>
                <button class="overlay__btn-form overlay__btn-form--yes">Yes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }
  _generateMarkupDelete() {
    return `
      <div class="overlay">
        <div class="overlay__plan overlay__plan--confirm">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">Delete plan</h2>
            </header>

            <form class="overlay__form overview__form-plan--deletion">
              <p class="overlay__message margin-bottom-sm">Are you sure you want to delete this plan?</p>

              <div class="overlay__btn-group">
                <button class="overlay__btn-form overlay__btn-form--no">No</button>
                <button class="overlay__btn-form overlay__btn-form--yes">Yes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  _generateMarkupCard(data) {
    return `
      <option value="${data.number.slice(-4)}">${
      data.title[0].toUpperCase() + data.title.slice(1)
    } - ${data.number.slice(-4)}</option>
    `;
  }

  _renderError(message) {
    const formElement = document.querySelector(".overlay__form");

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

    setTimeout(() => document.querySelector(".form__error-box").remove(), 3000);
  }
}

export default new PlanUpdateView();
