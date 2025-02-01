import { data, config, checkDate, getNextDate } from "../helpers";

import {
  createAccountObject,
  createCardObj,
  createPlanObj,
  createRecipientObj,
} from "./createObjModel";

import {
  createAccountTransactionObj,
  createCardTransactionObj,
  createPlanTransactionObj,
} from "./createTransactionModel";

const accounts = [];

export const state = {
  config,
  path: location.pathname,
  user: {},
  accounts,
  page: 1,
  results: 10,
  query: "",
};

///////////////////////////////////////////////////////////
// STORAGE
///////////////////////////////////////////////////////////

const addToStorage = function () {
  localStorage.setItem("accounts", JSON.stringify(state.accounts));
};

const updateStorage = function () {
  sessionStorage.setItem("clue", JSON.stringify(state.user));
};

export const clearSession = function () {
  sessionStorage.clear();
};

///////////////////////////////////////////////////////////
// REUSABLE
///////////////////////////////////////////////////////////

const checkTotalDeposit = function (data) {
  // Fetch user index in accounts
  const accIndex = fetchIndex(state.user);

  // Fetch plan index in account
  const objIndex = state.accounts[accIndex].account.plan.recent.findIndex(
    (plan) => plan.id === data.id
  );

  // Get total deposit of plan
  const transactHistory = state.accounts[
    accIndex
  ].account.transactions.plan.recent.filter((el) => el.num === data.id);

  const totalDeposit = transactHistory.reduce(
    (acc, num) => acc + +num.amount,
    0
  );

  // Total deposit is equal to target amount
  if (totalDeposit === +data.target) {
    // Set completed to true
    state.accounts[accIndex].account.plan.recent[objIndex].completed = true;

    // Set active to false
    state.accounts[accIndex].account.plan.recent[objIndex].active = false;

    // Set pending payment to false
    state.accounts[accIndex].account.plan.recent[objIndex].active = "";

    // Update active user
    state.user = fetchAccount(state.user);

    // Save to Local storage
    addToStorage();

    // Save to session storage
    updateStorage();

    return true;
  }
};

const getTransactionMonth = function () {
  const bankMonth = state.user.account.transactions.bank.recent.map(
    (el) => el.month
  );

  const cardMonth = state.user.account.transactions.card.recent.map(
    (el) => el.month
  );

  const totalMonth = [...new Set(bankMonth, cardMonth)];

  return (data.labels = totalMonth);
};

const getTotalCredit = function () {
  const bank = state.user.account.transactions.bank.recent;

  const total = data.labels.map((el) => {
    return bank
      .filter((ele) => ele.month === el)
      .reduce((acc, el) => acc + +el.amount, 0);
  });

  return (data.datasets[0].data = total);
};

const getTotalDebit = function () {
  const card = state.user.account.transactions.card.recent.filter(
    (el) => el.description || el.payment
  );

  const total = data.labels.map((el) => {
    return card
      .filter((ele) => ele.month === el)
      .reduce((acc, el) => acc + +el.amount, 0);
  });

  return (data.datasets[1].data = total);
};

export const deleteObj = function (id, type) {
  // Fetch user index in accounts
  const userIndex = fetchIndex(state.user);

  // Fetch obj index in user
  let objIndex;

  objIndex = state.accounts[userIndex].account[type].recent.findIndex(
    (obj) =>
      obj.username?.endsWith(id) ||
      obj.number?.endsWith(id) ||
      obj.id?.endsWith(id)
  );

  // Remove obj
  state.accounts[userIndex].account[type].recent.splice(objIndex, 1);

  // Update active user
  state.user = fetchAccount(state.user);

  // Save to Local storage
  addToStorage();

  // Save to session storage
  updateStorage();
};

export const deleteAccountObj = function () {
  // Fetch user index in accounts
  const userIndex = fetchIndex(state.user);

  // Remove
  state.accounts.splice(userIndex, 1);

  // Save to Local storage
  addToStorage();
};

export const savePayment = function (data, newDeposit) {
  // Initialize variables
  let accountObj, cardObj, planObj;

  // Create transaction obj
  if (Object.keys(data).length < 3) {
    accountObj = createAccountTransactionObj(data);
  }

  if (Object.keys(data).length > 3 && data.fundingAmount) {
    accountObj = createAccountTransactionObj(data);
    cardObj = createCardTransactionObj(data, null, state);
  }

  if (data.recipient && !data.withdrawal) {
    cardObj = createCardTransactionObj(data, null, state);
  }

  if (data.startDate || data.withdrawal) {
    planObj = createPlanTransactionObj(data, newDeposit);
    cardObj = createCardTransactionObj(data, newDeposit, state);
  }

  // Fetch user index in accounts
  const userIndex = fetchIndex(state.user);

  // Push payment to user transactions
  if (accountObj)
    state.accounts[userIndex].account.transactions.bank.recent.push(accountObj);

  if (cardObj)
    state.accounts[userIndex].account.transactions.card.recent.push(cardObj);

  if (planObj)
    state.accounts[userIndex].account.transactions.plan.recent.push(planObj);

  // Update active user
  state.user = fetchAccount(state.user);

  // Save to Local storage
  addToStorage();

  // Save to session storage
  updateStorage();
};

///////////////////////////////////////////////////////////

export const fetchAccount = function (data) {
  // Check login details
  return state.accounts.find(
    (acc) =>
      acc.username === data.username ||
      acc.email === data.email ||
      acc.username === data.login ||
      acc.username === data ||
      acc.email === data
  );
};

const fetchIndex = function (data, index) {
  if (data.username || data.email)
    return state.accounts.findIndex(
      (acc) => acc.username === data.username || acc.email === data.email
    );
  if (data.number || data.card)
    return state.accounts[index].account.card.recent.findIndex((card) =>
      card.number.endsWith(+data.number)
    );
};

export const addAccount = function (data) {
  // Add account
  state.accounts.push(createAccountObject(data));

  // Set active account
  state.user = fetchAccount(data);

  // Save to Local storage
  addToStorage();

  // Save to session storage
  updateStorage();
};

export const setAccount = function (data) {
  // Set active account
  state.user = fetchAccount(data);

  // Save to session storage
  updateStorage();
};

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////
// DASHBOARD
///////////////////////////////////////////////////////////

export const getCurrencies = async function () {
  try {
    const rate = fetch(
      "https://api.currencybeacon.com/v1/latest?api_key=KAlDj59l9unlU2Dl5JUH9YtTnvlaec36"
    );

    const currencies = fetch(
      "https://api.currencybeacon.com/v1/currencies?api_key=KAlDj59l9unlU2Dl5JUH9YtTnvlaec36&currencies=NGN"
    );

    const [currencyRes, rateRes] = await Promise.all([currencies, rate]);

    const currencyData = await currencyRes.json();
    const rateData = await rateRes.json();

    if (!currencyRes.ok || !rateRes.ok) throw new Error("Yawa Gas");

    state.currencies = currencyData.response;
    state.rate = rateData.rates.NGN.toFixed(2);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getConverstion = async function (
  curAmount,
  curCurrency,
  newCurrency
) {
  try {
    const res = await fetch(
      `https://api.currencybeacon.com/v1/convert?api_key=KAlDj59l9unlU2Dl5JUH9YtTnvlaec36&from=${curCurrency}&to=${newCurrency}&amount=${curAmount}`
    );
    const data = await res.json();

    if (!res.ok) throw new Error("Error converting, try again later");
    return data.value;
  } catch (error) {
    throw error;
  }
};

export const getRate = async function (curCurrency, newCurrency) {
  try {
    const res = await fetch(
      `https://api.currencybeacon.com/v1/latest?api_key=KAlDj59l9unlU2Dl5JUH9YtTnvlaec36&base=${curCurrency}&symbols=${newCurrency}`
    );

    const data = await res.json();

    if (!res.ok) throw new Error("Cannot get rate right now");
    return data.rates[newCurrency].toFixed(2);
  } catch (error) {
    throw error;
  }
};

export const updateQuickTransfer = function (transferData) {
  // Set quick transfer property
  state.user.quickTransfer = transferData;

  // Save to session storage
  // Check if state.user's length is mor than one so when you log out quick transfer details will not persist
  if (Object.keys(state.user).length > 1) updateStorage();
};

///////////////////////////////////////////////////////////
// CARD
///////////////////////////////////////////////////////////

export const addCard = function (data) {
  // Create card object
  const cardObj = createCardObj(data);

  // Fetch user index in accounts
  const userIndex = fetchIndex(state.user);

  // Push card to user profile
  state.accounts[userIndex].account.card.recent.push(cardObj);

  // Update active user
  state.user = fetchAccount(state.user);

  // Save to Local storage
  addToStorage();

  // Save to session storage
  updateStorage();
};

export const updateCard = function (data) {
  // Fetch user index in accounts
  const accIndex = fetchIndex(state.user);

  // Fetch card index in user
  const cardIndex = fetchIndex(data, accIndex);

  // Update user card infromation
  if (data.monthly) {
    state.accounts[accIndex].account.card.recent[cardIndex].limit.deposit =
      +data.deposit;
    state.accounts[accIndex].account.card.recent[cardIndex].limit.monthly =
      +data.monthly;
  }

  if (data.title) {
    state.accounts[accIndex].account.card.recent[cardIndex].name = data.name;
    state.accounts[accIndex].account.card.recent[cardIndex].title = data.title;
    state.accounts[accIndex].account.card.recent[cardIndex].status =
      data.status;
  }

  // Update active user
  state.user = fetchAccount(state.user);

  // Save to Local storage
  addToStorage();

  // // Save to session storage
  updateStorage();
};

//////////////////////////////////////////////////////////
// TRANSFER
//////////////////////////////////////////////////////////

export const fetchUser = function (data) {
  // Get account
  const account = fetchAccount(data);

  // Get firstname
  const firstName =
    account.firstname[0].toUpperCase() + account.firstname.slice(1);

  // Get lastname
  const lastName =
    account.lastname[0].toUpperCase() + account.lastname.slice(1);

  return `${firstName} ${lastName}`;
};

export const transferFunds = function (data) {
  // Fetch user index in accounts
  const userIndex = fetchIndex(state.user);

  // Fetch recipient index in accounts
  const recipientIndex = fetchIndex(data);

  // Create transaction objects
  const cardObj = createCardTransactionObj(data, null, state);
  const accountObj = createAccountTransactionObj(data);

  // Push payment to user transactions
  state.accounts[userIndex].account.transactions.card.recent.push(cardObj);

  // // Push payment to recipient transactions
  state.accounts[recipientIndex].account.transactions.bank.recent.push(
    accountObj
  );

  // Update active user
  state.user = fetchAccount(state.user);

  // Save to Local storage
  addToStorage();

  // Save to session storage
  updateStorage();

  return cardObj;
};

export const checkRecipients = function (data) {
  // Fetch user index in accounts
  const userIndex = fetchIndex(state.user);

  // Get active recipients
  const recipients = state.accounts[userIndex].account.recipients.recent;
  return recipients.some(
    (e) => e.username.toLowerCase() === data.username.toLowerCase()
  );
};

export const addBeneficiary = function (data) {
  // Fetch user index in accounts
  const userIndex = fetchIndex(state.user);

  // Create recipient object
  const recipientObj = createRecipientObj(data);

  // Push recipient to user profile
  state.accounts[userIndex].account.recipients.recent.push(recipientObj);

  // Update active user
  state.user = fetchAccount(state.user);

  // Save to Local storage
  addToStorage();

  // Save to session storage
  updateStorage();
};

export const getQuickTransferDetails = function () {
  // Get quick transfer details from session
  return JSON.parse(sessionStorage.getItem("clue")).quickTransfer;
};

//////////////////////////////////////////////////////////
// TRANSACTIONS
//////////////////////////////////////////////////////////

const orderedTransactions = function (recent, value) {
  if (value === "old") return recent;
  if (value === "new") return recent.toReversed();
  if (value === "low") return recent.toSorted((a, b) => a.amount - b.amount);
  if (value === "high") return recent.toSorted((a, b) => b.amount - a.amount);
};

export const getTransaction = function (id, type) {
  // Fetch user index in accounts
  const accIndex = fetchIndex(state.user);

  // Get transaction
  const transaction = state.accounts[accIndex].account.transactions[
    type
  ].recent.find((el) => el.id === id);

  return transaction;
};

export const activeUsers = function () {
  return state.accounts.map((el) => el.username);
};

export const getResult = function (
  count = state.results,
  page = state.page,
  cardNum,
  order
) {
  let recent;

  // Reset state values
  state.query = "";
  delete state.searchResult;

  // Card number does not match new one
  if (cardNum && state.num && state.num !== cardNum) {
    delete state.num;
    delete state.filteredResult;
  }

  // Remove properties if card number does not exist
  if (!cardNum) {
    delete state.num;
    delete state.filteredResult;
  }

  // Set results
  state.results = +count;
  state.page = page;

  // Fetch user index in accounts
  const index = fetchIndex(state.user);

  // Order exist & card number doesn't exist
  if (order && !cardNum) {
    // Fetch card transaction in user
    const transaction = state.accounts[index].account.transactions.card.recent;
    recent = orderedTransactions(transaction, order);
  }

  // Card number exist & Order exist
  if (cardNum && order) {
    // Fetch card transaction in user
    const transaction = state.accounts[
      index
    ].account.transactions.card.recent.filter((transact) =>
      transact.card.endsWith(cardNum)
    );

    recent = orderedTransactions(transaction, order);

    // Add to state
    state.num = cardNum;
    state.filteredResult = recent;
  }

  const start = (state.page - 1) * state.results; // 0
  const end = state.page * state.results; // 9

  // Order & card number doesn't exist
  if (!cardNum && !order)
    return state.accounts[index].account.transactions.card.recent.slice(
      start,
      end
    );

  // Order exist & card number doesn't exist
  if (order && !cardNum) return recent.slice(start, end);

  // Order & card number exist
  if (cardNum && order) return state.filteredResult.slice(start, end);
};

export const getSearchResult = function (
  count = state.results,
  page = state.page,
  query = state.query,
  cardNum,
  order
) {
  let recent;
  // Fetch user index in accounts
  const accIndex = fetchIndex(state.user);

  if (!cardNum)
    recent = state.accounts[accIndex].account.transactions.card.recent;

  if (cardNum) recent = state.filteredResult;

  const filteredTransaction = recent.filter(
    (el) => el.recipient.toLowerCase().includes(query) || el.id.includes(query)
  );

  // Set results
  state.results = +count;
  state.page = page;
  state.query = query;
  state.searchResult = orderedTransactions(filteredTransaction, order);

  const start = (state.page - 1) * state.results; // 0
  const end = state.page * state.results; // 9

  return state.searchResult.slice(start, end);
};

//////////////////////////////////////////////////////////
// PLAN
//////////////////////////////////////////////////////////

const getPlanTotalDeposit = function (data) {
  // Fetch user index in accounts
  const accIndex = fetchIndex(state.user);

  // Get total deposit of plan
  const planTotalDeposit = state.accounts[
    accIndex
  ].account.transactions.plan.recent
    .filter((el) => el.num === data.id)
    .reduce((acc, num) => acc + +num.amount, 0);

  return planTotalDeposit;
};

const checkPlanBalance = function (data) {
  // Get total deposit of plan
  const planTotalDeposit = getPlanTotalDeposit(data);

  // Get plan remaining balance
  const balance = +data.target - planTotalDeposit;

  // Check if balance is greater than plan deposit amount
  if (balance >= +data.makeDeposit || balance >= +data.deposit) return true;
  else return false;
};

export const reviewPlan = function (planData) {
  // Fetch user index in accounts
  const accIndex = fetchIndex(state.user);

  // Get plan
  const plan = state.accounts[accIndex].account.plan.recent.find(
    (el) => el.id === planData.id
  );

  // Set date
  const date = plan.nextDate ? plan.nextDate : plan.startDate;

  // Check date
  const timePassed = checkDate(date);

  // Get card balance
  const cardBalance = state.accounts[accIndex].account.transactions.card.recent
    .filter((el) => el.card.endsWith(+plan.card))
    .reduce((acc, num) => acc + +num.amount, 0);

  // Get next deposit date
  const nextDepositDate = getNextDate(date, plan.type);

  if (timePassed < 1 && cardBalance > +plan.deposit) {
    evaluatePayment(plan, nextDepositDate);
  }
};

export const evaluatePayment = function (data, time) {
  // Fetch user index in accounts
  const userIndex = fetchIndex(state.user);

  // Get total deposit of plan
  const planTotalDeposit = getPlanTotalDeposit(data);

  // Get plan transaction history
  const recent = state.accounts[
    userIndex
  ].account.transactions.plan.recent.filter((el) => el.num === data.id);

  // No transaction history for plan
  if (recent.length < 1) {
    // Deposit amount lesser than or equal to target amount
    if (+data.deposit <= +data.target || +data.makeDeposit <= +data.target) {
      // Check if plan balance is greater than deposit amount
      const balance = checkPlanBalance(data);

      // Check if total deposit amount is equal to target amount
      const totalDeposit = checkTotalDeposit(data);

      // Save transaction payment
      if (balance && !totalDeposit) savePayment(data);

      // Check if total deposit amount is now equal to target amount
      checkTotalDeposit(data);

      // Update plan
      if (!checkTotalDeposit(data) && !data.makeDeposit) updatePlan(data, time);
    }

    // Deposit amount greater than target amount
    if (+data.deposit > +data.target || +data.makeDeposit > +data.target) {
      const newDeposit = +data.target - planTotalDeposit;

      // Check if total deposit amount is equal to target amount
      const totalDeposit = checkTotalDeposit(data);

      // Save transaction payment
      if (!totalDeposit) savePayment(data, newDeposit);

      // Check if total deposit amount is now equal to target amount
      checkTotalDeposit(data);

      // Update plan
      if (!checkTotalDeposit(data) && !data.makeDeposit) updatePlan(data, time);
    }
  }

  // Transaction history for plan exist
  if (recent.length > 0) {
    // Deposit amount lesser than or equal to remaining plan balanace amount
    if (checkPlanBalance(data)) {
      // Check if total deposit amount is equal to target amount
      const totalDeposit = checkTotalDeposit(data);

      // Save transaction payment
      if (!totalDeposit) savePayment(data);

      // Check if total deposit amount is now equal to target amount
      checkTotalDeposit(data);

      // Update plan
      if (!checkTotalDeposit(data) && !data.makeDeposit) updatePlan(data, time);
      return;
    }

    // Deposit amount greater than remaining plan balanace amount
    if (!checkPlanBalance(data)) {
      const newDeposit = +data.target - planTotalDeposit;

      // Check if total deposit amount is equal to target amount
      const totalDeposit = checkTotalDeposit(data);

      // Save transaction payment
      if (!totalDeposit) savePayment(data, newDeposit);

      // Check if total deposit amount is now  equal to target amount
      checkTotalDeposit(data);

      // Update plan
      if (!checkTotalDeposit(data) && !data.makeDeposit) updatePlan(data, time);
    }
  }
};

export const addPlan = function (data) {
  // Create plan object
  const planObj = createPlanObj(data);

  // Fetch user index in accounts
  const accIndex = fetchIndex(state.user);

  // Push plan to user profile
  state.accounts[accIndex].account.plan.recent.push(planObj);

  // Update active user
  state.user = fetchAccount(state.user);

  // Save to Local storage
  addToStorage();

  // Save to session storage
  updateStorage();

  return planObj;
};

export const updatePlan = function (data, time) {
  let getDate;

  // If time is defined
  if (time)
    getDate = new Intl.DateTimeFormat(navigator.language, {
      dateStyle: "long",
    }).format(new Date(time));

  // Fetch user index in accounts
  const accIndex = fetchIndex(state.user);

  // Fetch plan index in user
  let objIndex;
  // Set next date
  if (time)
    objIndex = state.accounts[accIndex].account.plan.recent.findIndex(
      (plan) => plan.id === data.id
    );

  // Updating plan
  if (!time)
    objIndex = state.accounts[accIndex].account.plan.recent.findIndex((plan) =>
      plan.id.endsWith(data[1]?.id || data.id)
    );

  /// Update user plan infromation
  // Update next date
  if (time)
    state.accounts[accIndex].account.plan.recent[objIndex].nextDate = getDate;

  // Update/edit plan
  if (Array.isArray(data)) {
    data.slice(0, 1).forEach((el, i, arr) => {
      state.accounts[accIndex].account.plan.recent[objIndex][el[0]] = el[1];
    });
  }

  // Set withdrawal status
  if (data.pendingPayment) {
    state.accounts[accIndex].account.plan.recent[objIndex].pendingPayment = "";
  }

  // Set withdrawal status
  if (data.withdrawal)
    state.accounts[accIndex].account.plan.recent[objIndex].withdrawn = true;

  // Set status to true
  if (time && !data.status)
    state.accounts[accIndex].account.plan.recent[objIndex].status = true;

  // Update active user
  state.user = fetchAccount(state.user);

  // Save to Local storage
  addToStorage();

  // Save to session storage
  updateStorage();
};

export const deactivate = function (data) {
  // Fetch user index in accounts
  const accIndex = fetchIndex(state.user);

  // Fetch obj index in user
  const objIndex = state.accounts[accIndex].account.plan.recent.findIndex(
    (plan) => plan.id.endsWith(data)
  );

  // Set active status
  state.accounts[accIndex].account.plan.recent[objIndex].active =
    !state.accounts[accIndex].account.plan.recent[objIndex].active;

  // Update active user
  state.user = fetchAccount(state.user);

  // Save to Local storage
  addToStorage();

  // // Save to session storage
  updateStorage();
};

//////////////////////////////////////////////////////////
// SETTINGS
//////////////////////////////////////////////////////////

export const updateUser = function (data) {
  const dataArr = Object.entries(data);

  // Fetch user index in accounts
  const accIndex = fetchIndex(state.user);

  // Update user profile
  dataArr.forEach((el, _, arr) => {
    if (arr.length > 3) state.accounts[accIndex][el[0]] = el[1];
    if (arr.length < 3) state.accounts[accIndex].account.limit[el[0]] = el[1];
  });

  // Update active user
  state.user = fetchAccount(state.user);

  // Save to Local storage
  addToStorage();

  // Save to session storage
  updateStorage();
};

const init = function () {
  const storage = localStorage.getItem("accounts");
  if (storage) state.accounts = JSON.parse(storage);

  const activeAccount = sessionStorage.getItem("clue");
  if (activeAccount) state.user = JSON.parse(activeAccount);
};
init();

export const getAllTransactions = function () {
  getTransactionMonth();
  getTotalCredit();
  getTotalDebit();
};
