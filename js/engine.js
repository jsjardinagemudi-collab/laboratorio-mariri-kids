/* Estado local mínimo. Nenhum nome de criança, sentimento ou histórico comportamental é salvo. */
(function (root) {
  'use strict';
  const D = root.KidsContent || (typeof require === 'function' ? require('./content.js') : null);
  const KEY = 'a-luz-do-mariri-kids-v2';
  const known = (items, id) => items.some(item => item.id === id);
  const missionIds = D.missions.map(m => m.id);

  function initial() {
    return { version: 2, nickname: '', welcomed: false, awards: [], plots: [null,null,null], basket: {girassol:0,alface:0,cenoura:0,tomate:0}, harvested: [], room: [null,null,null,null,null,null], owned: [], meals: 0, avatar: 'jabuti', completed: [], plants: [], settings: { voice: true, reducedMotion: false, pairs: 3 } };
  }
  function normalize(raw) {
    const state = initial();
    if (!raw || typeof raw !== 'object' || ![1,2].includes(raw.version)) return state;
    state.avatar = known(D.avatars, raw.avatar) ? raw.avatar : state.avatar;
    state.completed = Array.isArray(raw.completed) ? [...new Set(raw.completed.filter(id => missionIds.includes(id)))] : [];
    // O saldo é derivado das conquistas; um arquivo inválido não cria moedas ou dívidas.
    state.plants = Array.isArray(raw.plants) ? raw.plants.filter(id => known(D.plants, id)).slice(0, 8) : [];
    state.settings.voice = raw.settings?.voice === true;
    state.settings.reducedMotion = raw.settings?.reducedMotion === true;
    state.settings.pairs = [3,4,6,8,10].includes(raw.settings?.pairs) ? raw.settings.pairs : 3;
    state.nickname = typeof raw.nickname === 'string' ? raw.nickname.slice(0,20) : '';
    state.welcomed = raw.welcomed === true || raw.version === 1;
    const awardIds = [...D.crops.map(c=>'harvest-'+c.id), ...D.recipes.map(r=>'meal-'+r.id), ...D.habitats.map(h=>'habitat-'+h.id), ...[3,4,6,8,10].map(n=>'memory-'+n), ...[4,6,9,12].map(n=>'puzzle-'+n)];
    state.awards = Array.isArray(raw.awards) ? [...new Set(raw.awards.filter(id=>awardIds.includes(id)))] : [];
    state.plants = state.plants.slice(0, Math.min(8, state.completed.length*2 + state.awards.length*2));
    state.harvested = Array.isArray(raw.harvested) ? [...new Set(raw.harvested.filter(id=>known(D.crops,id)))] : [];
    state.basket = Object.fromEntries(D.crops.map(c=>[c.id,Math.min(999,Math.max(0,Math.floor(Number(raw.basket?.[c.id])||0)))]));
    state.plots = state.plots.map((_,i)=>{ const v=raw.plots?.[i]; return v && known(D.crops,v.crop) && Number.isFinite(v.readyAt) ? {crop:v.crop,readyAt:v.readyAt} : null; });
    state.owned = Array.isArray(raw.owned) ? [...new Set(raw.owned.filter(id=>known(D.furniture,id)))] : [];
    while (state.owned.reduce((n,id)=>n+D.furniture.find(f=>f.id===id).cost,0) > state.completed.length*2+state.awards.length*2-state.plants.length) state.owned.pop();
    const placed = new Set();
    state.room = state.room.map((_,i)=>{ const id=raw.room?.[i]; if(!state.owned.includes(id)||placed.has(id)) return null; placed.add(id); return id; });
    state.meals = Math.max(0,Math.min(999,Math.floor(Number(raw.meals)||0)));
    return state;
  }
  function balance(state) { return state.completed.length * 2 + state.awards.length * 2 - state.plants.length - state.owned.reduce((n,id)=>n+D.furniture.find(f=>f.id===id).cost,0); }
  function complete(state, id) {
    if (!missionIds.includes(id) || state.completed.includes(id)) return 0;
    state.completed.push(id);
    return 2;
  }
  function plant(state, id) {
    if (!known(D.plants, id) || balance(state) < 1 || state.plants.length >= 8) return false;
    state.plants.push(id);
    return true;
  }
  function removePlant(state, index) {
    if (!Number.isInteger(index) || index < 0 || index >= state.plants.length) return false;
    state.plants.splice(index, 1); // A semente volta para poder experimentar outra decoração.
    return true;
  }
  function load(storage) {
    try {
      const value = storage.getItem(KEY) || storage.getItem('a-luz-do-mariri-kids-v1');
      return { state: normalize(value ? JSON.parse(value) : null), available: true };
    } catch (_) { return { state: initial(), available: false }; }
  }
  function save(storage, state) {
    try { storage.setItem(KEY, JSON.stringify(normalize(state))); return true; }
    catch (_) { return false; }
  }
  function shuffle(items, random = Math.random) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function deck(pairs, random) {
    return shuffle(D.animals.slice(0, [3,4,6,8,10].includes(pairs) ? pairs : 3).flatMap(a => [{ ...a, card: a.id + '-a' }, { ...a, card: a.id + '-b' }]), random);
  }
  function award(state,id) { if(state.awards.includes(id)) return 0; state.awards.push(id); return 2; }
  function harvest(state,index,now=Date.now()) {
    const plot=state.plots[index]; if(!plot || now<plot.readyAt) return false;
    state.basket[plot.crop]=(state.basket[plot.crop]||0)+1;
    if(!state.harvested.includes(plot.crop)) state.harvested.push(plot.crop);
    award(state,'harvest-'+plot.crop); complete(state,'plantar'); state.plots[index]=null; return true;
  }
  function cook(state,id) { const r=D.recipes.find(r=>r.id===id); if(!r || !Object.entries(r.needs).every(([c,n])=>(state.basket[c]||0)>=n)) return false; Object.entries(r.needs).forEach(([c,n])=>state.basket[c]-=n); state.meals++; award(state,'meal-'+id); return true; }
  function buy(state,id) { const f=D.furniture.find(f=>f.id===id); if(!f || state.owned.includes(id)||balance(state)<f.cost) return false; state.owned.push(id); return true; }
  const api = { KEY, award, harvest, cook, buy, initial, normalize, balance, complete, plant, removePlant, load, save, shuffle, deck };
  root.KidsEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
