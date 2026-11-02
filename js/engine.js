/* Estado local mínimo. Nenhum nome de criança, sentimento ou histórico comportamental é salvo. */
(function (root) {
  'use strict';
  const D = root.KidsContent || (typeof require === 'function' ? require('./content.js') : null);
  const KEY = 'a-luz-do-mariri-kids-v1';
  const known = (items, id) => items.some(item => item.id === id);
  const missionIds = D.missions.map(m => m.id);

  function initial() {
    return { version: 1, avatar: 'jabuti', completed: [], plants: [], settings: { voice: false, reducedMotion: false, pairs: 3 } };
  }
  function normalize(raw) {
    const state = initial();
    if (!raw || typeof raw !== 'object' || raw.version !== 1) return state;
    state.avatar = known(D.avatars, raw.avatar) ? raw.avatar : state.avatar;
    state.completed = Array.isArray(raw.completed) ? [...new Set(raw.completed.filter(id => missionIds.includes(id)))] : [];
    // O saldo é derivado das conquistas; um arquivo inválido não cria moedas ou dívidas.
    state.plants = Array.isArray(raw.plants) ? raw.plants.filter(id => known(D.plants, id)).slice(0, state.completed.length * 2) : [];
    state.settings.voice = raw.settings?.voice === true;
    state.settings.reducedMotion = raw.settings?.reducedMotion === true;
    state.settings.pairs = raw.settings?.pairs === 4 ? 4 : 3;
    return state;
  }
  function balance(state) { return state.completed.length * 2 - state.plants.length; }
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
      const value = storage.getItem(KEY);
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
    return shuffle(D.animals.slice(0, pairs === 4 ? 4 : 3).flatMap(a => [{ ...a, card: a.id + '-a' }, { ...a, card: a.id + '-b' }]), random);
  }
  const api = { KEY, initial, normalize, balance, complete, plant, removePlant, load, save, shuffle, deck };
  root.KidsEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
