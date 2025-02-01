import { formatCurrency } from "../helpers";
import View from "./View";

class TransferDetailsView extends View {
  _parentElement = document.querySelector(".content");
  _processingMessage = "Transferring";
  _confirmationMessage = "Transferred";

  addHandlerTransferFunds(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      e.preventDefault();
      // Check for element
      const form = e.target.classList.contains("overlay__form--transfer");
      // Guard clause
      if (!form) return;

      // Get content (Yes/No)
      const submitter = e.submitter.textContent.toLowerCase();

      // Get firstname
      const firstName =
        this._data.firstname[0].toUpperCase() + this._data.firstname.slice(1);

      // Get lastname
      const lastName =
        this._data.lastname[0].toUpperCase() + this._data.lastname.slice(1);

      // Add receiver's name
      this._transferData.receiver = this._recipient;

      // Add senders's name
      this._transferData.sender = `${firstName} ${lastName}`;

      if (submitter === "confrim") handler(this._transferData, this);
      if (submitter === "cancel") handler(null);
    });
  }

  render(data, fullName, transferData) {
    this._data = data;
    this._recipient = fullName;
    this._transferData = transferData;

    const overlay = document.querySelector(".overlay");

    const markup = this._generateMarkup();
    if (overlay) overlay.remove();

    this._parentElement.insertAdjacentHTML("beforeend", markup);
  }

  _generateMarkup() {
    return `
      <div class="overlay">
        <div class="overlay__transfer">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">Confirm recipient's details</h2>
            </header>
        
            <form class="overlay__form overlay__form--transfer">
              <div class="overlay__form-group">
                <label for="recipient-name" class="overlay__form-label">Recipient's name</label>
                <input type="text" name="name" id="recipient-name" class="overlay__form-input overlay__form-input--transfer" value="${
                  this._recipient
                }" disabled readonly>
              </div>

              <div class="overlay__form-group">
                <label for="recipient-username" class="overlay__form-label">Username</label>
                <input type="text" name="username" id="recipient-username" class="overlay__form-input overlay__form-input--transfer" value="${
                  this._transferData.username
                }" disabled readonly>
              </div>

              <div class="overlay__form-group">
                <label for="recipient-amount" class="overlay__form-label">Amount</label>
                <input type="text" name="amount" id="recipient-amount" class="overlay__form-input overlay__form-input--transfer" value="${formatCurrency(
                  +this._transferData.transferAmount,
                  "NGN"
                )}" disabled readonly>
              </div>

              <div class="overlay__btn-group">
                <button class="overlay__btn-form overlay__btn-form--cancel">Cancel</button>
                <button class="overlay__btn-form overlay__btn-form--confrim">Confrim</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }
}

export default new TransferDetailsView();
