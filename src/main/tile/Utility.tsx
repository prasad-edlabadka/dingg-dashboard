export default function callAPI(url: string, token: string, setToken: any, cb: any) {
    const requestMetadata = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    };
    fetch(url, requestMetadata)
        .then(res => res.status === 401? setToken(null):res.json())
        .then(data => {
            cb(data);
        });
}

function setCookie(cname: string, cvalue: string, exdays: number) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  
  function getCookie(cname: string) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

export function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
}

export function formatDate(dt: Date): string {
    return [dt.getFullYear(), padTo2Digits(dt.getMonth() + 1), padTo2Digits(dt.getDate())].join('-');
}

export function formatTime(dt: Date): string {
  return dt.toLocaleTimeString('en-GB', { hour12: true, hour: "2-digit", minute: "2-digit" });
}

export const currencyFormatter = Intl.NumberFormat('en-in', { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  
export function getFirstDayOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}


export function addDays(dt: Date, days: number): Date {
  let retDate = new Date(dt);
  const result = retDate.setDate(retDate.getDate() + days);
  return new Date(result);
}

export function formatDisplayDate(d: Date) {
  return d.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
  }).replace(/ /g, '-');
}

export function formatWeekDay(d: Date) {
  return d.toLocaleDateString('en-GB', { weekday: 'long' })
}
export {setCookie, getCookie};