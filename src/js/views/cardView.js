import View from "./View.js";

class CardView extends View {
  _parentElement = document.querySelector(".main--card");
  _obj = {};

  constructor() {
    super();
    this._addHandlerHideWindow();
    this._addHandlerInput();
  }

  addHandlerRenderCardCreation(handler) {
    this._parentElement?.addEventListener("click", function (e) {
      const btn = e.target.classList.contains("showcase__create-btn");

      // Guard clause
      if (!btn) return;

      handler();
    });
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

  _addHandlerInput() {
    this._parentElement
      ?.closest(".content")
      .addEventListener("input", function (e) {
        // Card title
        if (e.target.classList.contains("overlay__form-input--title")) {
          // Get element
          const cardTitle = document
            .querySelector(".overlay")
            .querySelector(".card__name");

          // Set text content
          cardTitle.textContent = e.target.value
            ? e.target.value[0]?.toUpperCase() + e.target.value?.slice(1)
            : "Card Title";
        }

        // Name on card
        if (e.target.classList.contains("overlay__form-input--name")) {
          // Get element
          const cardHoldersName = document
            .querySelector(".overlay")
            .querySelector(".card__holder-name");

          // Set text content
          cardHoldersName.textContent = e.target?.value.toUpperCase();
        }
      });
  }

  _addHandlerSelectActive(e, className) {
    // Get parent container
    const container = e.target.closest(`.${className}`);

    // Get selected showcase tab
    const showcase = container.querySelector(".showcase--active");

    // Remove active class
    showcase?.classList.remove(`${className}--active`);

    // Add active class
    e.target.classList.add(`${className}--active`);
  }

  addHandlerRenderOverview(handler) {
    this._parentElement?.addEventListener("click", (e) => {
      const target = e.target.classList.contains("showcase__holder");

      // Guard clause
      if (!target) return;

      // Get card number
      const cardNumber = e.target.querySelector(".showcase__digit").textContent;

      // Select active element
      this._addHandlerSelectActive(e, "showcase");

      // Set goto tab
      const goToTab = "dt";

      handler(cardNumber, goToTab);
    });
  }

  update(data) {
    this._data = data;
    const showcase = this._parentElement.querySelector(".showcase");
    const markup = this._generateMarkupCardShowcase();

    if (showcase) showcase.remove();

    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  _generateMarkup() {
    return `
    ${this._generateMarkupCardShowcase()}
    ${this._generateMarkupCardOverview()}
    `;
  }

  _generateMarkupCardShowcase() {
    const card = this._data.account.card.recent;
    const cardActive = card.filter((el) => el.status);
    const cardInactive = card.filter((el) => !el.status);

    return `
      <div class="showcase">
        <div class="showcase__container showcase__container--active">
          
          ${cardActive.map((el) => this._generateMarkupShowcase(el)).join("")}

          ${
            card.length < 5
              ? `<button class="showcase__create-btn">Create new card</button>`
              : ""
          }
          
        </div>

        <div class="showcase__container showcase__container--inactive">
          ${cardInactive.map((el) => this._generateMarkupShowcase(el)).join("")}
        </div>
      </div>
    `;
  }

  _generateMarkupShowcase(data) {
    return `
      <div class="showcase__holder showcase__holder--${
        data.status ? "active" : "inactive"
      }">
        <div class="showcase__textbox">
          <h2 class="showcase__title showcase__title--${
            data.status ? "active" : "inactive"
          }">${data.title}</h2>
          <span class="showcase__status showcase__status--${
            data.status ? "active" : "inactive"
          }">
          ${data.status ? "active" : "inactive"}
          </span>
        </div>
        <div class="showcase__card ">
          <span class="showcase__digit">${data.number.slice(-4)} </span>
        </div>
      </div>
    `;
  }

  _generateMarkupCardOverview() {
    return `
      <div class="overview">
        <div class="overview__display">
          <p class="overview__text">SELECT A CARD</p>
        </div>
      </div>
    
    `;
  }

  _testy() {
    return `
      <div class="showcase__holder showcase__holder--active">
        <div class="showcase__textbox">
          <h2 class="showcase__title">Subscription</h2>
         <span class="showcase__status showcase__status--active">
           Active
         </span>
        </div>
        <div class="showcase__card showcase__card--subscription">
          <span class="showcase__digit">3546 </span>
        </div>
      </div>
    `;

    // <div class="showcase__holder showcase__holder--active">
    //   <div class="showcase__textbox">
    //     <h2 class="showcase__title">Shopping</h2>
    //     <span class="showcase__status showcase__status--active">Active</span>
    //   </div>
    //   <div class="showcase__card showcase__card--shopping">
    //     <span class="showcase__digit">3546 </span>
    //   </div>
    // </div>;

    // <div class="showcase__container showcase__container--inactive">
    //       <div class="showcase__holder showcase__holder--inactive">
    //         <div class="showcase__textbox">
    //           <h2 class="showcase__title showcase__title--inactive">
    //             Shopping
    //           </h2>
    //           <span class="showcase__status showcase__status--inactive">
    //             Inactive
    //           </span>
    //         </div>
    //         <div class="showcase__card">
    //           <span class="showcase__digit">3546 </span>
    //         </div>
    //       </div>
    //     </div>
  }
}

export default new CardView();
