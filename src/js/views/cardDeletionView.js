import View from "./View";

class CardDeletionView extends View {
  _parentElement = document.querySelector(".content");
  _processingMessage = "Deleting card";
  _confirmationMessage = "Deleted";

  addHandlerDeleteCard(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      const form = e.target.classList.contains("overview__form-card--deletion");

      // Get btn content
      const btnText = e.submitter.textContent.toLowerCase();

      // Guard clause
      if (!form) return;

      // Get transaction object
      const transaction = this._getTransaction();

      handler(this._cardNum, btnText, "card", transaction, this);
    });
  }

  _getTransaction() {
    return {
      name: `${this._data.title} - Card deletion`,
      refundAmount: this._cardBalance,
    };
  }

  render(cardDetails, cardBalance) {
    this._data = cardDetails;
    this._cardBalance = cardBalance;

    const overlay = document.querySelector(".overlay");

    const markup = this._generateMarkup();

    if (overlay) overlay.remove();

    this._parentElement.insertAdjacentHTML("beforeend", markup);
  }

  _generateMarkups() {
    return `
      <div class="overlay">
        <div class="overlay__card overlay__card--creation">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">Create A New Card</h2>
            </header>
            <form class="overlay__form overlay__form--card-creation">
              <div class="overlay__form-group margin-bottom-md">
                <label for="card-type" class="overlay__form-label">Choose card type</label>
                <select name="cardType" id="card-type" class="overlay__form-select overlay__form-select--type" required>
                  <option value="">Please select a type</option>
                  <option value="Virtual">Virtual</option>
                </select>
              </div>
              <div class="overlay__btn-group">
                <button class="overlay__btn-form overlay__btn-form--next" data-form="cc">Continue</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  _generateMarkup() {
    return `
      <div class="overlay">
        <div class="overlay__plan overlay__card--confirm">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">Delete card</h2>
            </header>

            <form class="overlay__form overview__form-card--deletion">
              <p class="overlay__message margin-bottom-sm">Are you sure you want to delete ${this._data.title} card?</p>

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
}

export default new CardDeletionView();
