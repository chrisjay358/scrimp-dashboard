export const getDate = function () {
  const date = new Date();

  return new Intl.DateTimeFormat(navigator.language, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

export const getTime = function () {
  const date = new Date();

  return new Intl.DateTimeFormat(navigator.language, {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
};

export const getMonth = function (value = "long") {
  const date = new Date();

  return new Intl.DateTimeFormat(navigator.language, {
    month: value,
  }).format(date);
};

export const getYear = function () {
  const date = new Date();

  return new Intl.DateTimeFormat(navigator.language, {
    year: "numeric",
  }).format(date);
};

export const formatCurrency = function (value, currency) {
  return new Intl.NumberFormat(navigator.language, {
    style: "currency",
    currency: currency,
    currencyDisplay: "narrowSymbol",
  }).format(value);
};

export const formatDate = function (date = "") {
  return new Intl.DateTimeFormat(navigator.language, {
    dateStyle: "long",
  }).format(new Date(date));
};

export const checkDate = function (data) {
  let date, today;
  date = new Intl.DateTimeFormat(navigator.language, {
    dateStyle: "long",
  }).format(new Date(data));
  today = new Intl.DateTimeFormat(navigator.language, {
    dateStyle: "long",
  }).format();

  const dateElpased = Date.parse(date);
  const todayElapsed = Date.parse(today);

  const timeElapsed = 1000 * 60 * 60 * 24;
  const timePassed = Math.round((dateElpased - todayElapsed) / timeElapsed);

  return timePassed;
};

export const getNextDate = function (data, type) {
  let date;
  if (type === "weekly")
    date = new Date(data).setDate(new Date(data).getDate() + 7);

  if (type === "monthly")
    date = new Date(data).setMonth(new Date(data).getMonth() + 1);

  if (type === "yearly")
    date = new Date(data).setYear(new Date(data).getFullYear() + 1);

  return date;
};

export const data = {
  labels: [],
  datasets: [
    {
      label: "Credit",
      data: [0],
      borderColor: "rgb(75, 192, 192)",
      backgroundColor: `rgba(75,192,192,0.5)`,
    },
    {
      label: "Debit",
      data: [0],
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: `rgba(255,99,132,0.5)`,
    },
  ],
};

export const config = {
  type: "line",
  data: data,
  options: {
    animations: {
      tension: {
        duration: 1000,
        easing: "easeOutExpo",
        from: 1,
        to: 0,
        loop: true,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      title: {
        display: true,
        text: "Funds flow",
        padding: {
          top: 5,
          bottom: 6,
        },
        font: {
          size: 15,
        },
      },
    },
  },
};
