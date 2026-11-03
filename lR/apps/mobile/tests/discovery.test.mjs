import test from 'node:test';
import assert from 'node:assert/strict';
import {products} from '../src/domain/catalog.ts';
import {filterVisibleProducts,visibleCategories} from '../src/domain/discovery.ts';
const opts=(data={})=>({channel:'RENTAL',category:'ALL',condition:'ALL',sort:'RECOMMENDED',...data});
test('category, grade and rental price filters operate on loaded items only',()=>{
 assert.equal(products.length,4);
 const picked=filterVisibleProducts(products,opts({category:'토트백',condition:'A'}));
 assert.deepEqual(picked.map(p=>p.id),['demo-bag-01']);
 assert.equal(filterVisibleProducts(products,opts({condition:'S'})).length,0);
 assert.deepEqual(visibleCategories(products),['버킷백','숄더백','크로스백','토트백']);
});
test('price sorting is stable, uses channel price and does not mutate server page',()=>{
 const before=products.map(p=>p.id);
 const asc=filterVisibleProducts(products,opts({sort:'PRICE_ASC'})).map(p=>p.dayRateKrw);
 const desc=filterVisibleProducts(products,opts({sort:'PRICE_DESC'})).map(p=>p.dayRateKrw);
 assert.deepEqual(asc,[19000,22000,28000,32000]);
 assert.deepEqual(desc,[32000,28000,22000,19000]);
 const store=filterVisibleProducts(products,opts({channel:'STORE',sort:'PRICE_ASC'})).map(p=>p.salePriceKrw);
 assert.deepEqual(store,[480000,560000,900000,1180000]);
 assert.deepEqual(products.map(p=>p.id),before);
});
test('no account/product credential data written by display-only filters',()=>{
 const subset=filterVisibleProducts(products.slice(0,2),opts({sort:'PRICE_ASC'}));
 assert.equal(subset.length,2);
 assert.notEqual(subset,products);
});
