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
  assert.equal(cleaned.settings.pairs, 3);
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
  for (const pairs of [3,4]) {
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
