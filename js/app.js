(function () {
  'use strict';
  const D = window.KidsContent;
  const E = window.KidsEngine;
  const $ = selector => document.querySelector(selector);
  const panel = $('#panel');
  const content = $('#panel-content');
  let storage;
  try { storage = window.localStorage; } catch (_) { storage = null; }
  const loaded = E.load(storage);
  let state = loaded.state;
  let session = null;
  let run = 0;
  let opener = null;
  let toastTimer;
  const timers = new Set();
  const canSpeak = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }
  function storageNotice() {
    $('#storage-note').hidden = false;
    $('#storage-note').textContent = 'O navegador não permitiu salvar. Você pode brincar agora, mas o progresso pode desaparecer ao fechar.';
  }
  function save() { if (!E.save(storage, state)) storageNotice(); }
  function toast(message) {
    const element = $('#toast');
    clearTimeout(toastTimer);
    element.textContent = message;
    element.classList.add('visible');
    toastTimer = setTimeout(() => element.classList.remove('visible'), 3500);
  }
  function stopVoice() { if (canSpeak) window.speechSynthesis.cancel(); }
  function speak(text, force = false) {
    if (!canSpeak) { if (force) toast('A leitura em voz alta não está disponível neste navegador.'); return; }
    if (!state.settings.voice && !force) return;
    stopVoice();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = .86; utterance.pitch = 1.2;
    const voice = speechSynthesis.getVoices().find(v => v.lang === 'pt-BR') || speechSynthesis.getVoices().find(v => v.lang.startsWith('pt'));
    if (voice) utterance.voice = voice;
    speechSynthesis.speak(utterance);
  }
  function delay(fn, duration) {
    const currentRun = run;
    const id = setTimeout(() => { timers.delete(id); if (run === currentRun) fn(); }, duration);
    timers.add(id);
  }
  function clearActivity() {
    run++;
    timers.forEach(clearTimeout);
    timers.clear();
    stopVoice();
  }
  function render() {
    const avatar = D.avatars.find(a => a.id === state.avatar);
    $('#avatar-emoji').textContent = avatar.icon;
    $('#map-avatar').textContent = avatar.icon;
    $('#avatar-name').textContent = state.nickname || avatar.name;
    $('#seed-count').textContent = E.balance(state);
    $('#mission-progress').textContent = `${state.completed.length} de 4`;
    $('#garden-small').textContent = state.plants.length ? `${state.plants.length} de 8 cantinhos floridos` : 'Plante suas primeiras cores';
    $('#album-small').textContent = state.completed.length ? `${state.completed.length} lembrança${state.completed.length === 1 ? '' : 's'} para revisitar` : 'Cada aventura, uma lembrança';
    $('#garden-stage').textContent = state.completed.length === 4 ? 'Um jardim cheio de amizade' : state.completed.length ? 'Olha só como estamos crescendo!' : 'Um mundo para descobrir';
    $('#world-caption').textContent = state.plants.length ? `${state.plants.length} novos cuidados floresceram aqui.` : 'Um pequeno gesto. Uma nova descoberta.';
    $('#mission-list').innerHTML = D.missions.map(m => `<button class="mission-card ${m.color} ${state.completed.includes(m.id) ? 'done' : ''}" data-action="mission" data-id="${m.id}"><span class="mission-icon" aria-hidden="true">${m.icon}</span><span><strong>${m.name}</strong><small>${m.short}</small></span><span class="status" aria-label="${state.completed.includes(m.id) ? 'Descoberta concluída' : 'Tempo aproximado: ' + m.duration}">${state.completed.includes(m.id) ? '✓' : m.duration}</span></button>`).join('');
    D.missions.forEach(m => { $('#check-' + m.id).textContent = state.completed.includes(m.id) ? '✓' : ''; });
    $('#map-plants').innerHTML = state.plants.map(id => `<span>${D.plants.find(p => p.id === id).icon}</span>`).join('');
    const voiceButton = $('#voice-button');
    voiceButton.textContent = state.settings.voice ? '🔊' : '🔇';
    voiceButton.setAttribute('aria-pressed', String(state.settings.voice));
    voiceButton.setAttribute('aria-label', state.settings.voice ? 'Desativar leitura em voz alta' : 'Ativar leitura em voz alta');
    document.body.classList.toggle('reduce-motion', state.settings.reducedMotion);
    renderV3();
  }
  function shell(title, label, body, instruction = '') {
    if (!panel.open) opener = document.activeElement;
    content.innerHTML = `<header class="panel-head"><div><div class="eyebrow">${label}</div><h2 id="panel-title" tabindex="-1">${title}</h2></div><div class="panel-head-actions"><button class="icon-button" data-action="go-back" aria-label="Voltar">↩</button><button class="icon-button" data-action="read" aria-label="Ouvir instruções">🔊</button><button class="icon-button close-button" data-action="close" aria-label="Voltar ao mapa">🏠</button></div></header><div class="panel-body"><div class="activity-companion">${heroAndPet()}</div>${body}</div>`;
    content.dataset.narration = [title, instruction].filter(Boolean).join('. ');
    if (!panel.open) panel.showModal();
    panel.scrollTop = 0;
    $('#panel-title').focus({ preventScroll: true });
  }
  function close() {
    clearActivity();
    session = null;
    if (panel.open) panel.close();
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  }
  function freshPanel() { clearActivity(); session = null; }
  function mission(id, classic = false) {
    if (!classic && id === 'sentir') return gamesHouse();
    if (!classic && id === 'plantar') return farm();
    if (!classic && id === 'animais') return memoryMenu();
    if (!classic && id === 'lago') return lakeMenu();
    const m = D.missions.find(item => item.id === id);
    if (!m) return;
    clearActivity();
    session = { id, status: 'playing', step: 0, found: [], cards: E.deck(state.settings.pairs), opened: [], matched: [], locked: false };
    const replay = state.completed.includes(id) && (id !== 'animais' || state.awards.includes('memory-'+state.settings.pairs)) ? '<p class="hint">Você já ganhou as sementes desta aventura. Pode brincar de novo quando quiser!</p>' : '';
    let game = '';
    if (id === 'plantar') game = `<div class="steps" aria-label="Três cuidados para descobrir"><span class="step-dot" id="step-0"></span><span class="step-dot" id="step-1"></span><span class="step-dot" id="step-2"></span></div><div class="growing-stage"><span class="plant-stage-emoji" id="plant-emoji" aria-hidden="true">🟤</span><span class="stage-label" id="stage-label">A terra está pronta</span></div><div class="plant-actions"><button class="choice-tile" data-action="plant-step" data-step="0"><span aria-hidden="true">🌰</span><strong>Semear</strong></button><button class="choice-tile" data-action="plant-step" data-step="1"><span aria-hidden="true">💧</span><strong>Regar</strong></button><button class="choice-tile" data-action="plant-step" data-step="2"><span aria-hidden="true">☀️</span><strong>Dar luz</strong></button></div><p class="game-feedback" id="feedback" role="status">Qual é o primeiro cuidado?</p><div id="plant-finish"></div>`;
    if (id === 'lago') game = `<div class="count-pill" id="pond-count" aria-live="polite">0 de 4 objetos recolhidos</div><div class="pond" aria-label="Encontre o lixo no lago"><div class="pond-art" aria-hidden="true"></div><span class="pond-animal" style="left:45%;top:45%" aria-hidden="true">🐸</span>${[{id:'garrafa',icon:'🧴',name:'garrafa',x:20,y:30},{id:'papel',icon:'📰',name:'papel',x:72,y:23},{id:'lata',icon:'🥫',name:'lata',x:32,y:78},{id:'copo',icon:'🥤',name:'copo',x:80,y:73}].map(o => `<button class="pond-item" style="left:${o.x}%;top:${o.y}%" data-action="collect" data-id="${o.id}" aria-label="Recolher ${o.name}">${o.icon}</button>`).join('')}</div><p class="game-feedback" id="feedback" role="status">Vamos deixar a água mais bonita?</p><div id="pond-finish"></div>`;
    if (id === 'animais') game = `<div class="count-pill" id="memory-count" aria-live="polite">0 de ${state.settings.pairs} pares</div><div class="memory-grid ${state.settings.pairs >= 4 ? 'eight' : ''}" id="memory-grid"></div><p class="game-feedback" id="feedback" role="status">Não precisa correr. Observe com calma.</p><div id="memory-finish"></div>`;
    if (id === 'sentir') game = `<div class="talk-friend">${D.avatars.find(a=>a.id===state.avatar).icon}<p>Vamos conversar?</p></div><div class="button-row"><button class="primary-button" data-action="chat" data-id="yes">👍 Sim</button><button class="secondary-button" data-action="chat" data-id="no">👋 Agora não</button></div><div class="feelings-grid">${D.feelings.map(f => `<button class="choice-tile" data-action="feeling" data-id="${f.id}"><span aria-hidden="true">${f.icon}</span><strong>${f.name}</strong></button>`).join('')}</div><div class="button-row"><button class="secondary-button" data-action="feeling" data-id="passar">Prefiro só ouvir</button></div><p class="hint">Não existe resposta certa. Essa escolha não fica salva.</p>`;
    shell(m.name, m.place.toUpperCase(), `<p class="instruction">${m.instruction}</p>${game}${replay}`, m.instruction);
    if (id === 'animais') renderCards();
    speak(m.instruction);
  }
  function feedback(message) { const el = $('#feedback'); if (el) el.textContent = message; speak(message); }
  function plantStep(step) {
    if (session?.id !== 'plantar' || session.status !== 'playing') return;
    if (step !== session.step) {
      feedback(['Vamos colocar a semente na terra primeiro.', 'Agora, vamos dar um pouquinho de água.', 'Agora é a vez da luz do sol.'][session.step] || 'Seu girassol já cresceu.');
      return;
    }
    const images = ['🌱', '🌿', '🌻'];
    const labels = ['Uma nova vida começou', 'Água para crescer', 'Seu girassol floresceu!'];
    $('#plant-emoji').textContent = images[step];
    $('#stage-label').textContent = labels[step];
    $('#step-' + step).classList.add('on');
    const btn = $(`[data-action="plant-step"][data-step="${step}"]`);
    btn.classList.add('finished'); btn.disabled = true;
    session.step++;
    if (session.step < 3) feedback(step === 0 ? 'A semente está na terra. Agora, vamos regar.' : 'Muito bem! Vamos encontrar a luz do sol.');
    else {
      feedback('Você cuidou da semente! Na vida real, crescer leva tempo.');
      $('#plant-finish').innerHTML = '<button class="primary-button" data-action="finish">Guardar minha descoberta ✦</button>';
    }
  }
  function collect(id, button) {
    if (session?.id !== 'lago' || session.status !== 'playing' || !['garrafa','papel','lata','copo'].includes(id) || session.found.includes(id)) return;
    session.found.push(id); button.hidden = true;
    $('#pond-count').textContent = `${session.found.length} de 4 objetos recolhidos`;
    if (session.found.length === 4) {
      feedback('O lago ficou bem cuidado. Os animais agradecem!');
      $('#pond-finish').innerHTML = '<button class="primary-button" data-action="finish">Guardar minha descoberta ✦</button>';
      $('#pond-finish button').focus({ preventScroll: true });
    } else { feedback('Mais um cuidado com a água!'); }
  }
  function renderCards() {
    const grid = $('#memory-grid');
    if (!grid || session?.id !== 'animais') return;
    const focused = document.activeElement?.dataset?.card;
    grid.innerHTML = session.cards.map((c, i) => {
      const matched = session.matched.includes(c.id);
      const visible = session.opened.includes(i) || matched;
      return `<button class="memory-card ${visible ? 'open' : ''} ${matched ? 'matched' : ''}" data-action="card" data-card="${i}" aria-label="${visible ? c.name + (matched ? ', par encontrado' : '') : 'Carta ' + (i + 1) + ', virar'}" aria-pressed="${visible}" ${matched ? 'disabled' : ''}><span aria-hidden="true">${visible ? c.icon : '✿'}</span>${matched ? '<small>Um par! ✓</small>' : ''}</button>`;
    }).join('');
    if (focused !== undefined) { const next = grid.querySelector(`[data-card="${focused}"]`); if (next && !next.disabled) next.focus({ preventScroll: true }); }
  }
  function card(index) {
    if (session?.id !== 'animais' || session.status !== 'playing' || session.locked || !Number.isInteger(index) || !session.cards[index]) return;
    const item = session.cards[index];
    if (session.opened.includes(index) || session.matched.includes(item.id)) return;
    session.opened.push(index); renderCards();
    speak(item.name);
    if (session.opened.length < 2) return;
    const [first, second] = session.opened.map(i => session.cards[i]);
    if (first.id === second.id) {
      session.matched.push(first.id); session.opened = [];
      renderCards();
      $('#memory-count').textContent = `${session.matched.length} de ${state.settings.pairs} pares`;
      if (session.matched.length === state.settings.pairs) {
        feedback('Você encontrou todos os pares! Cada animal tem seu lugar na natureza.');
        $('#memory-finish').innerHTML = '<button class="primary-button" data-action="finish">Guardar minha descoberta ✦</button>';
        $('#memory-finish button').focus({ preventScroll: true });
      } else feedback('Você encontrou um par!');
    } else {
      session.locked = true;
      feedback('São diferentes. Vamos tentar outras cartas?');
      delay(() => { session.opened = []; session.locked = false; renderCards(); }, 1300);
    }
  }
  function feeling(id) {
    if (session?.id !== 'sentir' || session.status !== 'playing') return;
    const choice = D.feelings.find(f => f.id === id);
    if (!choice && id !== 'passar') return;
    // Sentimentos vivem apenas nesta tela; não alimentam estado, pontos ou perfis.
    const message = choice ? choice.response : 'Tudo bem só ouvir. Você pode conversar quando sentir vontade. Não precisa contar nada agora.';
    shell('Um cuidado para agora', 'RODA DO SOL', `<div class="feeling-big" aria-hidden="true">${choice?.icon || '💛'}</div><p class="feeling-note">${message}</p><p class="instruction">Qual cuidado você gostaria de experimentar?</p><div class="comfort-choices"><button data-action="comfort" data-id="companhia"><span aria-hidden="true">🤝</span>Pedir companhia</button><button data-action="comfort" data-id="pausa"><span aria-hidden="true">🌿</span>Fazer uma pausa</button><button data-action="comfort" data-id="ouvir"><span aria-hidden="true">💛</span>Só ouvir por enquanto</button></div>`, message);
    speak(message);
  }
  function comfort(id) {
    if (session?.id !== 'sentir' || session.status !== 'playing') return;
    const messages = { companhia: 'Você pode dizer a um adulto de confiança: fica um pouquinho comigo?', pausa: 'Olhe à sua volta. Encontre uma cor de que você gosta. Respire do seu jeito, sem prender o ar.', ouvir: 'Você pode ficar em silêncio e procurar companhia quando quiser. Seu jeito de participar também importa.' };
    if (!messages[id]) return;
    session.step = 1;
    shell('Tudo bem sentir', 'RODA DO SOL', `<div class="feeling-big" aria-hidden="true">💛</div><p class="feeling-note">${messages[id]}</p><p class="instruction">Não precisamos nos sentir de um jeito específico para fazer parte do jardim.</p><button class="primary-button" data-action="finish">Guardar minha descoberta ✦</button>`, messages[id]);
    speak(messages[id]);
  }
  function finish() {
    if (!session || session.status !== 'playing') return;
    const ready = (session.id === 'plantar' && session.step === 3) || (session.id === 'lago' && session.found.length === 4) || (session.id === 'animais' && session.matched.length === state.settings.pairs) || (session.id === 'sentir' && session.step === 1);
    if (!ready) return;
    session.status = 'complete';
    const m = D.missions.find(x => x.id === session.id);
    const gained = E.complete(state, m.id) + (m.id === 'animais' ? E.award(state, 'memory-'+state.settings.pairs) : 0);
    save(); render(); clearActivity();
    shell('Uma descoberta para guardar', 'CADA GESTO IMPORTA', `<div class="reward"><div class="reward-medal" aria-hidden="true">${m.icon}</div><h3>${m.badge}</h3><p>${m.learning}</p>${gained ? `<div class="seed-gain"><span aria-hidden="true">🌱</span> +${gained} sementes para seu jardim</div>` : '<span class="small-badge">Uma descoberta que você já guardou 💛</span>'}${state.completed.length === 4 ? '<p>As quatro descobertas estão no seu álbum. Que tal levar um desses cuidados para fora da tela?</p>' : ''}<div class="button-row"><button class="primary-button" data-action="garden">Enfeitar meu jardim 🌼</button><button class="secondary-button" data-action="close">Voltar ao mapa</button></div><div class="real-world"><span aria-hidden="true">🤝</span><div><strong>Agora, juntos fora da tela</strong><p>${m.offline}</p></div></div></div>`, `${m.learning} ${gained ? `Você ganhou ${gained} sementes para seu jardim.` : 'Sua descoberta continua no álbum.'}`);
    speak(`${m.badge}. ${m.learning} ${gained ? `Você ganhou ${gained} sementes.` : ''}`);
  }
  function garden() {
    freshPanel();
    const balance = E.balance(state);
    shell('Meu pequeno jardim', 'CUIDADOS QUE FLORESCEM', `<div class="button-row"><button class="primary-button" data-action="house">🚪 Entrar na casa</button><button class="secondary-button" data-action="kitchen">🥗 Cozinhar</button></div><div class="garden-summary"><strong>🌱 ${balance} semente${balance === 1 ? '' : 's'}</strong><span>${state.plants.length} de 8 cantinhos floridos</span></div><div class="garden-slots">${Array.from({ length: 8 }, (_, i) => {
      const plant = D.plants.find(p => p.id === state.plants[i]);
      return plant ? `<button class="garden-slot filled" data-action="remove-plant" data-index="${i}" aria-label="Guardar ${plant.name} e recuperar uma semente"><span aria-hidden="true">${plant.icon}</span><small>Guardar</small></button>` : '<span class="garden-slot empty" aria-label="Cantinho livre">+</span>';
    }).join('')}</div><p class="instruction">Escolha o que vai florescer. Cada plantinha usa 1 semente.</p><div class="shop-grid">${D.plants.map(p => `<button class="choice-tile" data-action="buy-plant" data-id="${p.id}" ${balance < 1 ? 'disabled' : ''} aria-label="Plantar ${p.name}, uma semente"><span aria-hidden="true">${p.icon}</span><strong>${p.name}</strong><small>🌱 1 semente</small></button>`).join('')}</div><p class="hint">Toque em uma planta do seu jardim para guardá-la e receber a semente de volta. Você pode experimentar outras cores!</p>${!state.completed.length ? '<div class="button-row"><button class="primary-button" data-action="mission" data-id="plantar">Descobrir a horta 🌱</button></div>' : ''}${state.plants.length === 8 ? '<p class="feeling-note">Seu jardim floresceu! Você pode reorganizá-lo ou fazer uma pausa para cuidar do mundo lá fora. 💛</p>' : ''}`, 'Escolha uma plantinha para seu jardim. Cada uma usa uma semente. Você ganha duas sementes na primeira vez que conclui cada aventura.');
  }
  function album() {
    freshPanel();
    shell('Meu álbum de descobertas', 'LEMBRANÇAS PARA REVISITAR', `${!state.completed.length ? '<p class="empty-album">Seu álbum está começando. Escolha uma aventura no mapa para guardar a primeira lembrança.</p>' : ''}<div class="album-grid">${D.missions.map(m => {
      const done = state.completed.includes(m.id);
      return `<article class="album-card ${done ? '' : 'locked'}"><span aria-hidden="true">${m.icon}</span><h3>${done ? m.badge : m.name}</h3><p>${done ? m.learning : 'Uma descoberta esperando por você.'}</p><small>${done ? '✓ Descoberta guardada' : m.place}</small><button class="secondary-button" data-action="mission" data-id="${m.id}">${done ? 'Brincar de novo' : 'Descobrir'}</button></article>`;
    }).join('')}</div>`, 'Aqui ficam as lembranças de cada aventura. Você pode brincar de novo quando quiser.');
  }
  function avatars() {
    freshPanel();
    shell('Quem vai com você?', 'SEU COMPANHEIRO DE DESCOBERTAS', `<label class="nickname-label">Como quer ser chamado? <input id="nickname" maxlength="20" placeholder="Apelido (opcional)" value="${escapeHTML(state.nickname)}" autocomplete="off"></label><p class="instruction">Toque no amigo que vai brincar com você.</p><div class="avatar-grid">${D.avatars.map(a => `<button class="choice-tile avatar-choice ${state.avatar === a.id ? 'selected' : ''}" data-action="choose-avatar" data-id="${a.id}" aria-pressed="${state.avatar === a.id}"><span aria-hidden="true">${a.icon}</span><strong>${a.name}</strong><small>${a.phrase}</small></button>`).join('')}</div><p class="hint">Todos podem explorar os mesmos lugares e descobrir os mesmos cuidados.</p>`, 'Escolha um amigo para acompanhar você. Todos podem explorar os mesmos lugares.');
  }
  function help() {
    freshPanel();
    shell('É simples brincar', 'VAMOS DESCOBRIR JUNTOS?', `<div class="help-steps"><div class="help-step"><span aria-hidden="true">🗺️</span><p>Toque em um lugar do mapa.</p></div><div class="help-step"><span aria-hidden="true">💛</span><p>Brinque no seu ritmo. Você pode tentar de novo.</p></div><div class="help-step"><span aria-hidden="true">🌱</span><p>Ganhe sementes e plante cores no seu jardim.</p></div><div class="help-step"><span aria-hidden="true">🤝</span><p>Leve uma descoberta para o mundo, junto de um adulto.</p></div></div><div class="button-row"><button class="primary-button" data-action="mission" data-id="plantar">Começar na horta 🌱</button><button class="secondary-button" data-action="close">Escolher no mapa</button></div>`, 'Toque em um lugar do mapa. Brinque no seu ritmo. Ganhe sementes e plante cores no seu jardim. Descubra junto com um adulto.');
  }
  function parents() {
    freshPanel();
    shell('Para quem cuida', 'ACOMPANHAR TAMBÉM É BRINCAR', `<p class="parents-copy">Primeira ideia jogável para crianças de 4 a 8 anos. Convide a criança a escolher, leia junto quando necessário e faça pausas. Os tempos das aventuras são apenas estimativas, sem contagem regressiva.</p><label class="settings-row"><span><strong>Leitura em voz alta</strong><small>Usa a voz disponível no navegador. Ative com um toque.</small></span><input type="checkbox" id="setting-voice" ${state.settings.voice ? 'checked' : ''} ${!canSpeak ? 'disabled' : ''}></label><label class="settings-row"><span><strong>Reduzir movimentos</strong><small>Deixa as transições mais tranquilas.</small></span><input type="checkbox" id="setting-motion" ${state.settings.reducedMotion ? 'checked' : ''}></label><label class="settings-row"><span><strong>Jogo dos animais</strong><small>Escolha a quantidade de pares.</small></span><select id="setting-pairs"><option value="2" ${state.settings.pairs === 2 ? 'selected' : ''}>2 pares (4 cartas)</option><option value="3" ${state.settings.pairs === 3 ? 'selected' : ''}>3 pares</option><option value="4" ${state.settings.pairs === 4 ? 'selected' : ''}>4 pares</option>${[6,8,10].map(n=>`<option value="${n}" ${state.settings.pairs===n?'selected':''}>${n} pares (${n*2} cartas)</option>`).join('')}</select></label><label class="settings-row"><span><strong>Sons dos botões</strong></span><input type="checkbox" id="setting-sounds" ${state.settings.sounds?'checked':''}></label><section class="parent-info"><h3>Um espaço para experimentar</h3><ul><li>Sem anúncios, compras, chat ou ranking.</li><li>Sem cadastro, foto ou localização. O apelido é opcional e fica apenas neste aparelho.</li><li>As respostas sobre sentimentos não são salvas nem avaliadas.</li><li>Ficam neste navegador o apelido opcional, personagem, conquistas, jardim, casa, alimentos e preferências. Respostas da conversa não ficam salvas.</li><li>Não há sincronização entre aparelhos. Apagar os dados do navegador apaga o progresso.</li></ul></section><p class="parents-copy">Este é um protótipo educativo, não uma ferramenta de avaliação ou tratamento. A identidade visual infantil está em fase de proposta. A leitura usa os recursos do dispositivo e pode depender da disponibilidade de vozes.</p><div class="button-row"><button class="secondary-button" data-action="export">Baixar meu progresso</button><button class="secondary-button danger-button" data-action="reset-confirm">Recomeçar o jardim</button></div>`, 'Configure o jogo e acompanhe as descobertas da criança.');
  }
  function resetConfirm() {
    freshPanel();
    shell('Recomeçar este jardim?', 'ÁREA DOS RESPONSÁVEIS', '<p class="instruction">Isso apaga as descobertas e as plantas salvas neste navegador. Você pode baixar uma cópia do progresso antes de continuar.</p><div class="button-row"><button class="secondary-button" data-action="parents">Manter meu jardim</button><button class="primary-button danger-button" data-action="reset">Sim, recomeçar</button></div>');
  }
  function exportProgress() {
    const blob = new Blob([JSON.stringify(E.normalize(state), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'meu-jardim-mariri-kids.json';
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Cópia do progresso preparada.');
  }

  // V2: ambientes novos usam o mesmo estado, diálogo e controles acessíveis da V1.
  let selectedFurniture = null;
  let puzzle = null;
  let planting = null;
  let cooking = null;
  const tile = (action,id,icon,name,extra='') => `<button class="choice-tile" data-action="${action}" data-id="${id}" ${extra}><span aria-hidden="true">${icon}</span><strong>${name}</strong></button>`;
  function v2Shell(title,body,instruction) {
    freshPanel(); shell(title,'A LUZ DO MARIRI KIDS · V3',body,instruction); speak(instruction);
  }
  function basketView() {
    return `<div class="basket" aria-label="Minha cesta">🧺 ${D.ingredients.filter(c=>state.basket[c.id]>0).map(c=>`<span title="${c.name}">${c.icon} <b>${state.basket[c.id]||0}</b></span>`).join('')}</div>`;
  }
  function farm() {
    const count=state.harvested.length;
    v2Shell('🌱 Horta da Terra', `<div class="garden-summary"><strong>🌿 Descobertas ${count}/${D.crops.length}</strong><button class="secondary-button" data-action="kitchen">🧺 → 🥗</button></div>${basketView()}<div class="farm-plots">${state.plots.map((plot,i)=>{
      if(!plot) return `<button class="plot empty" data-action="sow-menu" data-id="${i}" aria-label="Plantar no canteiro ${i+1}"><span>🟤</span><strong>🌱 Plantar</strong></button>`;
      const c=D.crops.find(c=>c.id===plot.crop), ready=Date.now()>=plot.readyAt;
      return `<button class="plot ${ready?'ripe':''}" data-action="harvest" data-id="${i}"><span>${ready?c.icon:'🌱'}</span><strong>${ready?'🧺 Colher':c.name}</strong><small>${ready?'Prontinho!':'Crescendo · em breve'}</small></button>`;
    }).join('')}</div><p class="hint">Aqui o crescimento leva 30 segundos. Na natureza, leva muito mais tempo. Sua horta espera por você.</p><div class="button-row"><button class="secondary-button" data-action="farm">🔄 Ver crescimento</button><button class="secondary-button" data-action="classic-plant">🌻 Primeira brincadeira</button></div>`, 'Toque na terra para plantar. Quando a planta crescer, toque na cesta para colher.');
    const waiting=state.plots.filter(p=>p&&p.readyAt>Date.now());
    if(waiting.length) delay(farm,Math.max(50,Math.min(...waiting.map(p=>p.readyAt))-Date.now()+50));
  }
  function sowMenu(index) {
    if(!Number.isInteger(index)||index<0||index>=state.plots.length||state.plots[index]) return;
    planting={index,crop:null,step:0};
    v2Shell('O que vamos plantar?', `<div class="shop-grid">${D.crops.map(c=>tile('sow',c.id,c.icon,c.name,state.harvested.length<c.unlock?'disabled':'')).join('')}</div><p class="hint">🥕 Colha uma variedade para descobrir a cenoura. 🍅 Colha duas variedades para descobrir o tomate.</p>`, 'Escolha uma planta. As plantas novas aparecem quando você faz novas colheitas.');
  }
  function sow(id) {
    const c=D.crops.find(c=>c.id===id);
    if(!planting||!c||state.harvested.length<c.unlock) return;
    planting.crop=id; planting.step=0; drawSow();
  }
  function drawSow() {
    const c=D.crops.find(c=>c.id===planting.crop), next=c.steps[planting.step], tool=D.tools[next];
    v2Shell(`${c.icon} ${c.name}`, `<div class="sequence">${c.steps.map((step,i)=>`<span class="${i<planting.step?'done':i===planting.step?'current':''}">${D.tools[step][0]}${i<planting.step?'✓':''}</span>`).join('')}</div><div class="growing-stage"><span class="plant-stage-emoji">${planting.step<2?'🟤':planting.step<4?'🌱':'🌿'}</span></div><p class="instruction">${tool[0]} Agora: ${tool[1]}</p><div class="shop-grid">${Object.entries(D.tools).map(([id,t])=>tile('sow-step',id,t[0],t[1])).join('')}</div><p id="feedback" class="game-feedback" role="status"></p><p class="hint">🍂 Composto é matéria orgânica decomposta que ajuda a nutrir o solo. Cascas de ovo não são necessárias nesta receita.</p>`, `Agora escolha: ${tool[1]}.`);
  }
  function sowStep(id) {
    if(!planting?.crop) return;
    const c=D.crops.find(c=>c.id===planting.crop);
    if(c.steps[planting.step]!==id) { feedback('Vamos seguir o desenho destacado. '+D.tools[c.steps[planting.step]][1]); return; }
    planting.step++;
    if(planting.step<c.steps.length) return drawSow();
    state.plots[planting.index]={crop:c.id,readyAt:Date.now()+30000}; planting=null; save(); render(); farm(); speak('Você plantou! Vamos dar tempo para crescer. Pode brincar em outro lugar.');
  }
  function kitchen() {
    cooking=null;
    v2Shell('🥗 Cozinha do Jardim', `${basketView()}<p class="instruction">Escolha o que vamos preparar.</p><div class="shop-grid">${D.recipes.map(r=>`<button class="choice-tile" data-action="recipe" data-id="${r.id}" ${Object.entries(r.needs).every(([id,n])=>(state.basket[id]||0)>=n)?'':'disabled'}><span>${r.icon}</span><strong>${r.name}</strong><small>${Object.entries(r.needs).map(([id,n])=>`${D.ingredients.find(c=>c.id===id).icon} ${n}`).join(' + ')}</small></button>`).join('')}</div><div class="button-row"><button class="primary-button" data-action="farm">🌱 Buscar alimentos</button><button class="secondary-button" data-action="farmyard">🐄 Leite e ovos</button><button class="secondary-button" data-action="pantry">🌾 Pegar aveia</button></div><p class="hint">Brincadeira virtual. Na cozinha de verdade, participe com um adulto. Não usamos facas nem fogão neste jogo.</p>`, 'Veja sua cesta. Colha os ingredientes na horta para preparar uma comida.');
  }
  function recipe(id) {
    const r=D.recipes.find(r=>r.id===id);
    if(!r || !Object.entries(r.needs).every(([c,n])=>(state.basket[c]||0)>=n)) return;
    cooking={id,step:0,selected:[]}; drawRecipe();
  }
  function drawRecipe() {
    const r=D.recipes.find(r=>r.id===cooking.id),needed=Object.keys(r.needs);
    if(cooking.selected.length<needed.length){
      v2Shell(r.icon+' '+r.name,`<p class="instruction">O que entra nesta receita?</p><div class="sequence">${needed.map(id=>`<span class="${cooking.selected.includes(id)?'done':''}">${D.ingredients.find(i=>i.id===id).icon}${cooking.selected.includes(id)?'✓':''}</span>`).join('')}</div><div class="shop-grid">${D.ingredients.filter(i=>state.basket[i.id]>0||needed.includes(i.id)).map(i=>tile('recipe-ingredient',i.id,i.icon,i.name,cooking.selected.includes(i.id)?'disabled':'')).join('')}</div><p id="feedback" class="game-feedback" role="status"></p>`, 'Escolha os ingredientes mostrados na receita.');return;
    }
    const steps=[['🧺','Separar'],['💧','Higienizar com um adulto'],['🥣',r.warm?'Preparar com um adulto':'Misturar'],['🤝','Servir']];
    v2Shell(r.icon+' '+r.name, `<div class="sequence">${steps.map((x,i)=>`<span class="${i===cooking.step?'current':i<cooking.step?'done':''}">${x[0]}</span>`).join('')}</div><div class="growing-stage"><span class="plant-stage-emoji">${cooking.step===3?r.icon:steps[cooking.step][0]}</span></div><div class="shop-grid">${steps.map((x,i)=>tile('cook-step',i,x[0],x[1])).join('')}</div><p class="game-feedback" id="feedback" role="status"></p><p class="hint">Receita de faz de conta. Na cozinha real, um adulto cuida do preparo e do aquecimento.</p>`, 'Agora vamos '+steps[cooking.step][1].toLowerCase()+'.');
  }
  function house() {houseV3();}
  function legacyHouse() {
    v2Shell('🏡 Minha Casa na Árvore', `<div class="garden-summary"><strong>🌱 ${E.balance(state)} sementes</strong><button class="secondary-button" data-action="garden">🌷 Jardim</button></div><div class="room"><div class="room-window">🌤️ 🌳</div><div class="room-resident">${D.avatars.find(a=>a.id===state.avatar).icon}<small>${escapeHTML(state.nickname||'Meu cantinho')}</small></div><div class="room-grid">${state.room.map((id,i)=>{const f=D.furniture.find(f=>f.id===id);return `<button class="room-slot" data-action="place" data-id="${i}" aria-label="${f?f.name:'Espaço livre'} ${i+1}">${f?f.icon:'＋'}</button>`}).join('')}</div></div><p class="instruction">${selectedFurniture?'👇 Toque em um lugar da casa.':'Escolha um móvel. Depois toque no lugar.'}</p><div class="furniture-grid">${D.furniture.map(f=>`<button class="choice-tile ${selectedFurniture===f.id?'selected':''}" data-action="furniture" data-id="${f.id}" ${!state.owned.includes(f.id)&&E.balance(state)<f.cost?'disabled':''}><span>${f.icon}</span><strong>${f.name}</strong><small>${state.owned.includes(f.id)?'✓ Meu móvel':`🌱 ${f.cost}`}</small></button>`).join('')}</div><p class="hint">Móveis comprados ficam guardados para sempre. Toque em um móvel da casa sem selecionar outro para guardá-lo. Reorganizar é grátis.</p>`, selectedFurniture?'Toque em um lugar da casa para colocar seu móvel.':'Escolha um móvel e depois um lugar da casa.');
  }
  function memoryMenu() {
    const sizes=[2,4,6,8,10];
    v2Shell('🦋 Memória dos Animais', `<p class="instruction">Quantas cartas vamos descobrir?</p><div class="shop-grid">${sizes.map((n,i)=>tile('memory-start',n,'🃏',`${n*2} cartas`,i>0&&!state.awards.includes('memory-'+sizes[i-1])&&state.settings.pairs!==n?'disabled':'')).join('')}</div><p class="hint">Complete um tamanho para abrir o próximo. Um adulto pode escolher qualquer tamanho nas configurações. Sem pressa, sem perder pontos.</p>`, 'Escolha a quantidade de cartas. Vamos encontrar os animais iguais.');
  }
  function lakeMenu() {
    v2Shell('💧 Água e Animais', `<div class="shop-grid">${tile('lake-clean','lago','🧺','Limpar o lago')}${D.habitats.map(h=>tile('habitat',h.id,h.icon,h.name+(state.awards.includes('habitat-'+h.id)?' ✓':''))).join('')}</div>`, 'Vamos cuidar do lago ou conhecer os animais? Escolha um desenho.');
  }
  function habitat(id) {
    const h=D.habitats.find(h=>h.id===id); if(!h) return;
    v2Shell(h.icon+' '+h.name, `<div class="habitat-scene ${id}"><span>${h.icon}</span></div><p class="instruction">${h.question}</p><div class="shop-grid">${h.choices.map((c,i)=>tile('habitat-answer',id+':'+i,c[0],c[1])).join('')}</div><p class="game-feedback" id="feedback" role="status"></p><div id="habitat-next"></div>`, h.question);
  }
  function puzzles() {
    puzzle=null;
    const sizes=[4,8,12,16,24,6,9];
    v2Shell('🧩 Quebra-cabeças', `<p class="instruction">Vamos montar nosso jardim?</p><div class="shop-grid">${sizes.map((n,i)=>tile('puzzle-start',n,'🧩',n+' peças',i>0&&!state.awards.includes('puzzle-'+n)&&!state.awards.includes('puzzle-'+sizes[i-1])&&![6,9].includes(n)?'disabled':'')).join('')}</div><p class="hint">Toque numa peça e depois no lugar dela. O desenho clarinho ajuda a encontrar o encaixe.</p>`, 'Escolha um quebra-cabeça. Começamos com quatro peças.');
  }
  function puzzleStart(n) {
    if(![4,6,8,9,12,16,24].includes(n)) return;
    const cols=n===4?2:n===6||n===9?3:n===24?6:4, rows=n/cols;
    puzzle={n,cols,rows,placed:[],selected:null,order:E.shuffle(Array.from({length:n},(_,i)=>i))}; drawPuzzle();
  }
  function pieceStyle(id) {
    return `background-image:url('assets/jardim-descobertas.png');background-size:${puzzle.cols*100}% ${puzzle.rows*100}%;background-position:${id%puzzle.cols/(puzzle.cols-1)*100}% ${Math.floor(id/puzzle.cols)/(puzzle.rows-1)*100}%;`;
  }
  function drawPuzzle() {
    const p=puzzle;
    v2Shell('🧩 Monte o jardim', `<div class="count-pill">${p.placed.length} / ${p.n} peças</div><div class="puzzle-board" style="--cols:${p.cols};--rows:${p.rows}">${Array.from({length:p.n},(_,i)=>`<button data-action="puzzle-slot" data-id="${i}" style="${pieceStyle(i)}" class="puzzle-slot ${p.placed.includes(i)?'filled':''}" aria-label="Encaixe ${i+1}" ${p.placed.includes(i)?'disabled':''}></button>`).join('')}</div><p class="instruction">${p.selected===null?'👇 Escolha uma peça':'☝️ Onde ela encaixa?'}</p><div class="puzzle-tray" style="--cols:${p.cols}">${p.order.filter(i=>!p.placed.includes(i)).map(i=>`<button style="${pieceStyle(i)}" data-action="puzzle-piece" data-id="${i}" aria-label="Peça ${i+1}" aria-pressed="${p.selected===i}" class="puzzle-piece ${p.selected===i?'selected':''}"></button>`).join('')}</div><p class="game-feedback" id="feedback" role="status"></p>`, p.selected===null?'Escolha uma peça e depois o lugar no desenho.':'Toque no lugar onde a peça encaixa.');
  }
  function celebrate(icon,title,message,action) {
    v2Shell(title, `<div class="reward"><div class="reward-medal">${icon}</div><p class="instruction">${message}</p><div class="button-row"><button class="primary-button" data-action="${action}">↩️ Continuar</button><button class="secondary-button" data-action="house">🏡 Minha casa</button></div></div>`, message);
  }
  function v2Action(action,id,button) {
    switch(action) {
      case 'farm': farm(); break;
      case 'sow-menu': sowMenu(Number(id)); break;
      case 'sow': sow(id); break;
      case 'sow-step': sowStep(id); break;
      case 'harvest': {
        const plot=state.plots[Number(id)]; if(!plot) break;
        if(E.harvest(state,Number(id))) { const c=D.crops.find(c=>c.id===plot.crop); save();render(); celebrate(c.icon,'🧺 Colheita na cesta!',c.tip+' Seu alimento está guardado.','farm'); }
        else { toast('🌱 Ainda está crescendo. Pode brincar em outro lugar!'); speak('A plantinha ainda está crescendo.'); } break;
      }
      case 'classic-plant': mission('plantar',true); break;
      case 'house': house(); break;
      case 'furniture': if(!state.owned.includes(id)&&!E.buy(state,id)) break; selectedFurniture=id;save();render();house();break;
      case 'place': {
        const i=Number(id);if(!Number.isInteger(i)||i<0||i>=6)break;
        if(selectedFurniture&&state.owned.includes(selectedFurniture)) { state.room=state.room.map(v=>v===selectedFurniture?null:v);state.room[i]=selectedFurniture;selectedFurniture=null; }
        else state.room[i]=null;
        save();house();break;
      }
      case 'kitchen': kitchen();break;
      case 'recipe': recipe(id);break;
      case 'recipe-ingredient':if(cooking){const r=D.recipes.find(r=>r.id===cooking.id);if(!Object.hasOwn(r.needs,id)){feedback('Observe os ingredientes da receita e tente outro.');break;}if(!cooking.selected.includes(id))cooking.selected.push(id);drawRecipe();}break;
      case 'cook-step':
        if(!cooking)break;
        if(Number(id)!==cooking.step) {feedback('Siga o desenho destacado. Um passo de cada vez.');break;}
        cooking.step++;
        if(cooking.step<4) drawRecipe();
        else {const r=D.recipes.find(r=>r.id===cooking.id);if(E.cook(state,r.id)){save();render();celebrate(r.icon,'🤝 Mesa de amigos','Você preparou e compartilhou! Os ingredientes vieram da horta, da fazendinha ou da despensa. Na vida real, prepare com um adulto.','kitchen');}cooking=null;}break;
      case 'memory-start': if(![2,3,4,6,8,10].includes(Number(id)))break;state.settings.pairs=Number(id);save();mission('animais',true);break;
      case 'lake-clean': mission('lago',true);break;
      case 'habitat': habitat(id);break;
      case 'habitat-answer': {
        const [hId,i]=id.split(':'),h=D.habitats.find(h=>h.id===hId);if(!h||!h.choices[Number(i)])break;
        if(!h.choices[Number(i)][2]){feedback('Vamos observar mais uma vez. Tente outro animal.');break;}
        const gained=E.award(state,'habitat-'+hId);save();render();feedback(h.fact);$('#habitat-next').innerHTML=`<p class="hint">${gained?'🌱 +2 sementes':'✓ Descoberta guardada'}</p><button class="primary-button" data-action="lake-menu">💧 Mais animais</button>`;break;
      }
      case 'lake-menu': lakeMenu();break;
      case 'puzzles': puzzles();break;
      case 'puzzle-start': puzzleStart(Number(id));break;
      case 'puzzle-piece': if(puzzle&&!puzzle.placed.includes(Number(id))){puzzle.selected=Number(id);drawPuzzle();}break;
      case 'puzzle-slot':
        if(!puzzle||puzzle.selected===null) {speak('Escolha uma peça primeiro.');break;}
        if(puzzle.selected!==Number(id)){feedback('Ainda não encaixou. Observe as cores e tente outro lugar.');break;}
        puzzle.placed.push(Number(id));puzzle.selected=null;
        if(puzzle.placed.length===puzzle.n){const gained=E.award(state,'puzzle-'+puzzle.n);save();render();puzzle=null;celebrate('🧩','Você montou o jardim!',gained?'Seu desenho ficou completo! Você ganhou duas sementes.':'Você montou de novo! Vamos descobrir outro tamanho?','puzzles');}else drawPuzzle();break;
      case 'chat':
        if(id==='no') {comfort('ouvir');break;}
        shell('Seu amigo está aqui','RODA DO SOL',`<div class="talk-friend">${D.avatars.find(a=>a.id===state.avatar).icon}</div><p class="instruction">Quer contar como está se sentindo?</p><div class="feelings-grid">${D.feelings.map(f=>tile('feeling',f.id,f.icon,f.name)).join('')}${tile('feeling','passar','🤷','Não sei / pular')}</div>`,'Quer contar como está se sentindo? Você também pode pular.');speak('Quer contar como está se sentindo? Você também pode pular.');break;
      default:return false;
    }
    return true;
  }

  // V3 — extensão integrada; preserva os ambientes e atividades da V2.
  let draft=null, roomName='room', quiz=null, shapePlay=null, backRoute='map', chestOpening=false;
  const petInfo=()=>D.pets.find(p=>p.id===state.pet);
  function heroPicture(id=state.hero,outfit=state.outfit,accessory=state.accessory){
    const h=D.heroes.find(h=>h.id===id)||D.heroes[0],o=D.outfits.find(o=>o.id===outfit);
    return `<svg class="hero-picture" viewBox="0 0 120 170" role="img" aria-label="${h.name}"><ellipse cx="60" cy="160" rx="38" ry="7" fill="#254a3420"/>${h.style==='long'?`<rect x="25" y="18" width="70" height="88" rx="30" fill="${h.hair}"/>`:''}${h.style==='puffs'?`<circle cx="25" cy="30" r="20" fill="${h.hair}"/><circle cx="95" cy="30" r="20" fill="${h.hair}"/>`:''}<path d="M42 115 L40 150 M78 115 L80 150" stroke="#436b88" stroke-width="21" stroke-linecap="round"/><path d="M33 92 L20 119 M87 92 L100 119" stroke="${h.skin}" stroke-width="15" stroke-linecap="round"/><rect x="31" y="75" width="58" height="53" rx="18" fill="${o?.color||h.shirt}"/><path d="M53 91 Q60 78 67 91 Q62 103 54 103Z" fill="#fff9cc"/><circle cx="60" cy="45" r="31" fill="${h.skin}"/><path d="M29 43 Q19 5 60 8 Q100 8 92 42 Q72 19 52 29 Q39 34 29 43" fill="${h.hair}"/><circle cx="48" cy="46" r="3" fill="#292322"/><circle cx="73" cy="46" r="3" fill="#292322"/><path d="M50 60 Q60 70 71 60" fill="none" stroke="#6f3b33" stroke-width="3" stroke-linecap="round"/>${accessory==='hat'?'<ellipse cx="60" cy="20" rx="44" ry="9" fill="#e5b857"/><path d="M33 18 L41 0 H79 L88 18Z" fill="#f6d47b"/>':''}${accessory==='bag'?'<rect x="80" y="87" width="20" height="32" rx="8" fill="#d97f54"/>':''}</svg>`;
  }
  function heroAndPet(){return `<div class="hero-pet">${heroPicture()}<span class="pet-bob pet-${state.pet}">${petInfo().icon}</span></div>`;}
  function renderV3(){
    $('#avatar-emoji').innerHTML=heroPicture(); $('#map-avatar').innerHTML=heroPicture();
    $('#avatar-name').textContent=state.nickname||'Meu personagem';
    $('#v3-chest-count').textContent=D.chests.filter(c=>E.discoveryCount(state)>=c.need&&!state.openedChests.includes(c.id)).length;
    $('#world-pet').textContent=petInfo().icon;
  }
  function showV3(title,body,narration,parent='map') {backRoute=parent;v2Shell(title,body,narration);}
  function customize(){
    draft=draft||{hero:state.hero,pet:state.pet,nickname:state.nickname};
    showV3('Quem vai explorar?',`<div class="customize-preview">${heroPicture(draft.hero)}<span>${D.pets.find(p=>p.id===draft.pet).icon}</span></div><label class="nickname-label">Meu nome ou apelido <input id="v3-name" maxlength="20" value="${escapeHTML(draft.nickname)}" placeholder="Pode deixar vazio" autocomplete="off"></label><h3>Meu personagem</h3><div class="hero-grid">${D.heroes.map(h=>`<button class="hero-option ${draft.hero===h.id?'selected':''}" data-action="hero-pick" data-id="${h.id}" aria-label="${h.name}" aria-pressed="${draft.hero===h.id}">${heroPicture(h.id,'','')}<small>${h.name}</small></button>`).join('')}</div><h3>Meu pet</h3><div class="pet-grid">${D.pets.map(p=>tile('pet-pick',p.id,p.icon,p.name,draft.pet===p.id?'aria-pressed="true"':'')).join('')}</div><button class="primary-button wide" data-action="customize-save">✅ Vamos brincar!</button><p class="hint">Apelido opcional, salvo só neste aparelho. Pode trocar depois.</p><button class="secondary-button" data-action="legacy-friends">🐢 Amigos do jardim</button>`,'Escolha seu personagem e seu pet. Depois toque no botão verde para brincar.');
  }
  function gamesHouse(){showV3('🎲 Casa de Jogos',`<div class="activity-grid">${tile('puzzles','','🧩','Quebra-cabeças')}${tile('memory-menu','','🃏','Memória')}${tile('shapes','','🔺','Montar figuras')}${tile('mini','sequencia','➡️','Sequências')}${tile('mini','associacao','🔗','Combinações')}${tile('mini','diferencas','🔎','Diferenças')}${tile('old-feelings','','💛','Roda do Sol')}</div>`,'Escolha uma brincadeira. Você pode voltar quando quiser.');}
  function inventory(){showV3('🎒 Minha mochila',`${basketView()}<div class="activity-grid">${tile('wardrobe','','👕','Roupas')}${tile('chests','','🎁','Meus baús')}${tile('house','','🛋️','Móveis')}${tile('album','','📖','Descobertas')}${tile('craft-menu','','🧶','Criar com lã')}</div><p class="hint">${E.discoveryCount(state)} descobertas · ${state.meals} receitas preparadas</p>`,'Aqui ficam seus alimentos, roupas, móveis e descobertas.');}
  function farmyard(){showV3('🐄 Fazendinha',`<div class="animal-meadow">${D.farmAnimals.map((a,i)=>`<button class="animal-card ${state.farm[a.id]?.mode||'walk'}" data-action="animal" data-id="${a.id}" style="--delay:${i*-.4}s"><span>${a.icon}</span><strong>${a.name}</strong><small>${a.resource&&state.farm[a.id]?.readyAt?Date.now()>=state.farm[a.id].readyAt?'🧺 Pronto':'💤 Descansando':'💛 Cuidar'}</small></button>`).join('')}</div>${basketView()}`,'Toque em um animal para cuidar dele. Água, alimento e descanso vêm primeiro.');}
  function animalRoom(id){
    const a=D.farmAnimals.find(a=>a.id===id);if(!a)return;
    const f=state.farm[id]||{},waiting=f.readyAt>Date.now(),ready=f.readyAt&&Date.now()>=f.readyAt;
    showV3(a.icon+' '+a.name,`<div class="animal-stage ${f.mode||'walk'}"><span>${a.icon}</span><div>${f.mode==='eat'?'🌾':f.mode==='rest'?'💤':f.mode==='mud'?'🟤💦':'💛'}</div></div><p class="instruction">${a.fact}</p><div class="activity-grid">${tile('animal-care',id+':food','🌾',(f.fed?'✓ ':'')+a.food,waiting?'disabled':'')}${tile('animal-care',id+':water','💧',(f.water?'✓ ':'')+'Água',waiting?'disabled':'')}${tile('animal-care',id+':rest','💤',(f.rest?'✓ ':'')+'Descanso',waiting?'disabled':'')}${tile('animal-care',id+':play',id==='pig'?'🟤':'🐾','Brincar',waiting?'disabled':'')}</div>${a.resource?`<button class="primary-button wide" data-action="animal-collect" data-id="${id}" ${ready?'':'disabled'}>${D.ingredients.find(i=>i.id===a.resource).icon} ${ready?'Coletar':waiting?'Descansando…':'Cuide primeiro'}</button>`:''}${id==='horse'?'<button class="secondary-button wide" data-action="horse-count">🐴 Contar passos</button>':''}`,waiting?'Agora o animal descansa um pouquinho.':a.fact,'farmyard');
    if(waiting)delay(()=>animalRoom(id),Math.max(20,f.readyAt-Date.now()+30));
  }
  function houseV3(){
    const items=state[roomName];
    showV3('🌳 Casa da Árvore',`<nav class="room-tabs">${tile('room','room','🛏️','Quarto')}${tile('room','living','🛋️','Sala')}${tile('kitchen','','🥣','Cozinha')}${tile('garden','','🌼','Jardim')}</nav><div class="room room-v3"><div class="room-window">🌤️ 🌳</div><div class="resident-v3">${heroAndPet()}</div><div class="room-grid">${items.map((id,i)=>{const f=D.furniture.find(f=>f.id===id);return `<button class="room-slot" data-action="place-v3" data-id="${i}" aria-label="${f?f.name:'Lugar livre'} ${i+1}">${f?f.icon:'＋'}</button>`}).join('')}</div></div><div class="button-row"><button class="primary-button" data-action="pet-home">${petInfo().icon} Cuidar do pet</button><button class="secondary-button" data-action="wardrobe">👕 Vestir</button></div><p class="instruction">${selectedFurniture?'Toque no lugar do móvel.':'Escolha um móvel e depois um lugar.'} 🌱 ${E.balance(state)}</p><div class="furniture-grid">${D.furniture.map(f=>`<button class="choice-tile ${selectedFurniture===f.id?'selected':''}" data-action="furniture" data-id="${f.id}" ${!state.owned.includes(f.id)&&E.balance(state)<f.cost?'disabled':''}><span>${f.icon}</span><strong>${f.name}</strong><small>${state.owned.includes(f.id)?'✓ Meu móvel':'🌱 '+f.cost}</small></button>`).join('')}</div>`,'Bem-vindo à sua casa. Escolha um cômodo, cuide do pet ou decore.');
  }
  function wardrobe(){showV3('👕 Meu guarda-roupa',`${heroAndPet()}<div class="shop-grid">${D.outfits.map(o=>tile('dress',o.id,o.icon,o.name,state.outfits.includes(o.id)?'':'disabled')).join('')}${D.accessories.map(a=>tile('accessory',a.id,a.icon,a.name,state.accessories.includes(a.id)?'':'disabled')).join('')}${tile('accessory','','🙌','Sem acessório')}</div><div class="button-row"><button class="secondary-button" data-action="customize">👤 Trocar personagem e pet</button><button class="secondary-button" data-action="chests">🎁 Conquistar roupas</button></div>`,'Escolha uma roupa. As novas roupas chegam nos baús de descobertas.','house');}
  function petHome(){
    const p=petInfo(),c=state.petCare;
    showV3(p.icon+' Meu pet',`<div class="pet-stage pet-${p.id}"><span>${p.icon}</span><b>${!c.food?'🥣':!c.rest?'💤':!c.play?'🎾':'😊💛'}</b></div><p class="instruction">${p.phrase}</p><div class="activity-grid">${[['food','🥣',p.food],['rest','💤','Descansar'],['play','🎾','Brincar'],['affection','💛','Carinho'],['brush','🪮','Escovar'],['vet','🩺','Veterinário']].map(([id,icon,name])=>tile('pet-care',id,icon,(c[id]?'✓ ':'')+name)).join('')}</div><p class="hint">Os cuidados são convites para brincar. Seu pet fica seguro quando você sai. A comida dele é própria para a espécie, separada das receitas das crianças.</p>`,'Vamos cuidar do seu pet? Escolha um cuidado.','house');
  }
  function petCareAction(id){
    if(!Object.hasOwn(state.petCare,id))return;
    state.petCare[id]=true;E.award(state,'pet-'+id);save();render();
    const messages={food:'Seu pet recebeu '+petInfo().food+'. A comida dele é diferente da nossa.',rest:'Um cantinho tranquilo para descansar. Você também pode fazer uma pausa.',play:'Vamos brincar com carinho! Na vida real, brinque com o pet acompanhado de um adulto.',affection:'Carinho leve, respeitando o espaço do animal. Se ele se afastar, dê espaço.',brush:'Escove com suavidade e com a ajuda de um adulto.',vet:'No faz de conta, observamos olhos, orelhas e pelos. Se algo preocupa você na vida real, chame um adulto e um veterinário. Não dê remédios por conta própria.'};
    showV3('💛 Um cuidado especial',`<div class="pet-stage happy"><span>${petInfo().icon}</span><b>${id==='rest'?'💤':'💛'}</b></div><p class="instruction">${messages[id]}</p><button class="primary-button wide" data-action="pet-home">🐾 Voltar ao pet</button>`,messages[id],'pet-home');
  }
  function rewardItem(type,id){const list=type==='furniture'?D.furniture:type==='outfit'?D.outfits:D.accessories;return list.find(i=>i.id===id);}
  function chests(){showV3('🎁 Baús de descobertas',`<p class="instruction">${E.discoveryCount(state)} descobertas guardadas</p><div class="chest-list">${D.chests.map(c=>`<article class="chest-card"><span class="chest-icon">${state.openedChests.includes(c.id)?'📦':'🎁'}</span><h3>${c.name}</h3><p>${c.items.map(([t,id])=>{const i=rewardItem(t,id);return i.icon+' '+i.name}).join(' + ')}</p><button class="primary-button" data-action="open-chest" data-id="${c.id}" ${state.openedChests.includes(c.id)||E.discoveryCount(state)<c.need?'disabled':''}>${state.openedChests.includes(c.id)?'✓ Já guardado':E.discoveryCount(state)>=c.need?'✨ Abrir':`${E.discoveryCount(state)}/${c.need} descobertas`}</button></article>`).join('')}</div><p class="hint">Você vê os prêmios antes de abrir. Não há sorteio, compra ou prêmio pago.</p>`,'Os baús chegam com suas descobertas. Cada baú mostra o que tem dentro.','inventory');}
  function openChest(id){
    if(chestOpening||!E.openChest(state,id))return;
    chestOpening=true;save();render();const c=D.chests.find(c=>c.id===id);
    showV3('✨ Uma surpresa conhecida!',`<div class="chest-opening">🎁</div><div class="reward-reveal">${c.items.map(([t,id])=>{const i=rewardItem(t,id);return `<div class="choice-tile"><span>${i.icon}</span><strong>${i.name}</strong></div>`}).join('')}</div><p class="instruction">Tudo guardado na sua mochila!</p><button class="primary-button wide" data-action="inventory">🎒 Ver meus presentes</button>`,'Você ganhou '+c.items.map(([t,id])=>rewardItem(t,id).name).join(' e ')+'. Tudo está na sua mochila.','chests');chestOpening=false;
  }
  function craftMenu(){showV3('🧶 Criar com lã',`${basketView()}<div class="shop-grid">${['blanket','rug'].map(id=>{const f=D.furniture.find(f=>f.id===id);return tile('craft',id,f.icon,f.name+' · 🧶 2',state.owned.includes(id)||(state.basket.la||0)<2?'disabled':'')}).join('')}</div><button class="secondary-button wide" data-action="farmyard">🐑 Visitar a ovelha</button>`,'Duas porções de lã viram uma manta ou um tapete.','inventory');}
  function school(){showV3('🏫 Escolinha',`<div class="activity-grid">${D.subjects.map(s=>tile('subject',s.id,s.icon,s.name)).join('')}${tile('geography','','🌍','Brasil e Mundo')}</div>`,'Escolha o que vamos descobrir hoje.');}
  function subjectMenu(id){const s=D.subjects.find(s=>s.id===id);if(!s)return;showV3(s.icon+' '+s.name,`<div class="shop-grid">${s.levels.map((_,i)=>tile('lesson',id+':'+i,['🌱','🌿','🌳'][i],'Descoberta '+(i+1),i>0&&!state.awards.includes('school-'+id+'-'+(i-1))?'disabled':'')).join('')}</div>`,'Comece pela primeira descoberta. Você pode repetir qualquer atividade já aberta.','school');}
  function beginQuiz(list,key,title,parent){quiz={list:E.shuffle(list),key,title,parent,index:0,answered:false};drawQuiz();}
  function drawQuiz(){const q=quiz.list[quiz.index];showV3(quiz.title,`<div class="sequence">${quiz.list.map((_,i)=>`<span class="${i===quiz.index?'current':i<quiz.index?'done':''}">${i<quiz.index?'⭐':'○'}</span>`).join('')}</div><p class="question">${q.prompt}</p>${q.lang==='en-US'?`<button class="secondary-button" data-action="english-word">🔊 Ouvir em inglês</button>`:''}<div class="quiz-choices">${q.choices.map((choice,i)=>`<div><button class="choice-tile" data-action="quiz-answer" data-id="${i}"><span>${choice}</span></button><button class="listen-choice" data-action="listen-choice" data-id="${i}" aria-label="Ouvir opção ${i+1}">🔊</button></div>`).join('')}</div><p id="feedback" class="game-feedback" role="status"></p><div id="quiz-next"></div>`,q.prompt,quiz.parent);}
  function answerQuiz(index){
    if(!quiz||quiz.answered)return;const q=quiz.list[quiz.index];
    if(index!==q.answer){feedback('Vamos observar mais uma vez. Você pode tentar de novo.');return;}
    quiz.answered=true;feedback(q.fact);$('#quiz-next').innerHTML='<button class="primary-button wide" data-action="quiz-next">⭐ Continuar</button>';
  }
  function nextQuiz(){if(!quiz?.answered)return;quiz.index++;quiz.answered=false;if(quiz.index<quiz.list.length)return drawQuiz();const saved=quiz;E.award(state,saved.key);save();render();quiz=null;showV3('🌟 Descoberta completa!',`<div class="reward-medal">🌟</div><p class="instruction">Você descobriu coisas novas!</p><div class="button-row"><button class="primary-button" data-action="${saved.parent}">↩️ Escolher outra</button><button class="secondary-button" data-action="chests">🎁 Ver baús</button><button class="secondary-button" data-action="close">🗺️ Voltar ao mapa</button></div>`,'Você completou esta descoberta. Pode escolher outra, repetir ou fazer uma pausa.',saved.parent);}
  function shapesMenu(){showV3('🔺 Montagem de figuras',`<div class="shop-grid">${D.shapeScenes.map(s=>tile('shape-start',s.id,s.icon,s.name)).join('')}</div>`,'Vamos montar uma figura com formas.','games');}
  function shapeStart(id){const scene=D.shapeScenes.find(s=>s.id===id);if(!scene)return;shapePlay={scene,step:0};drawShapes();}
  function shapeArt(){const s=shapePlay.scene,step=shapePlay.step;const layouts={casa:[['triangle',100,28,90],['square',100,100,90],['square',100,124,30],['circle',100,62,16]],arvore:[['circle',70,65,64],['circle',130,65,64],['square',100,125,35],['triangle',100,32,80]],peixe:[['circle',90,80,75],['triangle',155,80,65],['circle',77,67,10],['square',98,111,23]],robo:[['square',100,60,64],['square',100,119,75],['circle',88,55,12],['triangle',100,12,28]]};return `<svg viewBox="0 0 200 180" class="shape-art" role="img" aria-label="Figura ${s.name} em montagem">${layouts[s.id].map(([type,x,y,size],i)=>{const color=i<step?['#e9ae46','#75af80','#74acda','#cc7eb1'][i]:'#e5e9df',attrs=`fill="${color}" stroke="#74876c" stroke-width="2" stroke-dasharray="${i<step?'0':'4'}"`;return type==='circle'?`<circle cx="${x}" cy="${y}" r="${size/2}" ${attrs}/>`:type==='square'?`<rect x="${x-size/2}" y="${y-size/2}" width="${size}" height="${size}" rx="3" ${attrs}/>`:`<path d="M${x} ${y-size/2} L${x+size/2} ${y+size/2} L${x-size/2} ${y+size/2}Z" ${attrs}/>`}).join('')}</svg>`;}
  function drawShapes(){const labels={triangle:['🔺','Triângulo'],square:['🟦','Quadrado'],circle:['🟡','Círculo']},next=shapePlay.scene.pieces[shapePlay.step];showV3('Montar: '+shapePlay.scene.name,`${shapeArt()}<p class="instruction">${labels[next][0]} Escolha: ${labels[next][1]}</p><div class="shop-grid">${Object.entries(labels).map(([id,a])=>tile('shape-piece',id,a[0],a[1])).join('')}</div><p id="feedback" class="game-feedback" role="status"></p>`,'Agora escolha '+labels[next][1]+'.','shapes');}
  function soundTap(){if(!state.settings.sounds)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audioContext=audioContext||new AC();audioContext.resume();const o=audioContext.createOscillator(),g=audioContext.createGain();o.connect(g);g.connect(audioContext.destination);o.frequency.value=580;g.gain.setValueAtTime(.025,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.09);o.start();o.stop(audioContext.currentTime+.1);}catch(_){}}
  let audioContext=null;
  function readEnglish(word){if(!canSpeak)return;stopVoice();const u=new SpeechSynthesisUtterance(word);u.lang='en-US';u.rate=.78;u.pitch=1.15;const voice=speechSynthesis.getVoices().find(v=>v.lang.startsWith('en'));if(voice)u.voice=voice;speechSynthesis.speak(u);}
  function v3Action(action,id,button){
    switch(action){
      case 'legacy-friends':avatars();break;
      case 'customize':draft=null;customize();break;
      case 'hero-pick':case 'pet-pick':draft.nickname=$('#v3-name')?.value||'';if(action==='hero-pick'&&D.heroes.some(h=>h.id===id))draft.hero=id;if(action==='pet-pick'&&D.pets.some(p=>p.id===id))draft.pet=id;customize();break;
      case 'customize-save':state.nickname=($('#v3-name')?.value||'').trim().slice(0,20);state.hero=draft.hero;state.pet=draft.pet;state.customized=true;state.welcomed=true;draft=null;save();render();close();speak('Vamos explorar! Toque em um lugar no mapa.');break;
      case 'games':gamesHouse();break;
      case 'memory-menu':memoryMenu();break;
      case 'old-feelings':mission('sentir',true);break;
      case 'inventory':inventory();break;
      case 'farmyard':farmyard();break;
      case 'animal':animalRoom(id);break;
      case 'animal-care':{const[a,c]=id.split(':');E.farmCare(state,a,c);save();render();animalRoom(a);break;}
      case 'animal-collect':if(E.farmCollect(state,id)){save();render();celebrate('🧺','Coleta com cuidado','O alimento ou a lã está na sua mochila.','farmyard');}break;
      case 'horse-count':beginQuiz(D.subjects.find(s=>s.id==='matematica').levels[0],'school-matematica-0','🐴 Contando com o cavalo','farmyard');break;
      case 'room':if(['room','living'].includes(id))roomName=id;house();break;
      case 'place-v3':{const i=Number(id);if(!Number.isInteger(i)||i<0||i>=6)break;if(selectedFurniture&&state.owned.includes(selectedFurniture)){state.room=state.room.map(v=>v===selectedFurniture?null:v);state.living=state.living.map(v=>v===selectedFurniture?null:v);state[roomName][i]=selectedFurniture;selectedFurniture=null;}else state[roomName][i]=null;save();house();break;}
      case 'wardrobe':wardrobe();break;
      case 'dress':if(state.outfits.includes(id)){state.outfit=id;save();render();wardrobe();}break;
      case 'accessory':if(!id||state.accessories.includes(id)){state.accessory=id;save();render();wardrobe();}break;
      case 'pet-home':petHome();break;
      case 'pet-care':petCareAction(id);break;
      case 'chests':chests();break;
      case 'open-chest':openChest(id);break;
      case 'craft-menu':craftMenu();break;
      case 'craft':if(E.craft(state,id)){save();render();celebrate('🧶','Feito por você!','Sua criação está nos móveis da casa.','house');}break;
      case 'school':school();break;
      case 'subject':subjectMenu(id);break;
      case 'lesson':{const[subject,level]=id.split(':'),s=D.subjects.find(s=>s.id===subject),n=Number(level);if(s?.levels[n]&&(n===0||state.awards.includes('school-'+subject+'-'+(n-1))))beginQuiz(s.levels[n],'school-'+subject+'-'+n,s.icon+' '+s.name,'school');break;}
      case 'mini':if(D.miniGames[id])beginQuiz(D.miniGames[id],'mini-'+id,'🎲 '+{sequencia:'Sequências',associacao:'Combinações',diferencas:'Diferenças'}[id],'games');break;
      case 'quiz-answer':answerQuiz(Number(id));break;
      case 'quiz-next':nextQuiz();break;
      case 'listen-choice':if(quiz)speak(quiz.list[quiz.index].choices[Number(id)],true);break;
      case 'english-word':if(quiz)readEnglish(quiz.list[quiz.index].prompt.split('.')[0]);break;
      case 'shapes':shapesMenu();break;
      case 'shape-start':shapeStart(id);break;
      case 'shape-piece':if(shapePlay){if(shapePlay.scene.pieces[shapePlay.step]!==id){feedback('Observe a forma indicada e tente outra vez.');break;}shapePlay.step++;if(shapePlay.step===shapePlay.scene.pieces.length){E.award(state,'shape-'+shapePlay.scene.id);save();render();celebrate(shapePlay.scene.icon,'Figura montada!','Você combinou formas e criou uma figura.','shapes');shapePlay=null;}else drawShapes();}break;
      case 'pan-region':{const newer=id==='vale';$('#world').hidden=newer;$('#vale-world').hidden=!newer;document.querySelectorAll('[data-action="pan-region"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===id)));speak(newer?'Bem-vindo ao Vale. Temos a Fazendinha, a Escolinha e a Casa de Jogos.':'De volta ao Jardim.');break;}
      case 'go-back':if(backRoute==='map')close();else if(!v3Action(backRoute,'',button)&&!v2Action(backRoute,'',button))close();break;
      case 'pantry':state.basket.aveia=Math.max(1,state.basket.aveia||0);save();kitchen();break;
      case 'geography':geography();break;
      case 'geo-category':geoCategory(id);break;
      case 'geo-card':geoCard(id);break;
      case 'geo-game':geoGame(id);break;
      default:return false;
    }return true;
  }

  const geoGroups={biomas:['🌳','Biomas do Brasil'],estados:['🗺️','Estados e capitais'],cidades:['🏘️','Cidades'],paises:['🌍','Países e bandeiras']};
  function flagArt(item){return item.flag?`<img class="geo-flag" src="assets/bandeiras/${item.flag}" alt="Bandeira de ${item.name}">`:`<span class="geo-emoji">${item.icon||'📍'}</span>`;}
  function geography(){showV3('🌍 Brasil e Mundo',`<div class="geo-welcome">🌎 <span>Um mundo para conhecer e cuidar</span></div><div class="activity-grid">${Object.entries(geoGroups).map(([id,a])=>tile('geo-category',id,a[0],a[1])).join('')}</div><p class="hint">Bandeiras representam lugares. Todas as pessoas merecem respeito, em qualquer lugar do mundo.</p>`,'Vamos conhecer paisagens, estados, cidades e países. Escolha um desenho.','school');}
  function geoCategory(id){const group=geoGroups[id];if(!group)return;showV3(group[0]+' '+group[1],`${id==='estados'?'<p class="instruction">O Brasil tem 26 estados e o Distrito Federal. Brasília é a capital do país.</p>':''}<button class="primary-button wide" data-action="geo-game" data-id="${id}">🎲 Vamos brincar!</button><div class="geo-grid">${D.geography[id].map(item=>`<button class="geo-card" data-action="geo-card" data-id="${id}:${item.id}">${flagArt(item)}<strong>${item.name}</strong><small>🔊 Explorar</small></button>`).join('')}</div>`,group[1]+'. Toque numa imagem para ouvir e descobrir.','geography');}
  function geoCard(key){const [group,id]=key.split(':'),item=D.geography[group]?.find(i=>i.id===id);if(!item)return;showV3(item.name,`<div class="geo-detail ${group==='biomas'?'biome-'+id:''}">${flagArt(item)}${item.scene?`<div class="biome-scene" aria-label="Ilustração simbólica da paisagem">${item.scene}</div>`:''}</div><p class="instruction">${item.fact}</p>${item.location?`<p class="geo-location">${item.location}</p>`:''}<div class="button-row"><button class="primary-button" data-action="read">🔊 Ouvir</button><button class="secondary-button" data-action="geo-category" data-id="${group}">↩️ Mais lugares</button><button class="secondary-button" data-action="geo-game" data-id="${group}">🎲 Brincar</button></div>`,item.name+'. '+item.fact+' '+(item.location||''),'geography');}
  function geoGame(group){if(!D.geoQuizzes[group])return;beginQuiz(D.geoQuizzes[group],'geo-'+group,'🌍 '+geoGroups[group][1],'geography');}

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    const { action, id } = button.dataset;
    soundTap();
    if (v3Action(action,id,button) || v2Action(action,id,button)) return;
    switch (action) {
      case 'mission': mission(id); break;
      case 'close': close(); break;
      case 'read': speak(content.dataset.narration || '', true); break;
      case 'help': help(); break;
      case 'garden': garden(); break;
      case 'album': album(); break;
      case 'avatar': draft=null;customize(); break;
      case 'choose-avatar':
        if (!D.avatars.some(a => a.id === id)) break;
        state.avatar = id; state.nickname = ($('#nickname') ? $('#nickname').value : state.nickname).trim().slice(0,20); state.welcomed = true; save(); render(); close(); toast('Seu companheiro já está no jardim!'); speak('Olá! Toque em um lugar para brincar. Na árvore fica a sua casa!'); break;
      case 'buy-plant':
        if (E.plant(state, id)) { save(); render(); garden(); speak('Mais uma cor para o seu jardim!'); } break;
      case 'remove-plant':
        if (E.removePlant(state, Number(button.dataset.index))) { save(); render(); garden(); } break;
      case 'plant-step': plantStep(Number(button.dataset.step)); break;
      case 'collect': collect(id, button); break;
      case 'card': card(Number(button.dataset.card)); break;
      case 'feeling': feeling(id); break;
      case 'comfort': comfort(id); break;
      case 'finish': finish(); break;
      case 'parents': parents(); break;
      case 'reset-confirm': resetConfirm(); break;
      case 'reset': state = E.initial(); save(); render(); close(); draft=null;customize();toast('Um novo jardim espera por você.'); break;
      case 'export': exportProgress(); break;
      case 'toggle-voice':
        if (!canSpeak) { toast('A leitura em voz alta não está disponível neste navegador.'); break; }
        state.settings.voice = !state.settings.voice; save(); render();
        if (state.settings.voice) speak('Olá! Escolha um lugar no mapa. Vamos descobrir juntos.');
        else stopVoice();
        break;
    }
  });
  document.addEventListener('change', event => {
    const target = event.target;
    if (target.id === 'setting-voice') {
      state.settings.voice = target.checked;
      if (!target.checked) stopVoice(); else speak('A leitura em voz alta está ligada.');
    } else if (target.id === 'setting-sounds') state.settings.sounds=target.checked;
    else if (target.id === 'setting-motion') state.settings.reducedMotion = target.checked;
    else if (target.id === 'setting-pairs') state.settings.pairs = [2,3,4,6,8,10].includes(Number(target.value)) ? Number(target.value) : 3;
    else return;
    save(); render();
  });
  panel.addEventListener('cancel', event => { event.preventDefault(); close(); });
  panel.addEventListener('click', event => { if (event.target === panel) close(); });
  window.addEventListener('pagehide', stopVoice);
  if (!loaded.available) storageNotice();
  render();
  if (!state.customized) customize();
})();
