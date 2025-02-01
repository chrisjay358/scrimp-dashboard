import View from "./View";

class HeaderView extends View {
  _parentElement = document.querySelector(".header");

  _generateMarkup() {
    const { data } = this._data;

    if (this._parentElement)
      return `
      <div class="header__content">
        ${this._generateTitleMarkup()}
      
        <figure class="user">
          <div class="user__img">
            <div class="user__initials">${data.firstname[0]}${
        data.lastname[0]
      }</div>
          </div>
          <figcaption class="user__details">
          <p class="user__name">${data.firstname} ${data.lastname}</p>
          </figcaption>
        </figure>
      </div>
    `;
  }

  _generateTitleMarkup() {
    const { path } = this._data;
    const { data } = this._data;

    const getPath = path.split(".").at(0).slice(1);
    const title = getPath.replace(getPath[0], getPath[0].toUpperCase());

    if (this._data.path === "/dashboard.html") {
      return `
      <div class="welcome"> 
        <h1 class="header-title">Overview</h1>
        <p class="welcome__message">Welcome back ${data.firstname}</p>
      </div>
      `;
    } else {
      return `
      <h1 class="header-title">${title}</h1>
      `;
    }
  }
}

export default new HeaderView();
