import * as model from "./model/model.js";

import accountView from "./views/accountView.js";
import cardCreationView from "./views/cardCreationView.js";
import cardOverview from "./views/cardOverview.js";
import cardView from "./views/cardView.js";
import dashboardView from "./views/dashbaordView.js";
import asideView from "./views/asideView.js";
import headerView from "./views/headerView.js";
import planCreationView from "./views/planCreationView.js";
import planDetailsView from "./views/planDetailsView.js";
import planTableView from "./views/planTableView.js";
import planEditView from "./views/planUpdateView.js";
import planView from "./views/planView.js";
import settingsView from "./views/settingsView.js";
import signinView from "./views/signinView.js";
import signupView from "./views/signupView.js";
import transactionView from "./views/transactionView.js";
import transactionTableView from "./views/transactionTableView.js";
import transactionFooterView from "./views/transactionFooterView.js";
import transferView from "./views/transferView.js";
import cardPaymentView from "./views/cardPaymentView.js";
import transferDetailsView from "./views/transferDetailsView.js";
import exchangeView from "./views/exchangeView.js";
import cardTopUpView from "./views/cardTopUpView.js";
import cardDeletionView from "./views/cardDeletionView.js";
import settingsDetailsView from "./views/settingsDetailsView.js";
import transactionDetailsView from "./views/transactionDetailsView.js";
import accountAddFundsView from "./views/accountAddFundsView.js";

// if (module.hot) {
//   module.hot.accept();
// }

const controlProgress = function (selfObj) {
  // Show spinner
  selfObj.renderOverlaySpinner();

  // Show confirmation
  setTimeout(() => selfObj.renderConfirmationSpinner(), 3000);

  // Remove overlay
  setTimeout(() => selfObj.removeOverlay(), 4600);
};

const controlValidateUserId = function (userId, idType) {
  // Check if username / email exist d
  const id = model.fetchAccount(userId);

  // Render error if it exist
  if (id) signupView.renderError(idType);

  // Remove available error
  if (!id) signupView.removeError(idType);

  return id;
};

const controlValidatePassword = function (data) {
  // Add error class
  signupView.showcaseError();

  // Check if it contains number
  const hasNumber = /\d/;

  // Check if number exist
  if (hasNumber.test(data)) signupView.showcaseSuccess(null, true);

  // Check if length is greater/equal to 8
  if (data.length >= 8) signupView.showcaseSuccess(true, null);
};

const controlValidateConfirmPassword = function (
  confirmPassowrd,
  password,
  type
) {
  //Check if text are not the same and add error
  if (confirmPassowrd !== password) signupView.renderError(type);

  // Check if text are the same and remove error
  if (confirmPassowrd === password) {
    signupView.removeError(type);
    return true;
  }
};

const controlAuthenticateSingup = function (
  data,
  typeUser,
  typeEmail,
  typeConfirm
) {
  // Check username
  if (controlValidateUserId(data.username, typeUser))
    return signupView.renderError(typeUser);

  // Check email
  if (controlValidateUserId(data.email, typeEmail))
    return signupView.renderError(typeEmail);

  // Check that password matches
  if (
    !controlValidateConfirmPassword(
      data["confirm-password"],
      data.password,
      typeConfirm
    )
  )
    return signupView.renderError(typeConfirm);

  // Create account
  model.addAccount(data);

  // Redirect to another page
  location.replace("dashboard");
};

const controlAuthenticateSignin = function (data) {
  // Check login details
  const account = model.state.accounts.find(
    (acc) => acc.username === data.login || acc.email === data.login
  );

  // Render error for wrong details
  if (!account || account.password !== data.password)
    return signinView.renderError();

  // Update Account to state
  model.setAccount(data);

  // Redirect to dashboard
  location.replace("dashboard");
};

const controlSignOut = function () {
  // Redirect to another page
  location.replace("/");

  // Clear storage
  model.clearSession();
};

const controlCurrencyConversion = async function (
  curAmount,
  curCurrency,
  newCurrency
) {
  // Get new amount
  const newAmount = await model.getConverstion(
    curAmount,
    curCurrency,
    newCurrency
  );

  // Render exchange
  exchangeView.update(newAmount, null);
};

const controlCurrencyChange = async function (curCurrency, newCurrency) {
  // Get rate
  const rate = await model.getRate(curCurrency, newCurrency);

  // Render exchange
  exchangeView.update(null, rate);
};

const controlQuickTransfer = function (transferData) {
  // Set transfer details on session storage
  model.updateQuickTransfer(transferData);

  // Display transfer page
  location.assign("transfer");
};

const controlAccountFunding = function () {
  // Render account add funds view
  accountAddFundsView.render(model.state.user);
};

const controlAddFunds = function (transaction, selfObj) {
  // Check if transaction is empty or void
  if (transaction.name === " " || transaction.amount === " ") return;

  // Save transaction
  model.savePayment(transaction);

  // Showing spinner & confirmation
  controlProgress(selfObj);

  // Update the account view
  setTimeout(() => accountView.render(model.state.user), 4600);
};

const controlCardTopup = function () {
  // Render card topup view
  cardTopUpView.render(model.state.user);
};

const controlCardFunding = function (fundingData, selfObj) {
  // Save transaction
  model.savePayment(fundingData);

  // Showing spinner & confirmation
  controlProgress(selfObj);

  // Update the card view
  setTimeout(() => accountView.render(model.state.user), 4600);
};

const controlOverview = function (cardNum, goToTab) {
  // Render card overview
  cardOverview.render(model.state.user, goToTab, cardNum);
};

const controlCreation = function () {
  // Render card creation
  cardCreationView.render(model.state.user);
};

const controlCardCreation = function (goToPage, cardData, selfObj) {
  // Render next page for card creation
  if (goToPage !== "cd" && !cardData)
    cardCreationView.render(model.state.user, goToPage);

  // Create card
  if (goToPage === "cd" && cardData) {
    // Create card
    model.addCard(cardData);

    // Save transaction
    model.savePayment(cardData);

    // Showing spinner & confirmation
    controlProgress(selfObj);

    // Remove overlay
    setTimeout(() => selfObj.removeOverlay(), 4600);

    // Update the card view
    setTimeout(() => cardView.update(model.state.user), 4600);
  }
};

const controlTab = function (goToTab, value, active) {
  // Card
  if (active === "card") cardOverview.render(model.state.user, goToTab, value);

  // Transactions
  if (value === "transactions") {
    transactionTableView.render(
      model.getResult(model.state.results, 1, goToTab, active)
    );
    transactionFooterView.render(
      model.state,
      model.getResult(model.state.results, 1, goToTab, active)
    );
  }

  // Plan
  if (value === "plan") planTableView.render(model.state.user, goToTab, active);

  // Settings
  if (value === "settings") settingsView.update(model.state.user, goToTab);
};

const controlUpdateCard = function (cardData, goToTab, cardNum) {
  // Update Card
  model.updateCard(cardData);

  // Re render card and card overview
  cardView.render(model.state.user);
  cardOverview.render(model.state.user, goToTab, cardNum);
};

const controlPayment = function (cardNum) {
  // Render card payment
  cardPaymentView.render(model.state.user, cardNum);
};

const controlCardPayment = function (payment, selfObj) {
  // Save transaction
  model.savePayment(payment);

  // Showing spinner & confirmation
  controlProgress(selfObj);

  // Update the plan view
  setTimeout(() => cardView.render(model.state.user), 4600);
};

const controlCardDeletion = function (cardDetails, cardBalance) {
  // Render card deletion view
  cardDeletionView.render(cardDetails, cardBalance);
};

const controlDelete = function (id, confirmation, type, transactData, selfObj) {
  const view =
    type === "card" ? cardView : type === "plan" ? planView : settingsView;

  // Transaction for card/plan when deleting
  if (transactData && confirmation === "yes") model.savePayment(transactData);

  if (confirmation === "yes") {
    model.deleteObj(id, type);

    // Showing spinner & confirmation
    controlProgress(selfObj);

    // Update the view
    setTimeout(() => {
      // Settings
      if (type === "recipients") return view.update(model.state.user, "bc");

      // Card / plan
      if (type !== "recipients") return view.render(model.state.user);
    }, 4600);
  }

  if (confirmation === "no") {
    // Remove overlay
    selfObj.removeOverlay();

    // Re render view
    // Settings
    if (type === "recipients") return view.update(model.state.user, "bc");

    // Card / plan
    if (type !== "recipients") return view.render(model.state.user);
  }
};

const controlRecipient = function (transferData) {
  // Fetch recipient
  const recipeint = model.fetchUser(transferData);

  // Render transfer recipient details view
  transferDetailsView.render(model.state.user, recipeint, transferData);
};

const controlTransfer = function (recipientData, selfObj) {
  // Recipient data is true
  if (recipientData) {
    // Save payment
    const transactionData = model.transferFunds(recipientData);

    // Create beneficiary
    if (recipientData && !model.checkRecipients(recipientData))
      model.addBeneficiary(recipientData);

    // Showing spinner & confirmation
    controlProgress(selfObj);

    // Update the transfer view
    setTimeout(
      () =>
        transferView.render({
          data: model.state.user,
          users: model.activeUsers(),
          transferData: model.getQuickTransferDetails(),
          transactionData,
        }),
      4600
    );
  }

  // No ecipient data
  if (!recipientData)
    // Remove overlay
    selfObj.removeOverlay();

  // Render transfer view
  transferView.render({
    data: model.state.user,
    users: model.activeUsers(),
    transferData: model.getQuickTransferDetails(),
  });
};

const controlOrder = function (order, value, query) {
  // Plans
  if (value === "plan") planTableView.update(model.state.user, order);

  // Transactions
  if (value === "transactions" && !model.state.num)
    transactionTableView.render(
      model.getResult(
        model.state.results,
        model.state.page,
        model.state.num,
        order
      )
    );

  // Transactions with search query
  if (value === "transactions" && query)
    transactionTableView.update(
      model.getSearchResult(
        model.state.results,
        model.state.page,
        query,
        model.state.num,
        order
      )
    );

  // Transactions with filtered result
  if (value === "transactions" && model.state.num) {
    transactionTableView.render(
      model.getResult(
        model.state.results,
        model.state.page,
        model.state.num,
        order
      )
    );
  }
};

const controlSearch = function (query, order, entry) {
  // No active card while searching
  if (!model.state.num) {
    transactionTableView.update(
      model.getSearchResult(entry, 1, query, model.state.num, order)
    );
    transactionFooterView.render(
      model.state,
      model.getSearchResult(entry, 1, query, model.state.num, order)
    );
  }

  // Active card while searching
  if (model.state.num) {
    transactionTableView.update(
      model.getSearchResult(entry, 1, query, model.state.num, order)
    );
    transactionFooterView.render(
      model.state,
      model.getSearchResult(entry, 1, query, model.state.num, order)
    );
  }
};

const controlReceipt = function (id, type) {
  // Get transaction
  const transactionData = model.getTransaction(id, type);

  // Render receipt
  transactionDetailsView.render({ data: model.state.user, transactionData });
};

const controlPagination = function (page, orderValue) {
  // Search query and active card does not exist
  if (!model.state.query && !model.state.num) {
    transactionTableView.render(
      model.getResult(model.state.results, page, model.state.num, orderValue)
    );
    transactionFooterView.render(
      model.state,
      model.getResult(model.state.results, page, model.state.num, orderValue)
    );
  }

  // Search query exist
  if (model.state.query) {
    transactionTableView.render(
      model.getSearchResult(
        model.state.results,
        page,
        model.state.query,
        model.state.num,
        orderValue
      )
    );
    transactionFooterView.render(
      model.state,
      model.getSearchResult(
        model.state.results,
        page,
        model.state.query,
        model.state.num,
        orderValue
      )
    );
  }

  // Active card exist
  if (model.state.num) {
    transactionTableView.render(
      model.getResult(model.state.results, page, model.state.num, orderValue)
    );
    transactionFooterView.render(
      model.state,
      model.getResult(model.state.results, page, model.state.num, orderValue)
    );
  }
};

const controlEntryCount = function (entryCount, orderValue) {
  // Active card and search query do not exist
  if (!model.state.num && !model.state.query) {
    transactionTableView.render(
      model.getResult(
        entryCount,
        (model.state.page = 1),
        model.state.num,
        orderValue
      )
    );
    transactionFooterView.render(
      model.state,
      model.getResult(
        entryCount,
        (model.state.page = 1),
        model.state.num,
        orderValue
      )
    );
  }

  // Search query exist
  if (model.state.query) {
    transactionTableView.render(
      model.getSearchResult(
        entryCount,
        model.state.page,
        model.state.query,
        model.state.num,
        orderValue
      )
    );
    transactionFooterView.render(
      model.state,
      model.getSearchResult(
        entryCount,
        model.state.page,
        model.state.query,
        model.state.num,
        orderValue
      )
    );
  }

  // Active card exist
  if (model.state.num) {
    transactionTableView.render(
      model.getResult(entryCount, model.state.page, model.state.num, orderValue)
    );
    transactionFooterView.render(
      model.state,
      model.getResult(entryCount, model.state.page, model.state.num, orderValue)
    );
  }
};

// PLAN
const controlNewPlan = function () {
  // Render plan creation view
  planCreationView.render(model.state.user);
};

const controlPlanDetails = function (id) {
  // Render plan details view
  planDetailsView.render({ data: model.state.user, id });
};

const controlPlanDeposit = function (plan, time) {
  // Save transaction
  model.evaluatePayment(plan, time);

  // Re render plan view
  planView.render(model.state.user);
};

const controlPlanCreation = function (planData, selfObj) {
  // Create plan
  const newPlan = model.addPlan(planData);

  // Review plan
  model.reviewPlan(newPlan);

  // Showing spinner & confirmation
  controlProgress(selfObj);

  // Update the plan view
  setTimeout(() => planView.render(model.state.user), 4600);
};

const controlEditPlan = function (goToPage, id) {
  // Render plan edit view
  planEditView.render(model.state.user, goToPage, id);
};

const controlUpdatePlan = function (id, updatedData, selfObj, plan) {
  // Edit plan
  if (!updatedData.makeDeposit) {
    // Update plan
    model.updatePlan(updatedData);

    // Pending payment
    if (plan)
      // Review plan
      model.reviewPlan(plan);
  }

  // Make deposit
  if (updatedData.makeDeposit) model.evaluatePayment(updatedData);

  // Showing spinner & confirmation
  controlProgress(selfObj);

  // Update the plan view
  setTimeout(() => {
    planView.render(model.state.user);
    planDetailsView.render({ data: model.state.user, id });
  }, 4600);
};

const controlPlanWithdrawal = function (id, planData, selfObj) {
  // Save transaction
  model.savePayment(planData);

  // Update withdrawal status
  model.updatePlan(planData);

  // Showing spinner & confirmation
  controlProgress(selfObj);

  // Update the plan view
  setTimeout(() => {
    // planTableView.render(model.state.user, goToTab, active);
    planDetailsView.render({ data: model.state.user, id });
  }, 4600);
};

const controlDeactivation = function (id, confirmation, selfObj) {
  if (confirmation === "yes") {
    model.deactivate(id);

    // Showing spinner & confirmation
    controlProgress(selfObj);

    // Update the plan view
    setTimeout(() => planView.render(model.state.user), 4600);
  }

  if (confirmation === "no") {
    // Remove overlay
    selfObj.removeOverlay();

    // Re render plan view
    planView.render(model.state.user);
  }
};

const controlUpdateUser = function (userData) {
  // Update user
  model.updateUser(userData);
};

const controlConfirmRemoval = function (fullname, username) {
  // Render settings details view
  settingsDetailsView.render(model.state.user, fullname, username);
};

const controlDeleteAccount = function (confirmation, selfObj) {
  if (confirmation === "yes") {
    // Showing spinner & confirmation
    controlProgress(selfObj);

    setTimeout(() => {
      // Delete account
      model.deleteAccountObj();

      // Signout
      controlSignOut();
    }, 4500);
  }

  if (confirmation === "no") {
    // Remove overlay
    selfObj.removeOverlay();

    // Re render settings view
    settingsView.update(model.state.user, "da");
  }
};

const router = async function () {
  // Get route
  const route = location.pathname;

  // Render header
  if (route !== "/signup" && route !== "/" && route !== "/index.html") {
    headerView.render({ data: model.state.user, path: model.state.path });
  }

  //Empty transfer data
  if (route !== "/transfer" && route !== "/transfer.html")
    model.updateQuickTransfer(null);

  switch (route) {
    case "/dashboard":
    case "/dashboard.html":
      try {
        await model.getCurrencies();
      } catch (error) {
        e.log("error", Error);
      }
      dashboardView.render({
        user: model.state.user,
        config: model.state.config,
      });
      model.getAllTransactions();
      dashboardView.renderChart();
      exchangeView.getData(model.state.currencies, model.state.rate);
      asideView.render(model.state.user);
      break;
    case "/account":
      accountView.render(model.state.user);
      break;
    case "/cards":
      cardView.render(model.state.user);
      break;
    case "/transfer":
    case "/transfer.html":
      transferView.render({
        data: model.state.user,
        users: model.activeUsers(),
        transferData: model.getQuickTransferDetails(),
      });
      break;
    case "/transactions":
      transactionView.render(model.state);
      transactionTableView.render(model.getResult());
      break;
    case "/plans":
      planView.render(model.state.user);
      break;
    case "/settings":
      settingsView.render(model.state.user);
      break;
  }
};

const init = async function () {
  router();
  // Get route
  const route = location.pathname;

  if (route.includes("/signup") || route === "/" || route.includes("/index")) {
    signupView.addHandlerCheckUsername(controlValidateUserId);
    signupView.addHandlerCheckEmail(controlValidateUserId);
    signupView.addHandlerSignup(controlAuthenticateSingup);
    signupView.addHandlerCheckPassword(controlValidatePassword);
    signupView.addHandlerCheckConfirmPassword(controlValidateConfirmPassword);
    signinView.addHandlerAuthenticate(controlAuthenticateSignin);
  }

  // Dashboard
  dashboardView.addHandlerHighlight();
  dashboardView.addHandlerLogout(controlSignOut);

  if (route.includes("/dashboard")) {
    exchangeView.addHandlerCurrencyConverter(controlCurrencyConversion);
    exchangeView.addHandlerCurrencyChange(controlCurrencyChange);
    exchangeView.addHandlerCurrencySwap(controlCurrencyChange);
    asideView.addHandlerQuickTransfer(controlQuickTransfer);
  }

  // Account
  if (route.includes("/account")) {
    accountView.addHandlerRenderAddFunds(controlAccountFunding);
    accountAddFundsView.addHandlerFundAccount(controlAddFunds);
    accountView.addHandlerRenderTopup(controlCardTopup);
    accountView.addHandlerRenderReceipt(controlReceipt);
    cardTopUpView.addHandlerTopUpCard(controlCardFunding);
  }

  // Card
  if (route.includes("/cards")) {
    cardView.addHandlerRenderOverview(controlOverview);
    cardView.addHandlerRenderCardCreation(controlCreation);
    cardCreationView.addHandlerCardCreation(controlCardCreation);
    cardCreationView.addHandlerBackClick(controlCardCreation);
    cardOverview.addHandlerRenderTab(controlTab);
    cardOverview.addHandlerUpdateCardLimit(controlUpdateCard);
    cardOverview.addHandlerUpdateCard(controlUpdateCard);
    cardOverview.addHandlerRenderCardPayment(controlPayment);
    cardPaymentView.addHandlerMakePayment(controlCardPayment);
    cardOverview.addHandlerRenderCardDeletion(controlCardDeletion);
    cardDeletionView.addHandlerDeleteCard(controlDelete);
  }

  // Transfer
  if (route.includes("/transfer")) {
    transferView.addHandlerRenderRecipient(controlRecipient);
    transferDetailsView.addHandlerTransferFunds(controlTransfer);
  }

  // Transaction
  if (route.includes("/transactions")) {
    transactionView.addHandlerRenderTab(controlTab);
    transactionView.addHandlerChangeOrder(controlOrder);
    transactionView.addHandlerSearch(controlSearch);
    transactionView.addHandlerRenderReceipt(controlReceipt);
    transactionView.addHandlerClick(controlPagination);
    transactionView.addHandlerCount(controlEntryCount);
  }

  // Plan
  if (route.includes("/plans")) {
    planView.addHandlerRenderCreatePlan(controlNewPlan);
    planView.addHandlerRenderTab(controlTab);
    planView.addHandlerChangeOrder(controlOrder);
    planView.addHandlerRenderDetails(controlPlanDetails);
    planView.addHandlerUpdateDeposit(controlPlanDeposit);
    planCreationView.addHandlerCreatePlan(controlPlanCreation);
    planDetailsView.addHandlerRenderEdit(controlEditPlan);
    planEditView.addHandlerEditPlan(controlUpdatePlan);
    planEditView.addHandlerMakeDeposit(controlUpdatePlan);
    planEditView.addHandlerPlanWithdrawal(controlPlanWithdrawal);
    planEditView.addHandlerDeactivate(controlDeactivation);
    planEditView.addHandlerDeletePlan(controlDelete);
  }

  // Settings
  if (route.includes("/settings")) {
    settingsView.addHandlerRenderTab(controlTab);
    settingsView.addHandlerUpdateProfile(controlUpdateUser);
    settingsView.addHandlerRenderBeneficiaryRemoval(controlConfirmRemoval);
    settingsView.addHandlerRenderAccountRemoval(controlConfirmRemoval);
    settingsDetailsView.addHandlerDeleteBeneficiary(controlDelete);
    settingsDetailsView.addHandlerDeleteAccount(controlDeleteAccount);
  }
};
init();
