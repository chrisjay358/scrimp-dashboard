import View from "./View";

class SettingsDetailsView extends View {
  _parentElement = document.querySelector(".content");

  addHandlerDeleteBeneficiary(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      // Check for element
      const form = e.target.classList.contains(
        "overview__form-beneficiary--deletion"
      );

      // Message
      this._processingMessage = "Deleting beneficiary";
      this._confirmationMessage = "Deleted";

      // Guard clause
      if (!form) return;

      // Get text content
      const btnText = e.submitter.textContent.toLowerCase();

      // Set type
      const type = "recipients";

      handler(this._username, btnText, type, null, this);
    });
  }

  addHandlerDeleteAccount(handler) {
    this._parentElement?.addEventListener("submit", (e) => {
      e.preventDefault();
      // Check for element
      const form = e.target.classList.contains(
        "overview__form-account--deletion"
      );

      // Message
      this._processingMessage = "Deleting Account";
      this._confirmationMessage = "Deleted";

      // Guard clause
      if (!form) return;

      // Get text content
      const btnText = e.submitter.textContent.toLowerCase();

      // Set type
      const type = "accounts";

      handler(btnText, this);
    });
  }

  render(data, fullname, username) {
    this._data = data;
    this._fullname = fullname;
    this._username = username;

    const overlay = document.querySelector(".overlay");

    const markup =
      this._data.username === this._username
        ? this._generateMarkupAccount()
        : this._generateMarkupBeneficiary();

    if (overlay) overlay.remove();

    this._parentElement.insertAdjacentHTML("beforeend", markup);
  }

  _generateMarkupBeneficiary() {
    return `
      <div class="overlay">
        <div class="overlay__beneficiary overlay__beneficiary--confirm">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">Delete Beneficiary</h2>
            </header>

            <form class="overlay__form overview__form-beneficiary--deletion">
              <p class="overlay__message margin-bottom-sm">
                Are you sure you want to delete ${this._fullname} from your beneficiaries?
              </p>

              <div class="overlay__btn-group">
              <button class="overlay__btn-form overlay__btn-form--yes">Yes</button>
              <button class="overlay__btn-form overlay__btn-form--no">No</button>
              </div>
            </form>
          </div>
        </div>
      </div>
  `;
  }

  _generateMarkupAccount() {
    return `
      <div class="overlay">
        <div class="overlay__beneficiary overlay__beneficiary--confirm">
          <button class="overlay__btn-close">x</button>
          <div class="overlay__content">
            <header class="overlay__header">
              <h2 class="overlay__heading">Delete Beneficiary</h2>
            </header>

            <form class="overlay__form overview__form-account--deletion">
              <p class="overlay__message margin-bottom-sm">
                Are you sure you want to delete your account ${this._fullname}?
              </p>

              <div class="overlay__btn-group">
                <button class="overlay__btn-form overlay__btn-form--yes">Yes</button>
                <button class="overlay__btn-form overlay__btn-form--no">No</button>
              </div>
            </form>
          </div>
        </div>
      </div>
  `;
  }
}

export default new SettingsDetailsView();
