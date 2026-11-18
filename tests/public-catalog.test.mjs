import test from 'node:test';
import assert from 'node:assert/strict';
import {filterChannels, pageOf, normalizeLink} from '../public/catalog-model.mjs';
const rows=[
 {url:'https://max.ru/alpha',name:'Нейро Канал',description:'Картинки и видео',members:100,type:'channel',avatar:''},
 {url:'https://max.ru/helper_bot',name:'Помощник',description:'',members:null,type:'bot',avatar:''},
 {url:'https://max.ru/join/AbC',name:'',description:'Новости',members:0,type:'channel',avatar:''},
];
test('searches case-insensitively by name, description and address',()=>{
 assert.equal(filterChannels(rows,{q:'НЕЙРО'})[0].name,'Нейро Канал');
 assert.equal(filterChannels(rows,{q:'видео'}).length,1);
 assert.equal(filterChannels(rows,{q:'helper_bot'}).length,1);
});
test('combines type, metadata availability and participant bounds',()=>{
 assert.equal(filterChannels(rows,{type:'bot'}).length,1);
 assert.equal(filterChannels(rows,{description:'yes'}).length,2);
 assert.equal(filterChannels(rows,{description:'no'}).length,1);
 assert.equal(filterChannels(rows,{min:'0',max:'0'})[0].members,0);
 assert.equal(filterChannels(rows,{min:'0'}).length,2);
 assert.equal(filterChannels(rows,{type:'channel',min:'1',description:'yes'}).length,1);
 assert.equal(filterChannels(rows,{avatar:'yes'}).length,0);
});
test('sorting distinguishes zero from unknown and pagination clamps',()=>{
 assert.deepEqual(filterChannels(rows,{sort:'members-desc'}).map(x=>x.members),[100,0,null]);
 assert.deepEqual(filterChannels(rows,{sort:'members-asc'}).map(x=>x.members),[0,100,null]);
 assert.equal(pageOf(rows,99,2).page,2);
 assert.equal(pageOf(rows,1,2).items.length,2);
 assert.equal(pageOf([],2,50).pages,1);
});
test('canonical links preserve invitation case and reject foreign hosts',()=>{
 assert.equal(normalizeLink('https://MAX.RU/RT?ref=x'),'https://max.ru/rt');
 assert.equal(normalizeLink('https://max.ru/join/AbC'),'https://max.ru/join/AbC');
 for(const value of ['https://max.ru.evil/a','javascript:alert(1)','http://max.ru/a','https://user@max.ru/a']) assert.equal(normalizeLink(value),null);
});
test('CSV quotes fields, preserves unknown counters and protects spreadsheet formulas',async()=>{
 const {csvOf}=await import('../public/catalog-model.mjs');
 const csv=csvOf([{url:'https://max.ru/test',name:'=1+1',description:'"text", next\nline',members:null}]);
 assert.ok(csv.includes('"\'=1+1"'));
 assert.ok(csv.includes('""text""'));
 assert.ok(csv.endsWith(',""'));
});
test('empty and invalid bounds leave unknown participant counts visible',()=>{
 for(const filters of [{min:'',max:''},{min:'-1'},{max:'Infinity'},{min:'not-a-number'}]) assert.equal(filterChannels(rows,filters).length,3);
});
test('avatar absence filter and unknown filter values are independent',()=>{
 const withImages=rows.map((row,index)=>({...row,avatar:index===0?'https://example.org/image.jpg':''}));
 assert.equal(filterChannels(withImages,{avatar:'no'}).length,2);
 assert.equal(filterChannels(withImages,{avatar:'yes'}).length,1);
 assert.equal(filterChannels(withImages,{avatar:'unknown'}).length,3);
});
test('sorts every input order and resolves equal numbers by name and URL',()=>{
 const records=[{...rows[0],name:'Z',members:10,url:'https://max.ru/z'},{...rows[0],name:'A',members:0,url:'https://max.ru/a'},{...rows[0],name:'B',members:null,url:'https://max.ru/b'},{...rows[0],name:'C',members:null,url:'https://max.ru/c'}];
 for(const input of [records,[...records].reverse()]){
  assert.deepEqual(filterChannels(input,{sort:'members-desc'}).map(x=>x.name),['Z','A','B','C']);
  assert.deepEqual(filterChannels(input,{sort:'members-asc'}).map(x=>x.name),['A','Z','B','C']);
  assert.deepEqual(filterChannels(input,{sort:'name'}).map(x=>x.name),['A','B','C','Z']);
 }
 const tied=[{...records[0],url:'https://max.ru/b'},{...records[0],url:'https://max.ru/a'}];
 assert.equal(filterChannels(tied,{sort:'name'})[0].url,'https://max.ru/a');
 assert.equal(filterChannels(tied,{sort:'members-desc'})[0].url,'https://max.ru/a');
});
test('pagination covers page two, negative page and negative size',()=>{
 const four=[...rows,rows[0]];
 assert.equal(pageOf(four,2,2).items[0],rows[2]);
 assert.equal(pageOf(rows,-1,2).page,1);
 assert.equal(pageOf(rows,0,2).page,1);
 assert.equal(pageOf(rows,1,-2).items.length,1);
});
test('CSV keeps a real zero counter',async()=>{
 const {csvOf}=await import('../public/catalog-model.mjs');
 assert.ok(csvOf([rows[2]]).endsWith(',"0"'));
});
