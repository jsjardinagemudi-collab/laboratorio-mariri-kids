const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const E = require('../js/engine.js');
const D = require('../js/content.js');

test('cada descoberta recompensa uma vez; decorar não reduz as conquistas', () => {
  const s = E.initial();
  assert.equal(E.plant(s, 'girassol'), false);
  assert.equal(E.complete(s, 'inexistente'), 0);
  for (const m of D.missions) {
    assert.equal(E.complete(s, m.id), 2);
    assert.equal(E.complete(s, m.id), 0);
  }
  assert.equal(E.balance(s), 8);
  for (let i = 0; i < 8; i++) assert.equal(E.plant(s, D.plants[i % 4].id), true);
  assert.equal(E.balance(s), 0);
  assert.equal(E.plant(s, 'girassol'), false);
  assert.equal(s.completed.length, 4);
  assert.equal(E.removePlant(s, 0), true);
  assert.equal(E.balance(s), 1);
  assert.equal(E.plant(s, 'arvore'), true);
  assert.equal(E.removePlant(s, -1), false);
});
test('retomada preserva o jardim e descarta dados desconhecidos ou sensíveis', () => {
  const s = E.initial();
  E.complete(s, 'lago'); E.plant(s, 'flor'); s.avatar = 'coelho';
  const memory = new Map();
  const storage = { setItem: (k,v) => memory.set(k,v), getItem: k => memory.get(k) };
  assert.equal(E.save(storage, s), true);
  assert.deepEqual(E.load(storage).state, s);
  const cleaned = E.normalize({ ...s, name: 'nome que não será salvo', feeling: 'medo', completed: ['lago','lago','errado'], plants: ['flor','flor','flor'], avatar: '<script>', settings: { pairs: 100, voice: 'true' } });
  assert.deepEqual(cleaned.completed, ['lago']);
  assert.equal(cleaned.plants.length, 2);
  assert.equal(cleaned.avatar, 'jabuti');
  assert.equal(cleaned.settings.pairs, 2);
  assert.equal(cleaned.settings.voice, false);
  assert.equal('feeling' in cleaned, false);
  assert.equal('name' in cleaned, false);
});
test('armazenamento indisponível ou corrompido não impede brincar', () => {
  const blocked = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  assert.equal(E.load(blocked).available, false);
  assert.equal(E.save(blocked, E.initial()), false);
  assert.deepEqual(E.load({ getItem: () => '{broken' }).state, E.initial());
  assert.deepEqual(E.normalize({ version: 999, completed: ['lago'] }), E.initial());
});
test('baralho de três ou quatro pares contém exatamente duas cartas por animal', () => {
  for (const pairs of [3,4,6,8,10]) {
    const deck = E.deck(pairs);
    assert.equal(deck.length, pairs * 2);
    assert.equal(new Set(deck.map(c => c.card)).size, pairs * 2);
    for (const id of new Set(deck.map(c => c.id))) assert.equal(deck.filter(c => c.id === id).length, 2);
  }
});
test('arquivo de entrada e recursos locais existem; não dependem de CDN', () => {
  const root = path.resolve(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const ref = match[1];
    if (ref.startsWith('#')) continue;
    assert.equal(/^https?:/.test(ref), false, 'recurso externo inesperado: ' + ref);
    assert.equal(fs.existsSync(path.join(root, ref)), true, 'recurso ausente: ' + ref);
  }
  assert.ok(fs.statSync(path.join(root, 'assets/jardim-descobertas.png')).size > 1000);
});

 test('migração V1 preserva conquistas, plantas e personagem',()=>{
 const raw={version:1,avatar:'sapo',completed:['lago','plantar'],plants:['arvore'],settings:{voice:false,pairs:4}};
 const loaded=E.load({getItem:k=>k.endsWith('v1')?JSON.stringify(raw):null});
 assert.equal(loaded.state.version,3); assert.equal(loaded.state.avatar,'sapo'); assert.equal(E.balance(loaded.state),3); assert.equal(loaded.state.welcomed,true);
 });
 test('colheita respeita tempo e não duplica; cozinha consome ingredientes',()=>{
 const s=E.initial();s.plots[0]={crop:'alface',readyAt:1000};
 assert.equal(E.harvest(s,0,999),false);assert.equal(E.harvest(s,0,1000),true);assert.equal(E.harvest(s,0,1001),false);
 assert.equal(s.basket.alface,1);assert.equal(E.cook(s,'salada'),false);assert.equal(E.cook(s,'folhas'),true);assert.equal(s.basket.alface,0);assert.equal(E.cook(s,'folhas'),false);
 assert.deepEqual(E.normalize(s),s);
 });
 test('compra de móveis não duplica nem gasta progresso',()=>{
 const s=E.initial(); assert.equal(E.buy(s,'bed'),false);E.complete(s,'lago');assert.equal(E.buy(s,'bed'),true);assert.equal(E.balance(s),0);assert.equal(E.buy(s,'bed'),false);assert.equal(s.completed.length,1);
 s.room[0]='bed';assert.deepEqual(E.normalize(s),s);
 });
test('V2 migra preservando inventário, mobília, canteiros e nome',()=>{
 const raw={version:2,avatar:'sapo',nickname:'Teste',welcomed:true,completed:['lago'],awards:[],plants:[],owned:['bed'],room:['bed',null,null,null,null,null],basket:{alface:2},plots:[null,null,{crop:'tomate',readyAt:123}],settings:{voice:false,pairs:4},harvested:[],meals:0};
 const n=E.normalize(raw);assert.equal(n.version,3);assert.equal(n.room[0],'bed');assert.equal(n.nickname,'Teste');assert.equal(n.basket.alface,2);assert.deepEqual(n.plots[2],raw.plots[2]);assert.equal(n.plots.length,6);assert.equal(E.balance(n),0);
});
test('coleta requer cuidado, respeita descanso e não duplica',()=>{
 const s=E.initial();assert.equal(E.farmCollect(s,'cow',99999),false);
 for(const c of ['food','water','rest'])assert.equal(E.farmCare(s,'cow',c,100),true);
 assert.equal(E.farmCollect(s,'cow',20099),false);assert.equal(E.farmCollect(s,'cow',20100),true);assert.equal(E.farmCollect(s,'cow',20101),false);assert.equal(s.basket.leite,1);assert.deepEqual(E.normalize(s),s);
});
test('baús fixos e confecção preservam sementes e presentes ao recarregar',()=>{
 const s=E.initial();assert.equal(E.openChest(s,'c1'),false);E.award(s,'geo-biomas');E.award(s,'pet-food');const before=E.balance(s);assert.equal(E.openChest(s,'c1'),true);assert.equal(E.openChest(s,'c1'),false);assert.equal(E.balance(s),before);s.basket.la=2;assert.equal(E.craft(s,'blanket'),true);assert.equal(E.craft(s,'blanket'),false);assert.equal(s.basket.la,0);assert.deepEqual(E.normalize(s),s);
});
test('catálogo geográfico e respostas possuem referências locais válidas',()=>{
 assert.equal(D.geography.biomas.length,6);assert.equal(D.geography.estados.length,27);
 for(const list of Object.values(D.geography))for(const item of list)if(item.flag)assert.ok(fs.existsSync(path.join(__dirname,'../assets/bandeiras',item.flag)));
 for(const list of [...Object.values(D.geoQuizzes),...D.subjects.flatMap(s=>s.levels),...Object.values(D.miniGames)])for(const q of list)assert.ok(q.choices[q.answer],q.prompt);
});
test('publicação V3.2 contém recursos versionados consistentes e logo limitada',()=>{
 const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 for(const [a,b] of [['styles.css','styles-v3-2.css'],...['app','content','engine'].map(n=>['js/'+n+'.js','js/'+n+'-v3-2.js'])]){assert.ok(html.includes(b));assert.equal(fs.readFileSync(path.join(root,a),'utf8'),fs.readFileSync(path.join(root,b),'utf8'));}
 assert.match(html,/class="brand-logo" width="52" height="52"/);
 assert.equal(E.KEY,'a-luz-do-mariri-kids-v3');
});
