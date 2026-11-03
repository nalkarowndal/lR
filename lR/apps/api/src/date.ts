const ISO=/^(\d{4})-(\d{2})-(\d{2})$/;
export function dateValue(value:string):number|null{
  const m=ISO.exec(value);if(!m)return null;
  const [year,month,day]=m.slice(1).map(Number);
  const utc=Date.UTC(year,month-1,day);
  const actual=new Date(utc);
  return actual.getUTCFullYear()===year&&actual.getUTCMonth()===month-1&&actual.getUTCDate()===day?utc:null;
}
export function rentalDays(start:string,end:string):number|null{
  const a=dateValue(start),b=dateValue(end);
  if(a===null||b===null||b<=a)return null;
  return Math.round((b-a)/86400000);
}
