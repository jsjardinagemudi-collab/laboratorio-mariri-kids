/* Estado local mínimo. Apelido opcional; sem sentimentos ou histórico comportamental. */
(function (root) {
  'use strict';
  const D = root.KidsContent || (typeof require === 'function' ? require('./content.js') : null);
  const KEY = 'a-luz-do-mariri-kids-v3';
  const known = (items, id) => items.some(item => item.id === id);
  const missionIds = D.missions.map(m => m.id);

  function initial() {
    return { version: 3, hero: 'menino-sol', pet: 'dog', customized: false, outfit: 'garden', outfits: ['garden'], accessory: '', accessories: [], openedChests: [], gifts: [], living: [null,null,null,null,null,null], petCare: {food:false,rest:false,play:false,affection:false,brush:false,vet:false}, farm: {}, nickname: '', welcomed: false, awards: [], plots: [null,null,null,null,null,null], basket: Object.fromEntries(D.ingredients.map(c=>[c.id,0])), harvested: [], room: [null,null,null,null,null,null], owned: [], meals: 0, avatar: 'jabuti', completed: [], plants: [], settings: { voice: true, sounds: true, reducedMotion: false, pairs: 2 } };
  }
  function normalize(raw) {
    const state = initial();
    if (!raw || typeof raw !== 'object' || ![1,2,3].includes(raw.version)) return state;
    state.avatar = known(D.avatars, raw.avatar) ? raw.avatar : state.avatar;
    state.completed = Array.isArray(raw.completed) ? [...new Set(raw.completed.filter(id => missionIds.includes(id)))] : [];
    // O saldo é derivado das conquistas; um arquivo inválido não cria moedas ou dívidas.
    state.plants = Array.isArray(raw.plants) ? raw.plants.filter(id => known(D.plants, id)).slice(0, 8) : [];
    state.settings.voice = raw.settings?.voice === true;
    state.settings.reducedMotion = raw.settings?.reducedMotion === true;
    state.settings.pairs = [2,3,4,6,8,10].includes(raw.settings?.pairs) ? raw.settings.pairs : 2;
    state.settings.sounds = raw.settings?.sounds !== false;
    state.nickname = typeof raw.nickname === 'string' ? raw.nickname.slice(0,20) : '';
    state.welcomed = raw.welcomed === true || raw.version === 1;
    const awardIds = [...Object.keys(D.geoQuizzes).map(id=>'geo-'+id), ...D.crops.map(c=>'harvest-'+c.id), ...D.recipes.map(r=>'meal-'+r.id), ...D.habitats.map(h=>'habitat-'+h.id), ...[2,3,4,6,8,10].map(n=>'memory-'+n), ...[4,6,8,9,12,16,24].map(n=>'puzzle-'+n), ...D.farmAnimals.map(a=>'farm-'+a.id), ...D.subjects.flatMap(s=>s.levels.map((_,i)=>'school-'+s.id+'-'+i)), ...Object.keys(D.miniGames).map(id=>'mini-'+id), ...D.shapeScenes.map(s=>'shape-'+s.id), ...['food','rest','play','affection','brush','vet'].map(id=>'pet-'+id)];
    state.awards = Array.isArray(raw.awards) ? [...new Set(raw.awards.filter(id=>awardIds.includes(id)))] : [];
    state.plants = state.plants.slice(0, Math.min(8, state.completed.length*2 + state.awards.length*2));
    state.harvested = Array.isArray(raw.harvested) ? [...new Set(raw.harvested.filter(id=>known(D.crops,id)))] : [];
    state.basket = Object.fromEntries(D.ingredients.map(c=>[c.id,Math.min(999,Math.max(0,Math.floor(Number(raw.basket?.[c.id])||0)))]));
    state.plots = state.plots.map((_,i)=>{ const v=raw.plots?.[i]; return v && known(D.crops,v.crop) && Number.isFinite(v.readyAt) ? {crop:v.crop,readyAt:v.readyAt} : null; });
    state.hero=known(D.heroes,raw.hero)?raw.hero:state.hero;
    state.pet=known(D.pets,raw.pet)?raw.pet:state.pet;
    state.customized=raw.customized===true;
    state.openedChests=Array.isArray(raw.openedChests)?[...new Set(raw.openedChests.filter(id=>known(D.chests,id)))]:[];
    // Itens dos baús são fixos. Restaurá-los não cobra sementes e não duplica inventário.
    const grants=state.openedChests.flatMap(id=>D.chests.find(c=>c.id===id).items);
    state.gifts=[...new Set([...grants.filter(i=>i[0]==='furniture').map(i=>i[1]),...(Array.isArray(raw.gifts)?raw.gifts.filter(id=>['blanket','rug'].includes(id)):[])])];
    state.outfits=['garden',...new Set(grants.filter(i=>i[0]==='outfit').map(i=>i[1]))];
    state.accessories=[...new Set(grants.filter(i=>i[0]==='accessory').map(i=>i[1]))];
    state.outfit=state.outfits.includes(raw.outfit)?raw.outfit:'garden';
    state.accessory=state.accessories.includes(raw.accessory)?raw.accessory:'';
    Object.keys(state.petCare).forEach(k=>state.petCare[k]=raw.petCare?.[k]===true);
    D.farmAnimals.forEach(a=>{const v=raw.farm?.[a.id]; if(v)state.farm[a.id]={fed:v.fed===true,water:v.water===true,rest:v.rest===true,readyAt:Number.isFinite(v.readyAt)?Math.max(0,v.readyAt):0,mode:['walk','eat','rest','happy','mud'].includes(v.mode)?v.mode:'walk'};});
    state.owned = Array.isArray(raw.owned) ? [...new Set(raw.owned.filter(id=>known(D.furniture,id)))] : [];
    state.owned = [...new Set([...state.owned,...state.gifts])];
    while (state.owned.filter(id=>!state.gifts.includes(id)).reduce((n,id)=>n+D.furniture.find(f=>f.id===id).cost,0) > state.completed.length*2+state.awards.length*2-state.plants.length) { const i=state.owned.findLastIndex(id=>!state.gifts.includes(id)); if(i<0)break;state.owned.splice(i,1); }
    const placed = new Set();
    state.room = state.room.map((_,i)=>{ const id=raw.room?.[i]; if(!state.owned.includes(id)||placed.has(id)) return null; placed.add(id); return id; });
    state.living=state.living.map((_,i)=>{const id=raw.living?.[i];if(!state.owned.includes(id)||placed.has(id))return null;placed.add(id);return id;});
    state.meals = Math.max(0,Math.min(999,Math.floor(Number(raw.meals)||0)));
    return state;
  }
  function balance(state) { return state.completed.length * 2 + state.awards.length * 2 - state.plants.length - state.owned.filter(id=>!state.gifts.includes(id)).reduce((n,id)=>n+D.furniture.find(f=>f.id===id).cost,0); }
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
      const value = storage.getItem(KEY) || storage.getItem('a-luz-do-mariri-kids-v2') || storage.getItem('a-luz-do-mariri-kids-v1');
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
    return shuffle(D.animals.slice(0, [2,3,4,6,8,10].includes(pairs) ? pairs : 2).flatMap(a => [{ ...a, card: a.id + '-a' }, { ...a, card: a.id + '-b' }]), random);
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
  function discoveryCount(state) { return state.completed.length+state.awards.length; }
  function openChest(state,id) {
    const c=D.chests.find(c=>c.id===id);
    if(!c||discoveryCount(state)<c.need||state.openedChests.includes(id))return false;
    state.openedChests.push(id);
    c.items.forEach(([type,item])=>{const list=type==='furniture'?state.owned:type==='outfit'?state.outfits:state.accessories;if(!list.includes(item))list.push(item);if(type==='furniture'&&!state.gifts.includes(item))state.gifts.push(item);});
    return true;
  }
  function farmCare(state,id,care,now=Date.now()) {
    const animal=D.farmAnimals.find(a=>a.id===id);if(!animal||!['food','water','rest','play'].includes(care))return false;
    const f=state.farm[id]||(state.farm[id]={fed:false,water:false,rest:false,readyAt:0,mode:'walk'});
    if(f.readyAt>now)return false;
    if(care==='food'){f.fed=true;f.mode='eat';}if(care==='water'){f.water=true;f.mode='happy';}if(care==='rest'){f.rest=true;f.mode='rest';}if(care==='play')f.mode=id==='pig'?'mud':'walk';
    if(f.fed&&f.water&&f.rest){award(state,'farm-'+id);if(animal.resource&&f.readyAt===0)f.readyAt=now+20000;}
    return true;
  }
  function farmCollect(state,id,now=Date.now()) {
    const a=D.farmAnimals.find(a=>a.id===id),f=state.farm[id];
    if(!a?.resource||!f||!f.fed||!f.water||!f.rest||!f.readyAt||now<f.readyAt)return false;
    state.basket[a.resource]=(state.basket[a.resource]||0)+1;
    state.farm[id]={fed:false,water:false,rest:false,readyAt:0,mode:'happy'};return true;
  }
  function craft(state,id) {
    if(!['blanket','rug'].includes(id)||state.owned.includes(id)||(state.basket.la||0)<2)return false;
    state.basket.la-=2;state.owned.push(id);state.gifts.push(id);return true;
  }
  const api = { KEY, discoveryCount, openChest, farmCare, farmCollect, craft, award, harvest, cook, buy, initial, normalize, balance, complete, plant, removePlant, load, save, shuffle, deck };
  root.KidsEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
