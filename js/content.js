/* Conteúdo separado das regras: amplie as aventuras sem misturar textos e estado. */
(function (root) {
  'use strict';
  const content = {
    version: 1,
    avatars: [
      { id: 'jabuti', icon: '🐢', name: 'Jabuti', phrase: 'Um passinho de cada vez.' },
      { id: 'borboleta', icon: '🦋', name: 'Borboleta', phrase: 'Há cores para descobrir.' },
      { id: 'passaro', icon: '🐦', name: 'Passarinho', phrase: 'Vamos observar a natureza?' },
      { id: 'coelho', icon: '🐰', name: 'Coelho', phrase: 'Uma nova aventura espera.' },
      { id: 'joaninha', icon: '🐞', name: 'Joaninha', phrase: 'Pequenos cuidados importam.' },
      { id: 'sapo', icon: '🐸', name: 'Sapinho', phrase: 'Vamos cuidar do nosso lago?' }
    ],
    missions: [
      { id: 'plantar', number: '01', icon: '🌱', name: 'Uma semente, uma vida', place: 'Horta da Terra', color: 'earth', short: 'Plantar e cuidar', duration: '2 min', badge: 'Amigo das plantas', instruction: 'Vamos plantar um girassol? Comece colocando a semente na terra.', learning: 'Uma planta precisa de água, luz e condições adequadas para crescer. Na natureza, crescer leva tempo.', offline: 'Com um adulto, observe uma planta perto de você. Toque a terra e conversem sobre os cuidados de que ela precisa.' },
      { id: 'lago', number: '02', icon: '💧', name: 'Um lago bem cuidado', place: 'Lago da Água', color: 'water', short: 'Cuidar da água', duration: '2 min', badge: 'Amigo das águas', instruction: 'Encontre os quatro objetos que não pertencem ao lago e toque neles para recolher.', learning: 'Guardar o lixo no lugar certo ajuda a cuidar da água e dos animais.', offline: 'Com um adulto, veja onde sua família guarda o lixo. Nunca entre na água nem pegue objetos desconhecidos para repetir a brincadeira.' },
      { id: 'animais', number: '03', icon: '🦋', name: 'Quem mora na floresta?', place: 'Bosque do Ar', color: 'air', short: 'Observar e lembrar', duration: '3 min', badge: 'Amigo dos animais', instruction: 'Vire duas cartas. Se os animais forem iguais, você encontrou um par!', learning: 'Observar com calma ajuda a perceber diferenças. Animais silvestres precisam de espaço e cuidado.', offline: 'Olhe pela janela ou caminhe com um adulto. Quantos animais vocês conseguem observar de longe, sem tocar nem alimentar?' },
      { id: 'sentir', number: '04', icon: '☀️', name: 'Como está meu coração?', place: 'Roda do Sol', color: 'light', short: 'Sentir e conversar', duration: '2 min', badge: 'Amigo dos sentimentos', instruction: 'Como você está se sentindo agora? Todas as respostas são bem-vindas. Você também pode passar.', learning: 'Todos os sentimentos podem ser acolhidos. Podemos pedir companhia e ajuda a alguém em quem confiamos.', offline: 'Se quiser, conte a um adulto de confiança algo que foi bom ou difícil no seu dia. Você também pode só ficar juntinho.' }
    ],
    plants: [
      { id: 'girassol', icon: '🌻', name: 'Girassol', description: 'Um pedacinho de sol para o jardim.' },
      { id: 'flor', icon: '🌷', name: 'Flor colorida', description: 'Mais uma cor para a nossa história.' },
      { id: 'arvore', icon: '🌳', name: 'Árvore amiga', description: 'Sombra e abrigo para imaginar.' },
      { id: 'muda', icon: '🌿', name: 'Cantinho verde', description: 'Um pequeno começo que pode crescer.' }
    ],
    animals: [ { id: 'bird', icon: '🐦', name: 'Passarinho' }, { id: 'turtle', icon: '🐢', name: 'Jabuti' }, { id: 'butterfly', icon: '🦋', name: 'Borboleta' }, { id: 'frog', icon: '🐸', name: 'Sapinho' } ],
    feelings: [
      { id: 'alegre', icon: '😊', name: 'Alegre', response: 'Que bom perceber sua alegria! Você pode compartilhar esse momento com alguém.' },
      { id: 'triste', icon: '😔', name: 'Triste', response: 'Tudo bem sentir tristeza. Você pode pedir a companhia de um adulto de confiança.' },
      { id: 'bravo', icon: '😠', name: 'Bravo', response: 'A raiva também é um sentimento. Podemos fazer uma pausa e pedir ajuda, sem machucar ninguém.' },
      { id: 'medo', icon: '😟', name: 'Com medo', response: 'Você pode contar o que assustou você a um adulto de confiança e pedir companhia.' },
      { id: 'calmo', icon: '😌', name: 'Calmo', response: 'Que bom notar a calma. Vamos observar um pouquinho o mundo ao nosso redor?' }
    ]
  };
  content.animals.push(
    {id:'rabbit',icon:'🐰',name:'Coelho'}, {id:'bee',icon:'🐝',name:'Abelha'},
    {id:'ladybug',icon:'🐞',name:'Joaninha'}, {id:'fish',icon:'🐠',name:'Peixe'},
    {id:'cat',icon:'🐱',name:'Gato'}, {id:'crab',icon:'🦀',name:'Caranguejo'});
  content.crops = [
    {id:'girassol',icon:'🌻',name:'Girassol',unlock:0,steps:['terra','composto','semente','cobrir','agua'],tip:'O girassol forma sementes depois de florescer.'},
    {id:'alface',icon:'🥬',name:'Alface',unlock:0,steps:['terra','composto','muda','agua'],tip:'A alface é uma folha que podemos comer. Aqui plantamos uma muda.'},
    {id:'cenoura',icon:'🥕',name:'Cenoura',unlock:1,steps:['terra','composto','semente','cobrir','agua'],tip:'A parte alaranjada da cenoura cresce debaixo da terra: é uma raiz.'},
    {id:'tomate',icon:'🍅',name:'Tomate',unlock:2,steps:['terra','composto','muda','agua'],tip:'O tomate é um fruto. Uma muda é uma plantinha que já começou a crescer.'}
  ];
  content.tools = {terra:['🟤','Terra'],composto:['🍂','Composto'],semente:['🌰','Semente'],cobrir:['🤲','Cobrir'],agua:['💧','Regar'],muda:['🌱','Muda']};
  content.furniture = [{id:'bed',icon:'🛏️',name:'Cama',cost:2},{id:'table',icon:'🪑',name:'Mesa e cadeira',cost:2},{id:'rug',icon:'🟠',name:'Tapete do sol',cost:1},{id:'books',icon:'📚',name:'Estante de histórias',cost:2},{id:'toy',icon:'🧸',name:'Ursinho',cost:1},{id:'vase',icon:'🪴',name:'Vaso',cost:1}];
  content.recipes = [{id:'salada',icon:'🥗',name:'Salada do jardim',needs:{alface:1,tomate:1}},{id:'cenoura',icon:'🥕',name:'Cenourinha lavada',needs:{cenoura:1}},{id:'folhas',icon:'🥬',name:'Folhinhas frescas',needs:{alface:1}}];
  content.habitats = [
    {id:'rio',icon:'🏞️',name:'Rio',question:'Quem vive na água do rio?',choices:[['🐟','Peixe',true],['🐰','Coelho',false],['🦋','Borboleta',false]],fact:'Muitos peixes vivem nos rios. Eles respiram na água usando brânquias.'},
    {id:'praia',icon:'🏖️',name:'Praia',question:'Quem costuma caminhar na areia da praia?',choices:[['🐱','Gato',false],['🦀','Caranguejo',true],['🐄','Vaca',false]],fact:'Há caranguejos que vivem perto do mar e fazem tocas na areia.'},
    {id:'insetos',icon:'🌼',name:'Jardim',question:'Qual destes animais é um inseto?',choices:[['🐸','Sapo',false],['🐝','Abelha',true],['🐢','Jabuti',false]],fact:'Insetos têm seis pernas. A abelha é um inseto e visita flores.'},
    {id:'mamiferos',icon:'🌳',name:'Bosque',question:'Qual destes animais é um mamífero?',choices:[['🐦','Pássaro',false],['🐠','Peixe',false],['🐰','Coelho',true]],fact:'O coelho é um mamífero. Quando pequeno, ele se alimenta do leite da mãe.'}
  ];
  root.KidsContent = content;
  if (typeof module !== 'undefined' && module.exports) module.exports = content;
})(typeof window !== 'undefined' ? window : globalThis);
