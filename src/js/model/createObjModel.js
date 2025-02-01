import { getTime, getDate, getMonth, getYear } from "../helpers";

// Account
export const createAccountObject = function (data) {
  return {
    firstname: data.firstname,
    lastname: data.lastname,
    username: data.username,
    password: data.password,
    email: data.email,
    phone: data["phone-number"],
    country: "",
    nationality: "",
    address: "",
    dob: "",
    occupation: "",
    account: {
      balance: {
        total: 0,
      },
      number: `2${Math.random().toString().slice(-9)}`,
      plan: {
        total: 0,
        recent: [],
      },
      card: {
        recent: [],
      },
      limit: {
        deposit: 5000000,
        transfer: 1000000,
      },
      recipients: {
        recent: [],
      },
      transactions: {
        bank: {
          recent: [],
        },
        card: {
          recent: [],
        },
        plan: {
          recent: [],
        },
      },
    },
    dateCreated: getDate(),
    timeCreated: getTime(),
  };
};

// Card
export const createCardObj = function (data) {
  return {
    title: data.cardTitle[0].toUpperCase() + data.cardTitle.slice(1),
    issuer: data.cardIssuer,
    currency: "NGN",
    name: data.cardName,
    number: `${
      data.cardIssuer === "Mastercard"
        ? `527${Math.random().toString().slice(-13)}`
        : `436${Math.random().toString().slice(-13)}`
    }`,
    expiryDate: `${getMonth("2-digit")}/${(+getYear() + 3 + "").slice(-2)}`,
    ccv: `${Math.random().toString().slice(-3)}`,
    limit: {
      deposit: 5000000,
      monthly: 2000000,
    },
    status: true,
    type: data.cardType,
    dateCreated: getDate(),
    timeCreated: getTime(),
  };
};

// Plan
export const createPlanObj = function (data) {
  return {
    name: data.name,
    category: data.category,
    startDate: data.date,
    nextDate: "",
    type: data.type,
    card: data.card,
    deposit: data.deposit,
    target: data.target,
    id: `${Math.random().toString().slice(-13)}`,
    active: true,
    completed: false,
    status: false,
    pendingPayment: "",
    dateCreated: getDate(),
    timeCreated: getTime(),
  };
};

// Recipient
export const createRecipientObj = function (data) {
  return {
    fullname: data.receiver,
    username: data.username,
    dateCreated: getDate(),
    timeCreated: getTime(),
  };
};
