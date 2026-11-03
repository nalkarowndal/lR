import test from 'node:test';
import assert from 'node:assert/strict';
import {dateMs,rentalDays,monthDays,addCalendarDays} from '../src/domain/date.ts';

test('calendar date validation rejects impossible dates',()=>{
 assert.equal(dateMs('2026-02-30'),null);
 assert.equal(dateMs('2026-11-31'),null);
 assert.equal(dateMs('2026-11-02')!==null,true);
});
test('rentals use half-open intervals [start,return)',()=>{
 assert.equal(rentalDays('2026-11-10','2026-11-13'),3);
 assert.equal(rentalDays('2026-11-10','2026-11-10'),null);
 assert.equal(rentalDays('2026-11-13','2026-11-10'),null);
});
test('month view includes full month and calendar prefix',()=>{
 const november=monthDays(2026,10);
 assert.equal(november.filter(Boolean).length,30);
 assert.equal(november.filter(Boolean)[0],'2026-11-01');
 assert.equal(november.filter(Boolean).at(-1),'2026-11-30');
});
test('calendar date arithmetic crosses months and leap day',()=>{
 assert.equal(addCalendarDays('2028-02-28',1),'2028-02-29');
 assert.equal(addCalendarDays('2026-11-30',1),'2026-12-01');
});
