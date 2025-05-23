import moment from "moment";
export default function callAPI(url: string, token: string | null, setToken: any, cb: any) {
  const requestMetadata = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token || "",
    },
  };
  // if (process.env.NODE_ENV == "development") {
  //   cb(getStubbedResponse(url));
  // } else {
  fetch(url, requestMetadata)
    .then((res) => (res.status === 401 ? setToken(null) : res.json()))
    .then((data) => {
      cb(data);
    })
    .catch((err) => {
      console.log(err);
      cb();
    });
  // }
}

export function callAPIWithPromise(url: string, token: string | null, setToken: any) {
  const requestMetadata = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token || "",
    },
  };
  return new Promise((resolve, reject) => {
    fetch(url, requestMetadata)
      .then((res) => (res.status === 401 ? setToken(null) : res.json()))
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}

export function callPOSTAPI(url: string, data: object, token: string | null, setToken: any, cb: any) {
  callDataAPI("POST", url, data, token, setToken, cb);
}

export function callDELETEAPI(url: string, data: object, token: string | null, setToken: any, cb: any) {
  callDataAPI("DELETE", url, data, token, setToken, cb);
}

function callDataAPI(method: string, url: string, data: object, token: string | null, setToken: any, cb: any) {
  const requestMetadata = {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token || "",
    },
    body: JSON.stringify(data),
  };
  fetch(url, requestMetadata)
    .then((res) => (res.status === 401 ? setToken(null) : res.json()))
    .then((data) => {
      cb(data);
    });
}

export function callPUTAPI(url: string, data: object, token: string | null, setToken: any, cb: any) {
  callDataAPI("PUT", url, data, token, setToken, cb);
  // const requestMetadata = {
  //   method: 'PUT',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': token || ''
  //   },
  //   body: JSON.stringify(data)
  // };
  // fetch(url, requestMetadata)
  //   .then(res => res.status === 401 ? setToken(null) : res.json())
  //   .then(data => {
  //     cb(data);
  //   });
}

function setCookie(cname: string, cvalue: string, exdays: number) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname: string) {
  let name = cname + "=";
  let ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export function padTo2Digits(num: number) {
  return num.toString().padStart(2, "0");
}

export function formatDate(dt: Date): string {
  return [dt.getFullYear(), padTo2Digits(dt.getMonth() + 1), padTo2Digits(dt.getDate())].join("-");
}

export function getStartOfMonth(dt: Date): string {
  return [dt.getFullYear(), padTo2Digits(dt.getMonth() + 1), "01"].join("-");
}

export function getStartOfMonthDate(dt: Date): Date {
  return new Date(dt.getFullYear(), dt.getMonth(), 1);
}

export function getLastMonth() {
  const date = new Date();
  const lastMonthDate = new Date(date.getFullYear(), date.getMonth(), 1);
  return new Date(lastMonthDate.getTime() - 1);
}

export function getStartOfFinanceMonth(dt: Date): string {
  //if current date is before 10th, get previous month's 10th else get current month's 10th
  const date = new Date(dt);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const financeMonth = day < 10 ? month - 1 : month;
  const financeYear = financeMonth < 0 ? year - 1 : year;
  return [financeYear, padTo2Digits(financeMonth + 1), "10"].join("-");
}

export function getStartOfFinanceMonthDate(dt: Date): Date {
  return new Date(dt.getFullYear(), dt.getDate() > 9 ? dt.getMonth() : dt.getMonth() - 1, 10);
}

export function formatTime(dt: Date): string {
  return dt.toLocaleTimeString("en-GB", { hour12: true, hour: "2-digit", minute: "2-digit" });
}

export const currencyFormatter = Intl.NumberFormat("en-in", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function getFirstDayOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

export function formatDisplayDate(d: Date) {
  return d
    .toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-");
}

export function formatWeekDay(d: Date) {
  return d.toLocaleDateString("en-GB", { weekday: "long" });
}
export { setCookie, getCookie };

export function formatMinutes(d: number) {
  return moment.duration(d, "minute").humanize();
}

export function formatMobileNumber(n: string) {
  const countryCode = "+"; // Replace with the desired country code
  const areaCodeLength = 2; // Replace with the desired area code length
  const separator = "-"; // Replace with the desired separator

  const formattedNumber = n.replace(/\D/g, ""); // Remove non-digit characters
  const areaCode = formattedNumber.substr(0, areaCodeLength);
  const phoneNumber = formattedNumber.substr(areaCodeLength);

  return `${countryCode}${areaCode}${separator}${phoneNumber}`;
}

export function nth(n: number) {
  return ["st", "nd", "rd"][(((((n < 0 ? -n : n) + 90) % 100) - 10) % 10) - 1] || "th";
}

export function titleCase(st: string) {
  return st
    .toLowerCase()
    .split(" ")
    .reduce((s, c) => s + "" + (c.charAt(0).toUpperCase() + c.slice(1) + " "), "");
}
