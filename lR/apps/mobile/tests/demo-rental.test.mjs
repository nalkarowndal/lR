import test from 'node:test';
import assert from 'node:assert/strict';
import {makeDemoRentalReceipt} from '../src/domain/demo-rental.ts';

const now=Date.parse('2026-11-03T09:00:00.000Z');
const quote={
 quoteId:'local-demo',productId:'demo-bag-01',startDate:'2026-11-10',returnDate:'2026-11-13',
 rentalDays:3,dayRateKrw:45000,rentalFeeKrw:135000,discountKrw:0,
 shippingFeeKrw:0,depositKrw:49000,payableNowKrw:184000,
 demo:true,disclaimer:'샘플 가격',policyVersionId:'local-demo',
 quoteExpiresAt:'2026-11-03T09:05:00.000Z'
};
test('local receipt records success, failure or cancellation only as simulated states',()=>{
 for(const [outcome,status] of [['SUCCESS','SIMULATED_PAID'],['FAILURE','SIMULATED_FAILED'],['CANCEL','SIMULATED_CANCELED']]){
  const item=makeDemoRentalReceipt(quote,'The Sera Top Handle',outcome,'DEMO-TEST-001',now);
  assert.equal(item.status,status);
  assert.equal(item.source,'BROWSER_SESSION_ONLY');
  assert.equal(item.reference,'DEMO-TEST-001');
  assert.equal(item.productId,'demo-bag-01');
  assert.equal(item.rentalFeeKrw,135000);
  assert.equal(item.depositKrw,49000);
  assert.equal(item.payableKrw,184000);
 }
});
test('local demo receipts reject real transaction policies and changed totals',()=>{
 assert.throws(()=>makeDemoRentalReceipt({...quote,demo:false},'Sample','SUCCESS','DEMO-1',now));
 assert.throws(()=>makeDemoRentalReceipt({...quote,policyVersionId:'approved-production'},'Sample','SUCCESS','DEMO-1',now));
 assert.throws(()=>makeDemoRentalReceipt({...quote,payableNowKrw:1},'Sample','SUCCESS','DEMO-1',now));
 assert.throws(()=>makeDemoRentalReceipt({...quote,depositKrw:-1},'Sample','SUCCESS','DEMO-1',now));
});
test('local demo receipts reject stale quotes and invalid rental periods',()=>{
 assert.throws(()=>makeDemoRentalReceipt({...quote,quoteExpiresAt:'2026-11-03T09:00:00.000Z'},'Sample','SUCCESS','DEMO-1',now));
 assert.throws(()=>makeDemoRentalReceipt({...quote,startDate:'2026-11-13',returnDate:'2026-11-10'},'Sample','SUCCESS','DEMO-1',now));
 assert.throws(()=>makeDemoRentalReceipt({...quote,rentalDays:30},'Sample','SUCCESS','DEMO-1',now));
});
test('local demo receipt reference and outcome cannot be forged from unexpected input',()=>{
 assert.throws(()=>makeDemoRentalReceipt(quote,'Sample','REAL_PAID','DEMO-1',now));
 assert.throws(()=>makeDemoRentalReceipt(quote,'Sample','SUCCESS','order-123',now));
 assert.throws(()=>makeDemoRentalReceipt(quote,'','SUCCESS','DEMO-1',now));
});
