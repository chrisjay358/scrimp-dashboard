import { getDate, getTime, getMonth, getYear } from "../helpers";

// Transaction objects
export const createAccountTransactionObj = function (data) {
  return {
    name: data.name
      ? data.name
      : data.description
      ? data.sender
      : `${data.cardTitle.replace(
          data.cardTitle[0],
          data.cardTitle[0].toUpperCase()
        )} - Card creation`,
    id: `${Math.random().toString().slice(-7)}`,
    amount: data.amount
      ? +data.amount
      : data.transferAmount
      ? +data.transferAmount
      : data.refundAmount
      ? +data.refundAmount
      : -data.fundingAmount,
    date: getDate(),
    time: getTime(),
    month: getMonth(),
    year: getYear(),
    type: data.fundingAmount ? "Debit" : +data.amount > 0 ? "Credit" : "Debit",
    category:
      data.fundingAccount || data.fundingAmount
        ? "Card funding"
        : data.description
        ? "Intra transfer"
        : data.refundAmount && !data.category && !data.name.includes("Plan")
        ? "Card refund"
        : data.refundAmount && data.name.includes("Plan")
        ? "Plan refund"
        : "Inter Funding",
    ...(data.description ? { remark: data.description } : {}),
    ...(data.topup ? { topup: true } : {}),
    status: "Success",
  };
};

export const createCardTransactionObj = function (data, newDeposit, state) {
  const num = state.user.account.card.recent.at(-1).number;

  return {
    recipient: data.recipient
      ? data.recipient
      : data.topup
      ? data.name
      : data.startDate
      ? `Plan - ${data.name}`
      : data.description
      ? `Transfer to ${data.receiver}`
      : `${
          data.cardTitle[0].toUpperCase() + data.cardTitle.slice(1)
        } - ${num.slice(-4)}`,
    id: `${Math.random().toString().slice(-7)}`,
    amount: data.amount
      ? data.amount
      : newDeposit
      ? newDeposit
      : data.makeDeposit
      ? +-data.makeDeposit
      : data.deposit
      ? +-data.deposit
      : data.withdrawalAmount
      ? +data.withdrawalAmount
      : data.transferAmount
      ? +-data.transferAmount
      : data.refundAmount
      ? +data.refundAmount
      : +data.fundingAmount,
    date: getDate(),
    time: getTime(),
    month: getMonth(),
    year: getYear(),
    type:
      data.fundingAmount || data.refundAmount || data.withdrawalAmount
        ? "Credit"
        : data.category
        ? "Debit"
        : +data.amount > 0
        ? "Credit"
        : "Debit",
    card: data.card ? data.card : num.slice(-4),
    category:
      data.fundingAccount || data.fundingAmount
        ? "Card funding"
        : data.type && !data.withdrawalAmount
        ? "Plan deposit"
        : data.withdrawalAmount && data.category
        ? "Plan withdrawal"
        : data.description
        ? "Funds transfer"
        : data.category[0].toUpperCase() + data.category.slice(1),
    ...(data.description ? { description: data.description } : {}),
    ...(data.category && !data.refundAmount ? { payment: true } : {}),
    ...(data.withdrawal ? { planWithdrawal: true } : {}),
    ...(data.makeDeposit ? { selfDeposit: true } : {}),
    status: "Success",
  };
};

export const createPlanTransactionObj = function (data, newDeposit) {
  // num is plan id

  return {
    amount: newDeposit
      ? newDeposit
      : data.makeDeposit
      ? data.makeDeposit
      : data.deposit || +-data.withdrawalAmount,
    category: data.category,
    card: data.card,
    num: data.id,
    id: `${Math.random().toString().slice(-7)}`,
    name: data.name || data.recipient,
    state: "success",
    type: data.type,
    date: getDate(),
    time: getTime(),
    month: getMonth(),
    year: getYear(),
    ...(data.makeDeposit ? { selfDeposit: true } : {}),
    ...(data.withdrawal ? { planWithdrawal: true } : {}),
  };
};
