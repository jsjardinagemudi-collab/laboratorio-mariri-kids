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
  }
  function shell(title, label, body, instruction = '') {
    if (!panel.open) opener = document.activeElement;
    content.innerHTML = `<header class="panel-head"><div><div class="eyebrow">${label}</div><h2 id="panel-title" tabindex="-1">${title}</h2></div><div class="panel-head-actions"><button class="icon-button" data-action="read" aria-label="Ouvir instruções">🔊</button><button class="icon-button close-button" data-action="close" aria-label="Voltar ao mapa">×</button></div></header><div class="panel-body">${body}</div>`;
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
    shell('Para quem cuida', 'ACOMPANHAR TAMBÉM É BRINCAR', `<p class="parents-copy">Primeira ideia jogável para crianças de 4 a 8 anos. Convide a criança a escolher, leia junto quando necessário e faça pausas. Os tempos das aventuras são apenas estimativas, sem contagem regressiva.</p><label class="settings-row"><span><strong>Leitura em voz alta</strong><small>Usa a voz disponível no navegador. Ative com um toque.</small></span><input type="checkbox" id="setting-voice" ${state.settings.voice ? 'checked' : ''} ${!canSpeak ? 'disabled' : ''}></label><label class="settings-row"><span><strong>Reduzir movimentos</strong><small>Deixa as transições mais tranquilas.</small></span><input type="checkbox" id="setting-motion" ${state.settings.reducedMotion ? 'checked' : ''}></label><label class="settings-row"><span><strong>Jogo dos animais</strong><small>Escolha a quantidade de pares.</small></span><select id="setting-pairs"><option value="3" ${state.settings.pairs === 3 ? 'selected' : ''}>3 pares</option><option value="4" ${state.settings.pairs === 4 ? 'selected' : ''}>4 pares</option>${[6,8,10].map(n=>`<option value="${n}" ${state.settings.pairs===n?'selected':''}>${n} pares (${n*2} cartas)</option>`).join('')}</select></label><section class="parent-info"><h3>Um espaço para experimentar</h3><ul><li>Sem anúncios, compras, chat ou ranking.</li><li>Sem cadastro, foto ou localização. O apelido é opcional e fica apenas neste aparelho.</li><li>As respostas sobre sentimentos não são salvas nem avaliadas.</li><li>Ficam neste navegador o apelido opcional, personagem, conquistas, jardim, casa, alimentos e preferências. Respostas da conversa não ficam salvas.</li><li>Não há sincronização entre aparelhos. Apagar os dados do navegador apaga o progresso.</li></ul></section><p class="parents-copy">Este é um protótipo educativo, não uma ferramenta de avaliação ou tratamento. A identidade visual infantil está em fase de proposta. A leitura usa os recursos do dispositivo e pode depender da disponibilidade de vozes.</p><div class="button-row"><button class="secondary-button" data-action="export">Baixar meu progresso</button><button class="secondary-button danger-button" data-action="reset-confirm">Recomeçar o jardim</button></div>`, 'Configure o jogo e acompanhe as descobertas da criança.');
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
    freshPanel(); shell(title,'JARDIM DAS DESCOBERTAS · V2',body,instruction); speak(instruction);
  }
  function basketView() {
    return `<div class="basket" aria-label="Minha cesta">🧺 ${D.crops.map(c=>`<span title="${c.name}">${c.icon} <b>${state.basket[c.id]||0}</b></span>`).join('')}</div>`;
  }
  function farm() {
    const count=state.harvested.length;
    v2Shell('🌱 Horta da Terra', `<div class="garden-summary"><strong>🌿 Descobertas ${count}/4</strong><button class="secondary-button" data-action="kitchen">🧺 → 🥗</button></div>${basketView()}<div class="farm-plots">${state.plots.map((plot,i)=>{
      if(!plot) return `<button class="plot empty" data-action="sow-menu" data-id="${i}" aria-label="Plantar no canteiro ${i+1}"><span>🟤</span><strong>🌱 Plantar</strong></button>`;
      const c=D.crops.find(c=>c.id===plot.crop), ready=Date.now()>=plot.readyAt;
      return `<button class="plot ${ready?'ripe':''}" data-action="harvest" data-id="${i}"><span>${ready?c.icon:'🌱'}</span><strong>${ready?'🧺 Colher':c.name}</strong><small>${ready?'Prontinho!':'Crescendo · em breve'}</small></button>`;
    }).join('')}</div><p class="hint">Aqui o crescimento leva 30 segundos. Na natureza, leva muito mais tempo. Sua horta espera por você.</p><div class="button-row"><button class="secondary-button" data-action="farm">🔄 Ver crescimento</button><button class="secondary-button" data-action="classic-plant">🌻 Primeira brincadeira</button></div>`, 'Toque na terra para plantar. Quando a planta crescer, toque na cesta para colher.');
    const waiting=state.plots.filter(p=>p&&p.readyAt>Date.now());
    if(waiting.length) delay(farm,Math.max(50,Math.min(...waiting.map(p=>p.readyAt))-Date.now()+50));
  }
  function sowMenu(index) {
    if(!Number.isInteger(index)||index<0||index>2||state.plots[index]) return;
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
    v2Shell('🥗 Cozinha do Jardim', `${basketView()}<p class="instruction">Escolha o que vamos preparar.</p><div class="shop-grid">${D.recipes.map(r=>`<button class="choice-tile" data-action="recipe" data-id="${r.id}" ${Object.entries(r.needs).every(([id,n])=>(state.basket[id]||0)>=n)?'':'disabled'}><span>${r.icon}</span><strong>${r.name}</strong><small>${Object.entries(r.needs).map(([id,n])=>`${D.crops.find(c=>c.id===id).icon} ${n}`).join(' + ')}</small></button>`).join('')}</div><div class="button-row"><button class="primary-button" data-action="farm">🌱 Buscar alimentos</button></div><p class="hint">Brincadeira virtual. Na cozinha de verdade, participe com um adulto. Não usamos facas nem fogão neste jogo.</p>`, 'Veja sua cesta. Colha os ingredientes na horta para preparar uma comida.');
  }
  function recipe(id) {
    const r=D.recipes.find(r=>r.id===id);
    if(!r || !Object.entries(r.needs).every(([c,n])=>(state.basket[c]||0)>=n)) return;
    cooking={id,step:0}; drawRecipe();
  }
  function drawRecipe() {
    const r=D.recipes.find(r=>r.id===cooking.id), steps=[['🧺','Separar'],['💧','Lavar'],['🥣','Misturar'],['🤝','Servir']];
    v2Shell(r.icon+' '+r.name, `<div class="sequence">${steps.map((x,i)=>`<span class="${i===cooking.step?'current':i<cooking.step?'done':''}">${x[0]}</span>`).join('')}</div><div class="growing-stage"><span class="plant-stage-emoji">${cooking.step===3?r.icon:steps[cooking.step][0]}</span></div><div class="shop-grid">${steps.map((x,i)=>tile('cook-step',i,x[0],x[1])).join('')}</div><p class="game-feedback" id="feedback" role="status"></p>`, 'Agora vamos '+steps[cooking.step][1].toLowerCase()+'.');
  }
  function house() {
    v2Shell('🏡 Minha Casa na Árvore', `<div class="garden-summary"><strong>🌱 ${E.balance(state)} sementes</strong><button class="secondary-button" data-action="garden">🌷 Jardim</button></div><div class="room"><div class="room-window">🌤️ 🌳</div><div class="room-resident">${D.avatars.find(a=>a.id===state.avatar).icon}<small>${escapeHTML(state.nickname||'Meu cantinho')}</small></div><div class="room-grid">${state.room.map((id,i)=>{const f=D.furniture.find(f=>f.id===id);return `<button class="room-slot" data-action="place" data-id="${i}" aria-label="${f?f.name:'Espaço livre'} ${i+1}">${f?f.icon:'＋'}</button>`}).join('')}</div></div><p class="instruction">${selectedFurniture?'👇 Toque em um lugar da casa.':'Escolha um móvel. Depois toque no lugar.'}</p><div class="furniture-grid">${D.furniture.map(f=>`<button class="choice-tile ${selectedFurniture===f.id?'selected':''}" data-action="furniture" data-id="${f.id}" ${!state.owned.includes(f.id)&&E.balance(state)<f.cost?'disabled':''}><span>${f.icon}</span><strong>${f.name}</strong><small>${state.owned.includes(f.id)?'✓ Meu móvel':`🌱 ${f.cost}`}</small></button>`).join('')}</div><p class="hint">Móveis comprados ficam guardados para sempre. Toque em um móvel da casa sem selecionar outro para guardá-lo. Reorganizar é grátis.</p>`, selectedFurniture?'Toque em um lugar da casa para colocar seu móvel.':'Escolha um móvel e depois um lugar da casa.');
  }
  function memoryMenu() {
    const sizes=[3,4,6,8,10];
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
    const sizes=[4,6,9,12];
    v2Shell('🧩 Quebra-cabeças', `<p class="instruction">Vamos montar nosso jardim?</p><div class="shop-grid">${sizes.map((n,i)=>tile('puzzle-start',n,'🧩',n+' peças',i>0&&!state.awards.includes('puzzle-'+sizes[i-1])?'disabled':'')).join('')}</div><p class="hint">Toque numa peça e depois no lugar dela. O desenho clarinho ajuda a encontrar o encaixe.</p>`, 'Escolha um quebra-cabeça. Começamos com quatro peças.');
  }
  function puzzleStart(n) {
    if(![4,6,9,12].includes(n)) return;
    const cols=n===4?2:n===6?3:n===9?3:4, rows=n/cols;
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
      case 'cook-step':
        if(!cooking)break;
        if(Number(id)!==cooking.step) {feedback('Siga o desenho destacado. Um passo de cada vez.');break;}
        cooking.step++;
        if(cooking.step<4) drawRecipe();
        else {const r=D.recipes.find(r=>r.id===cooking.id);if(E.cook(state,r.id)){save();render();celebrate(r.icon,'🤝 Mesa de amigos','Você preparou e compartilhou! Os ingredientes vieram da sua horta.','kitchen');}cooking=null;}break;
      case 'memory-start': if(![3,4,6,8,10].includes(Number(id)))break;state.settings.pairs=Number(id);save();mission('animais',true);break;
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

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    const { action, id } = button.dataset;
    if (v2Action(action,id,button)) return;
    switch (action) {
      case 'mission': mission(id); break;
      case 'close': close(); break;
      case 'read': speak(content.dataset.narration || '', true); break;
      case 'help': help(); break;
      case 'garden': garden(); break;
      case 'album': album(); break;
      case 'avatar': avatars(); break;
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
      case 'reset': state = E.initial(); save(); render(); close(); toast('Um novo jardim espera por você.'); break;
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
    } else if (target.id === 'setting-motion') state.settings.reducedMotion = target.checked;
    else if (target.id === 'setting-pairs') state.settings.pairs = [3,4,6,8,10].includes(Number(target.value)) ? Number(target.value) : 3;
    else return;
    save(); render();
  });
  panel.addEventListener('cancel', event => { event.preventDefault(); close(); });
  panel.addEventListener('click', event => { if (event.target === panel) close(); });
  window.addEventListener('pagehide', stopVoice);
  if (!loaded.available) storageNotice();
  render();
  if (!state.welcomed) avatars();
})();
