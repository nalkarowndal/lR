// Business policy draft: calendar dates in KST and half-open [start,return) rental interval.
// No implicit shipping/inspection buffer may be added without approved policy.
const iso=/^\d{4}-\d{2}-\d{2}$/;
export function dateMs(value:string):number|null{
 if(!iso.test(value)) return null;
 const [year,month,day]=value.split('-').map(Number);
 const ms=Date.UTC(year,month-1,day);
 const parsed=new Date(ms);
 return parsed.getUTCFullYear()===year && parsed.getUTCMonth()===month-1 && parsed.getUTCDate()===day ? ms:null;
}
export function rentalDays(start:string,returnDate:string):number|null{
 const a=dateMs(start),b=dateMs(returnDate);
 if(a===null||b===null||b<=a) return null;
 return Math.round((b-a)/86400000);
}
export function addCalendarDays(value:string,days:number):string{
 const date=dateMs(value);
 if(date===null) throw new Error('잘못된 날짜');
 return new Date(date+days*86400000).toISOString().slice(0,10);
}
export function monthDays(year:number,month0:number):Array<string|null>{
 const leading=(new Date(Date.UTC(year,month0,1)).getUTCDay()+6)%7;
 const count=new Date(Date.UTC(year,month0+1,0)).getUTCDate();
 const dates:Array<string|null>=Array(leading).fill(null);
 for(let i=1;i<=count;i++) dates.push(new Date(Date.UTC(year,month0,i)).toISOString().slice(0,10));
 return dates;
}
