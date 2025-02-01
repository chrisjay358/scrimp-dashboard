import View from "./View";

class PlanCreationView extends View {
  _parentElement = document.querySelector(".content");
  _processingMessage = "Creating plan";
  _confirmationMessage = "Created";

  addHandlerCreatePlan(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      e.preventDefault();

      // Check for element
      if (e.target.classList.contains("overlay__form--plan")) {
        // Get form data
        const dataArr = [...new FormData(e.target)];
        const obj = Object.fromEntries(dataArr);

        // Deposit amount larger than target amount
        if (+obj.deposit > +obj.target)
          return this._renderError(
            "Deposit amount cannot be larger than target amount"
          );

        // Check if plan name already exist
        if (this._checkPlanName(obj.name))
          return this._renderError("Plan name already exist");

        handler(obj, this);
      }
    });
  }

  _checkPlanName(name) {
    const plans = this._data.account.plan.recent
      .filter((el) => el.name)
      .map((el) => el.name.toLowerCase())
      .includes(name.toLowerCase());

    return plans;
  }

  render(data) {
    this._data = data;
    const overlay = document.querySelector(".overlay");

    const markup = this._generateMarkup();
    if (overlay) overlay.remove();

    this._parentElement.insertAdjacentHTML("beforeend", markup);
  }

  _getDate() {
    const date = new Date();

    return new Intl.DateTimeFormat(navigator.language, {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    })
      .format(date)
      .split("/");
  }

  _generateMarkup() {
    const cards = this._data.account.card.recent;

    return `
      <div class="overlay">
        <div class="overlay__plan overlay__plan--creation">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">Create A Plan</h2>
            </header>
        
            <form class="overlay__form overlay__form--plan">
              <div class="overlay__form-group">
                <label for="plan-name" class="overlay__form-label">Plan name</label>
                <input type="text" name="name" id="plan-name" class="overlay__form-input overlay__form-input--name" placeholder="Enter plan name" required>
              </div>

              <div class="overlay__form-group">
                <label for="plan-category" class="overlay__form-label">Category</label>
                <select name="category" id="plan-category" class="overlay__form-select overlay__form-select--type" required>
                  <option value="">Select category</option>
                  <option value="housing">Hosuing</option>
                  <option value="transportation">Transportation</option>
                  <option value="flight">Flight</option>
                  <option value="food">Food</option>
                  <option value="utilities">Utilities</option>
                  <option value="clothing">Clothing</option>
                  <option value="medical">Healthcare</option>
                  <option value="insurance">Insurance</option>
                  <option value="personal">Personal</option>
                  <option value="investment">Investment</option>
                  <option value="education">Education</option>
                  <option value="savings">Savings</option>
                  <option value="gift">Gift</option>
                  <option value="miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div class="overlay__form-group">
                <label for="plan-date" class="overlay__form-label">Select start date</label>
                <input type="date" name="date" id="plan-date" class="overlay__form-input overlay__form-input--date" min="${
                  this._getDate()[2]
                }-${this._getDate()[1]}-${this._getDate()[0]}" required>
              </div>

              <div class="overlay__form-group">
                <label for="plan-type" class="overlay__form-label">Budget type</label>
                <select name="type" id="plan-type" class="overlay__form-select overlay__form-select--type" required>
                  <option value="">Select budget type</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div class="overlay__form-group">
                <label for="plan-card" class="overlay__form-label">Select card</label>
                <select name="card" id="plan-card" class="overlay__form-select overlay__form-select--type" required>
                  <option value="">Card to debit</option>
                  ${cards.map((el) => this._generateMarkupCard(el)).join("")}
                </select>
              </div>

              <div class="overlay__form-group">
                <label for="plan-target" class="overlay__form-label">Target amount</label>
                <input type="number" name="target" id="plan-target" step="0.01" class="overlay__form-input overlay__form-input--amount" placeholder="Enter target amount" required>
              </div>

              <div class="overlay__form-group overlay__form-group--deposit">
                <label for="plan-deposit" class="overlay__form-label">Deposit amount</label>
                <input type="number" name="deposit" id="plan-deposit" step="0.01" class="overlay__form-input overlay__form-input--deposit" placeholder="Enter savings amount" required>
              </div>

              <button class="overlay__btn-form overlay__btn-form--create">Create Plan</button>
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
    const formElement = document.querySelector(".overlay__form--plan");
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

    setTimeout(() => {
      document.querySelector(".form__error-box").remove();
    }, 3000);
  }
}

export default new PlanCreationView();
