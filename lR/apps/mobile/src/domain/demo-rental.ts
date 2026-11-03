import type{QuoteResult} from '../api/client';
import {rentalDays} from './date';

export type DemoOutcome='SUCCESS'|'FAILURE'|'CANCEL';
export type DemoRentalStatus='SIMULATED_PAID'|'SIMULATED_FAILED'|'SIMULATED_CANCELED';
export interface DemoRentalReceipt{
 reference:string;source:'BROWSER_SESSION_ONLY';status:DemoRentalStatus;
 productId:string;title:string;startDate:string;returnDate:string;rentalDays:number;
 rentalFeeKrw:number;depositKrw:number;payableKrw:number;
 policyVersionId:'demo-only'|'local-demo';createdAt:string;
}
export const demoRentalStatusLabel=(status:DemoRentalStatus):string=>({
 SIMULATED_PAID:'결제 시뮬레이션 성공',
 SIMULATED_FAILED:'결제 시뮬레이션 실패',
 SIMULATED_CANCELED:'결제 시뮬레이션 취소'
})[status];

const validMoney=(value:number)=>Number.isSafeInteger(value)&&value>=0;
/**
 * Client session receipt only. Does not create an order, place inventory holds,
 * call a payment provider or imply a successful transaction.
 */
export function makeDemoRentalReceipt(
 quote:QuoteResult,title:string,outcome:DemoOutcome,reference:string,at=Date.now()
):DemoRentalReceipt{
 const statuses:{[K in DemoOutcome]:DemoRentalStatus}={
  SUCCESS:'SIMULATED_PAID',FAILURE:'SIMULATED_FAILED',CANCEL:'SIMULATED_CANCELED'
 };
 if(!Object.prototype.hasOwnProperty.call(statuses,outcome))
  throw new Error('올바른 모의 결제 결과를 선택해 주세요.');
 if(quote.demo!==true||(quote.policyVersionId!=='local-demo'&&quote.policyVersionId!=='demo-only'))
  throw new Error('모의 결제는 시연용 견적에서만 가능합니다.');
 const days=rentalDays(quote.startDate,quote.returnDate);
 const values=[quote.rentalDays,quote.dayRateKrw,quote.rentalFeeKrw,quote.discountKrw,
  quote.shippingFeeKrw,quote.depositKrw,quote.payableNowKrw];
 if(!quote.productId||!quote.quoteId||!title.trim()||title.length>160||
    !/^DEMO-[A-Z0-9-]{1,40}$/.test(reference)||!values.every(validMoney)||
    days===null||days!==quote.rentalDays||
    quote.dayRateKrw*days!==quote.rentalFeeKrw||
    quote.discountKrw>quote.rentalFeeKrw||
    !Number.isSafeInteger(quote.rentalFeeKrw-quote.discountKrw+quote.shippingFeeKrw+quote.depositKrw)||
    quote.payableNowKrw!==quote.rentalFeeKrw-quote.discountKrw+quote.shippingFeeKrw+quote.depositKrw)
  throw new Error('견적이 변경되었습니다. 금액과 날짜를 다시 확인해 주세요.');
 if(!Number.isFinite(at)||!Number.isFinite(Date.parse(quote.quoteExpiresAt))||
    Date.parse(quote.quoteExpiresAt)<=at)
  throw new Error('견적 유효 시간이 끝났습니다. 견적을 다시 받아 주세요.');
 return {
  reference,source:'BROWSER_SESSION_ONLY',status:statuses[outcome],
  productId:quote.productId,title:title.trim(),startDate:quote.startDate,returnDate:quote.returnDate,
  rentalDays:days,rentalFeeKrw:quote.rentalFeeKrw,depositKrw:quote.depositKrw,
  payableKrw:quote.payableNowKrw,policyVersionId:quote.policyVersionId,
  createdAt:new Date(at).toISOString()
 };
}
