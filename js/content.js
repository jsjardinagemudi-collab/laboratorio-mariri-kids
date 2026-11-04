/* Conteúdo separado das regras: amplie as aventuras sem misturar textos e estado. */
(function (root) {
  'use strict';
  const content = {
    version: 3,
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
  // V3: conteúdo educativo e recompensas determinísticas, sem dados de conversa.
  content.heroes = [
    {id:'menino-sol',name:'Menino Sol',skin:'#bb774c',hair:'#39281c',shirt:'#eab146',style:'short'},
    {id:'menina-lua',name:'Menina Lua',skin:'#70452f',hair:'#241e1c',shirt:'#ad86cf',style:'puffs'},
    {id:'menino-rio',name:'Menino Rio',skin:'#edb58c',hair:'#633c26',shirt:'#6abfc4',style:'short'},
    {id:'menina-flor',name:'Menina Flor',skin:'#ca8f64',hair:'#36261d',shirt:'#eb8c91',style:'long'},
    {id:'menino-bosque',name:'Menino Bosque',skin:'#70452f',hair:'#231f1d',shirt:'#82b277',style:'curls'},
    {id:'menina-vento',name:'Menina Vento',skin:'#edb58c',hair:'#a55a2b',shirt:'#79a9d5',style:'long'}
  ];
  content.pets=[{id:'dog',icon:'🐶',name:'Cachorrinho',phrase:'Gosto de passear e brincar!',food:'ração para cães'},{id:'cat',icon:'🐱',name:'Gatinho',phrase:'Gosto de explorar e descansar!',food:'ração para gatos'},{id:'bunny',icon:'🐰',name:'Coelhinho',phrase:'Gosto de saltitar e roer feno!',food:'feno adequado para coelhos'}];
  content.outfits=[{id:'garden',icon:'👕',name:'Roupa do jardim',color:'#66a36b'},{id:'sun',icon:'🌞',name:'Roupa do sol',color:'#ecc052'},{id:'water',icon:'💧',name:'Roupa das águas',color:'#69b9dc'},{id:'flower',icon:'🌸',name:'Roupa das flores',color:'#d78bb2'},{id:'explorer',icon:'🌿',name:'Roupa exploradora',color:'#b7a36c'}];
  content.accessories=[{id:'hat',icon:'👒',name:'Chapéu do jardim'},{id:'bag',icon:'🎒',name:'Mochila de descobertas'}];
  const moreCrops=[
    ['couve','🥬','Couve','Comemos as folhas da couve. Ela gosta de cuidados com o solo.',1],
    ['batata','🥔','Batata','A batata é um tubérculo: cresce debaixo da terra.',2],
    ['beterraba','🟣','Beterraba','A raiz da beterraba tem uma cor roxa bem marcante.',2],
    ['brocolis','🥦','Brócolis','No brócolis, comemos partes que formariam flores.',3],
    ['abobora','🎃','Abóbora','A abóbora cresce em uma planta que se espalha pelo chão.',3],
    ['pepino','🥒','Pepino','O pepino é um fruto e pode fazer parte de saladas.',3],
    ['milho','🌽','Milho','Na espiga de milho encontramos muitos grãos.',4],
    ['morango','🍓','Morango','O morangueiro é uma planta pequena. Aqui usamos uma muda.',0],
    ['melancia','🍉','Melancia','A melancia cresce em uma planta rasteira e tem muita água.',4],
    ['banana','🍌','Banana','Bananeiras crescem a partir de mudas; a banana cultivada não é plantada pela semente.',1]
  ];
  moreCrops.forEach(([id,icon,name,tip,unlock])=>content.crops.push({id,icon,name,tip,unlock,steps:['terra',id==='banana'||id==='morango'?'muda':id==='batata'?'tuberculo':'semente','agua']}));
  content.tools.tuberculo=['🥔','Batata-semente'];
  content.ingredients=[...content.crops.map(c=>({id:c.id,name:c.name,icon:c.icon})),{id:'leite',name:'Leite',icon:'🥛'},{id:'ovos',name:'Ovos',icon:'🥚'},{id:'la',name:'Lã',icon:'🧶'},{id:'aveia',name:'Aveia da despensa',icon:'🌾'}];
  content.furniture.push({id:'sofa',icon:'🛋️',name:'Sofá aconchego',cost:3},{id:'wardrobe',icon:'🚪',name:'Armário',cost:3},{id:'ball',icon:'⚽',name:'Bola',cost:2},{id:'blanket',icon:'🧶',name:'Manta de lã',cost:2},{id:'lamp',icon:'🏮',name:'Lanterna',cost:2},{id:'blocks',icon:'🧱',name:'Blocos de brincar',cost:2});
  content.recipes.push(
    {id:'mingau',icon:'🥣',name:'Mingau de morango',needs:{morango:1,leite:1,aveia:1},warm:true},
    {id:'frutas',icon:'🍓',name:'Salada de frutas',needs:{banana:1,morango:1,melancia:1}},
    {id:'sopa',icon:'🍲',name:'Sopa de legumes',needs:{batata:1,cenoura:1,abobora:1},warm:true},
    {id:'omelete',icon:'🍳',name:'Omelete do jardim',needs:{ovos:1,tomate:1},warm:true},
    {id:'vitamina',icon:'🥤',name:'Vitamina de banana',needs:{banana:1,leite:1}},
    {id:'salada-colorida',icon:'🥗',name:'Salada colorida',needs:{pepino:1,beterraba:1,alface:1}},
    {id:'prato-verde',icon:'🥦',name:'Prato verde',needs:{brocolis:1,couve:1,milho:1},warm:true}
  );
  content.farmAnimals=[
    {id:'cow',icon:'🐄',name:'Vaca',food:'capim',resource:'leite',fact:'O leite vem da vaca. O bezerro precisa ser cuidado e alimentado primeiro. Um adulto cuida da ordenha.'},
    {id:'hen',icon:'🐔',name:'Galinha',food:'ração apropriada',resource:'ovos',fact:'A galinha precisa de água, alimentação e espaço. Recolhemos apenas o ovo disponível no ninho.'},
    {id:'sheep',icon:'🐑',name:'Ovelha',food:'capim',resource:'la',fact:'A lã vem da ovelha. A tosquia deve ser feita por uma pessoa preparada, sem machucar o animal.'},
    {id:'pig',icon:'🐷',name:'Porquinho',food:'ração apropriada',fact:'A lama ajuda o porquinho a se refrescar. Vamos brincar e depois descansar.'},
    {id:'horse',icon:'🐴',name:'Cavalo',food:'feno',fact:'Cavalos precisam de espaço, água, alimentação e descanso. Observe de longe na vida real.'},
    {id:'duck',icon:'🦆',name:'Pato',food:'alimentação apropriada',fact:'Patos gostam de nadar. Pão não é uma boa comida para eles.'},
    {id:'rabbit',icon:'🐇',name:'Coelho',food:'feno',fact:'Coelhos precisam de feno, água e espaço. Nem toda comida de gente é boa para eles.'}
  ];
  content.chests=[
    {id:'c1',need:2,name:'Primeiras descobertas',items:[['furniture','toy'],['outfit','sun']]},
    {id:'c2',need:5,name:'Cuidar e brincar',items:[['furniture','sofa'],['accessory','hat']]},
    {id:'c3',need:9,name:'Amigos da natureza',items:[['furniture','blocks'],['outfit','water']]},
    {id:'c4',need:14,name:'Casa acolhedora',items:[['furniture','wardrobe'],['accessory','bag']]},
    {id:'c5',need:20,name:'Jardim de cores',items:[['furniture','lamp'],['outfit','flower']]},
    {id:'c6',need:28,name:'Novos caminhos',items:[['furniture','ball'],['outfit','explorer']]}
  ];
  const q=(id,prompt,choices,answer,fact,lang='pt-BR')=>({id,prompt,choices,answer,fact,lang});
  content.subjects=[
    {id:'portugues',icon:'🔤',name:'Português',levels:[
      [q('p1','Toque na letra A.',['A','E','O'],0,'A é uma vogal.'),q('p2','Qual figura começa com A?',['🐝 Abelha','🐱 Gato','🐸 Sapo'],0,'Abelha começa com A.'),q('p3','Qual é a letra O?',['U','I','O'],2,'O de ovo.')],
      [q('p4','Qual figura começa com B?',['🐸 Sapo','🍌 Banana','🐶 Cão'],1,'Banana começa com B.'),q('p5','Junte P e A. Que sílaba aparece?',['PA','ME','LU'],0,'P com A faz PA.'),q('p6','Qual figura começa com MA?',['🐱 Gato','🦋 Borboleta','🍎 Maçã'],2,'Maçã começa com MA.')],
      [q('p7','CA mais SA forma qual palavra?',['BOLA','CASA','SAPO'],1,'CA e SA formam CASA.'),q('p8','Qual palavra combina com o desenho? 🐸',['SAPO','GATO','PATO'],0,'Sapo: SA e PO.'),q('p9','Qual palavra começa com a sílaba BO?',['MALA','CASA','BOLA'],2,'Bola começa com BO.')]
    ]},
    {id:'matematica',icon:'🔢',name:'Matemática',levels:[
      [q('m1','Quantas maçãs? 🍎 🍎',['1','2','3'],1,'São duas maçãs.'),q('m2','Conte os patos. 🦆 🦆 🦆',['3','1','4'],0,'São três patos.'),q('m3','Onde está o número um?',['2','4','1'],2,'Este é o número um.')],
      [q('m4','Uma flor e mais uma flor. Quantas? 🌼 + 🌼',['1','2','3'],1,'Uma mais uma são duas.'),q('m5','Três cenouras. Damos uma ao cesto. Quantas ficam? 🥕🥕🥕',['2','3','4'],0,'Três menos uma são duas.'),q('m6','Qual grupo tem mais?',['🍓🍓','🍓','🍓🍓🍓'],2,'Três é mais que dois e um.')],
      [q('m7','Duas sementes mais três sementes. Quanto é dois mais três?',['4','5','6'],1,'Dois mais três são cinco.'),q('m8','Cinco folhas menos duas. Quanto sobra?',['3','2','4'],0,'Cinco menos duas são três.'),q('m9','Qual número vem depois do seis?',['5','8','7'],2,'Depois do seis vem sete.')]
    ]},
    {id:'ingles',icon:'🌎',name:'Inglês',levels:[
      [q('i1','Dog. Qual animal é dog?',['🐶','🐱','🐰'],0,'Dog significa cachorro.','en-US'),q('i2','Cat. Qual animal é cat?',['🐶','🐱','🐮'],1,'Cat significa gato.','en-US'),q('i3','Apple. Onde está a apple?',['🍌','🍓','🍎'],2,'Apple significa maçã.','en-US')],
      [q('i4','Blue. Qual é a cor blue?',['🟦','🟥','🟨'],0,'Blue significa azul.','en-US'),q('i5','Three. Qual grupo tem three?',['⭐','⭐⭐⭐','⭐⭐'],1,'Three significa três.','en-US'),q('i6','Banana. Qual fruta é banana?',['🍎','🍉','🍌'],2,'Em inglês, banana também se escreve banana.','en-US')],
      [q('i7','Book. Onde está o book?',['📘','⚽','🪑'],0,'Book significa livro.','en-US'),q('i8','Green. Qual é green?',['🟦','🟩','🟥'],1,'Green significa verde.','en-US'),q('i9','Rabbit. Qual animal é rabbit?',['🐱','🐶','🐰'],2,'Rabbit significa coelho.','en-US')]
    ]},
    {id:'natureza',icon:'🌿',name:'Natureza',levels:[
      [q('n1','O que a planta precisa para crescer?',['💧 Água','🧸 Ursinho','👟 Sapato'],0,'Água, luz e condições adequadas ajudam a planta a crescer.'),q('n2','Qual animal vive na água?',['🐰','🐟','🐓'],1,'Os peixes vivem na água.'),q('n3','O que podemos colher da bananeira?',['🥕','🥔','🍌'],2,'A bananeira produz bananas.')],
      [q('n4','Qual destes é um inseto?',['🐝','🐱','🐟'],0,'A abelha é um inseto. Insetos têm seis pernas.'),q('n5','Qual destes é um mamífero?',['🐸','🐮','🦋'],1,'A vaca é um mamífero.'),q('n6','Qual destes animais não mora no mar?',['🐠','🐙','🐔'],2,'A galinha vive em terra, não no mar.')],
      [q('n7','De onde vem a cenoura que comemos?',['🟤 Da raiz','🌸 Da flor','🍃 Da folha'],0,'A parte que comemos é a raiz da cenoura.'),q('n8','Para cuidar do rio, onde vai o lixo?',['🌊 No rio','🗑️ Na lixeira','🌳 Na árvore'],1,'Guardamos o lixo em local adequado.'),q('n9','Qual grupo tem somente insetos?',['🐝🐸','🐱🐰','🐝🦋'],2,'Abelhas e borboletas são insetos.')]
    ]},
    {id:'esportes',icon:'⚽',name:'Esportes',levels:[
      [q('s1','Qual bola usamos no futebol?',['⚽','🏀','🎾'],0,'No futebol usamos esta bola.'),q('s2','Qual atividade acontece na piscina?',['🚴','🏊','⚽'],1,'Natação acontece na água, com supervisão.'),q('s3','O que protege a cabeça ao pedalar?',['🧣','🧤','⛑️'],2,'Use capacete adequado para bicicleta com ajuda de um adulto.')],
      [q('s4','Qual esporte usa uma cesta?',['🏀','⚽','🏓'],0,'Basquete usa uma cesta.'),q('s5','Qual atividade usa uma raquete?',['🏃','🎾','🏊'],1,'No tênis usamos uma raquete.'),q('s6','Depois de brincar, o que ajuda a cuidar do corpo?',['🍬 Só doces','📺 Mais tela','💧 Água e pausa'],2,'Água e descanso fazem parte do cuidado.')],
      [q('s7','Como podemos brincar juntos?',['🤝 Revezando','🚫 Excluindo','😠 Empurrando'],0,'Revezar ajuda todos a participar.'),q('s8','Se um amigo cai, o que fazemos?',['🏃 Ignorar','🧑 Pedir ajuda a um adulto','😆 Rir'],1,'Chamamos um adulto para ajudar.'),q('s9','Qual atividade pode ser feita no seu ritmo?',['🏆 Só vencer','⏱️ Correr sempre','🚶 Caminhar'],2,'Podemos caminhar no nosso ritmo em um lugar seguro.')]
    ]}
  ];
  content.miniGames={
    sequencia:[q('seq1','O que vem depois? 🌼 🍃 🌼 🍃 …',['🌼','🍃','💧'],0,'As figuras se repetem: flor e folha.'),q('seq2','O que vem depois? 1, 2, 3, …',['2','4','6'],1,'Depois do três vem quatro.'),q('seq3','O que vem depois? 🌰 🌱 🌿 …',['🧊','🪨','🌻'],2,'Depois dos cuidados, a planta cresce e pode florescer.')],
    associacao:[q('assoc1','Qual desenho tem a mesma cor da maçã vermelha? 🍎',['🔴','🔵','🟢'],0,'As duas figuras são vermelhas.'),q('assoc2','Qual figura combina com chuva? 🌧️',['🕶️','☂️','⚽'],1,'O guarda-chuva ajuda a proteger da chuva.'),q('assoc3','Qual casa combina com o passarinho? 🐦',['🏰','🏠','🪺'],2,'Muitos pássaros fazem ninhos.')],
    diferencas:[q('dif1','Qual figura é diferente?',['🐸','🐸','🐱'],2,'O gato é diferente dos sapinhos.'),q('dif2','Qual cor é diferente?',['🟡','🔵','🟡'],1,'O azul é diferente dos amarelos.'),q('dif3','Qual desenho é diferente?',['🔺','🟢','🟢'],0,'O triângulo é diferente dos círculos.')]
  };
  content.shapeScenes=[{id:'casa',name:'Casa',icon:'🏠',pieces:['triangle','square','square','circle']},{id:'arvore',name:'Árvore',icon:'🌳',pieces:['circle','circle','square','triangle']},{id:'peixe',name:'Peixe',icon:'🐟',pieces:['circle','triangle','circle','square']},{id:'robo',name:'Robô',icon:'🤖',pieces:['square','square','circle','triangle']}];

  content.geography = {"biomas": [{"id": "amazonia", "name": "Amazônia", "icon": "🌧️", "scene": "🌳 🦜 🌳 💧 🌳", "fact": "Uma grande floresta tropical, com muitos rios, plantas e animais."}, {"id": "cerrado", "name": "Cerrado", "icon": "🌾", "scene": "🌳 🌾 🐺 🌾 🌳", "fact": "Tem campos, arbustos e árvores de troncos tortuosos. Muitas plantas têm raízes profundas."}, {"id": "caatinga", "name": "Caatinga", "icon": "🌵", "scene": "☀️ 🌵 🌳 🌵 🦎", "fact": "Suas plantas e seus animais convivem com longos períodos de pouca chuva. Não é um deserto!"}, {"id": "mata", "name": "Mata Atlântica", "icon": "🌿", "scene": "🌳 🐒 🌿 🌺 🌳", "fact": "Uma floresta com grande diversidade de vida. Cuidar de seus trechos restantes é muito importante."}, {"id": "pantanal", "name": "Pantanal", "icon": "💧", "scene": "🌿 💧 🐊 💧 🐦", "fact": "Uma grande planície com épocas de cheia e de seca. A água transforma a paisagem."}, {"id": "pampa", "name": "Pampa", "icon": "🌱", "scene": "🌾 🌱 🐦 🌱 🌾", "fact": "Tem extensos campos naturais. No Brasil, fica no Rio Grande do Sul."}], "estados": [{"id": "ac", "name": "Acre", "icon": "📍", "fact": "Acre é um estado brasileiro. Sua capital é Rio Branco.", "location": "Brasil → Acre → Rio Branco"}, {"id": "al", "name": "Alagoas", "icon": "📍", "fact": "Alagoas é um estado brasileiro. Sua capital é Maceió.", "location": "Brasil → Alagoas → Maceió"}, {"id": "ap", "name": "Amapá", "icon": "📍", "fact": "Amapá é um estado brasileiro. Sua capital é Macapá.", "location": "Brasil → Amapá → Macapá"}, {"id": "am", "name": "Amazonas", "icon": "📍", "fact": "Amazonas é um estado brasileiro. Sua capital é Manaus.", "location": "Brasil → Amazonas → Manaus"}, {"id": "ba", "name": "Bahia", "icon": "📍", "fact": "Bahia é um estado brasileiro. Sua capital é Salvador.", "location": "Brasil → Bahia → Salvador"}, {"id": "ce", "name": "Ceará", "icon": "📍", "fact": "Ceará é um estado brasileiro. Sua capital é Fortaleza.", "location": "Brasil → Ceará → Fortaleza"}, {"id": "df", "name": "Distrito Federal", "icon": "📍", "fact": "O Distrito Federal é uma unidade da federação diferente dos estados. Aqui fica Brasília, a capital do Brasil.", "location": "Brasil → Distrito Federal → Brasília"}, {"id": "es", "name": "Espírito Santo", "icon": "📍", "fact": "Espírito Santo é um estado brasileiro. Sua capital é Vitória.", "location": "Brasil → Espírito Santo → Vitória"}, {"id": "go", "name": "Goiás", "icon": "📍", "fact": "Goiás é um estado brasileiro. Sua capital é Goiânia.", "location": "Brasil → Goiás → Goiânia"}, {"id": "ma", "name": "Maranhão", "icon": "📍", "fact": "Maranhão é um estado brasileiro. Sua capital é São Luís.", "location": "Brasil → Maranhão → São Luís"}, {"id": "mt", "name": "Mato Grosso", "icon": "📍", "fact": "Mato Grosso é um estado brasileiro. Sua capital é Cuiabá.", "location": "Brasil → Mato Grosso → Cuiabá"}, {"id": "ms", "name": "Mato Grosso do Sul", "icon": "📍", "fact": "Mato Grosso do Sul é um estado brasileiro. Sua capital é Campo Grande.", "location": "Brasil → Mato Grosso do Sul → Campo Grande"}, {"id": "mg", "name": "Minas Gerais", "icon": "📍", "fact": "Minas Gerais é um estado brasileiro. Sua capital é Belo Horizonte.", "location": "Brasil → Minas Gerais → Belo Horizonte", "flag": "mg.jpg"}, {"id": "pa", "name": "Pará", "icon": "📍", "fact": "Pará é um estado brasileiro. Sua capital é Belém.", "location": "Brasil → Pará → Belém"}, {"id": "pb", "name": "Paraíba", "icon": "📍", "fact": "Paraíba é um estado brasileiro. Sua capital é João Pessoa.", "location": "Brasil → Paraíba → João Pessoa"}, {"id": "pr", "name": "Paraná", "icon": "📍", "fact": "Paraná é um estado brasileiro. Sua capital é Curitiba.", "location": "Brasil → Paraná → Curitiba"}, {"id": "pe", "name": "Pernambuco", "icon": "📍", "fact": "Pernambuco é um estado brasileiro. Sua capital é Recife.", "location": "Brasil → Pernambuco → Recife"}, {"id": "pi", "name": "Piauí", "icon": "📍", "fact": "Piauí é um estado brasileiro. Sua capital é Teresina.", "location": "Brasil → Piauí → Teresina"}, {"id": "rj", "name": "Rio de Janeiro", "icon": "📍", "fact": "Rio de Janeiro é um estado brasileiro. Sua capital é Rio de Janeiro.", "location": "Brasil → Rio de Janeiro → Rio de Janeiro"}, {"id": "rn", "name": "Rio Grande do Norte", "icon": "📍", "fact": "Rio Grande do Norte é um estado brasileiro. Sua capital é Natal.", "location": "Brasil → Rio Grande do Norte → Natal"}, {"id": "rs", "name": "Rio Grande do Sul", "icon": "📍", "fact": "Rio Grande do Sul é um estado brasileiro. Sua capital é Porto Alegre.", "location": "Brasil → Rio Grande do Sul → Porto Alegre"}, {"id": "ro", "name": "Rondônia", "icon": "📍", "fact": "Rondônia é um estado brasileiro. Sua capital é Porto Velho.", "location": "Brasil → Rondônia → Porto Velho"}, {"id": "rr", "name": "Roraima", "icon": "📍", "fact": "Roraima é um estado brasileiro. Sua capital é Boa Vista.", "location": "Brasil → Roraima → Boa Vista"}, {"id": "sc", "name": "Santa Catarina", "icon": "📍", "fact": "Santa Catarina é um estado brasileiro. Sua capital é Florianópolis.", "location": "Brasil → Santa Catarina → Florianópolis"}, {"id": "sp", "name": "São Paulo", "icon": "📍", "fact": "São Paulo é um estado brasileiro. Sua capital é São Paulo.", "location": "Brasil → São Paulo → São Paulo"}, {"id": "se", "name": "Sergipe", "icon": "📍", "fact": "Sergipe é um estado brasileiro. Sua capital é Aracaju.", "location": "Brasil → Sergipe → Aracaju"}, {"id": "to", "name": "Tocantins", "icon": "📍", "fact": "Tocantins é um estado brasileiro. Sua capital é Palmas.", "location": "Brasil → Tocantins → Palmas"}], "cidades": [{"id": "uberlandia", "name": "Uberlândia", "icon": "🏘️", "fact": "Uberlândia é uma cidade no estado de Minas Gerais. Uma cidade faz parte de um município.", "location": "Brasil → Minas Gerais → Uberlândia"}, {"id": "bh", "name": "Belo Horizonte", "icon": "🏘️", "fact": "Belo Horizonte é uma cidade no estado de Minas Gerais. É a capital desse estado.", "location": "Brasil → Minas Gerais → Belo Horizonte"}, {"id": "curitiba", "name": "Curitiba", "icon": "🏘️", "fact": "Curitiba é uma cidade no estado de Paraná. É a capital desse estado.", "location": "Brasil → Paraná → Curitiba", "flag": "curitiba.jpg"}, {"id": "manaus", "name": "Manaus", "icon": "🏘️", "fact": "Manaus é uma cidade no estado de Amazonas. É a capital desse estado.", "location": "Brasil → Amazonas → Manaus"}, {"id": "salvador", "name": "Salvador", "icon": "🏘️", "fact": "Salvador é uma cidade no estado de Bahia. É a capital desse estado.", "location": "Brasil → Bahia → Salvador"}, {"id": "sp", "name": "São Paulo", "icon": "🏘️", "fact": "São Paulo é uma cidade no estado de São Paulo. É a capital desse estado.", "location": "Brasil → São Paulo → São Paulo"}], "paises": [{"id": "br", "name": "Brasil", "flag": "br.svg", "fact": "Brasil é um país. Sua capital é Brasília.", "location": "América do Sul"}, {"id": "jp", "name": "Japão", "flag": "jp.svg", "fact": "Japão é um país. Sua capital é Tóquio.", "location": "Ásia"}, {"id": "fr", "name": "França", "flag": "fr.svg", "fact": "França é um país. Sua capital é Paris.", "location": "Europa"}, {"id": "it", "name": "Itália", "flag": "it.svg", "fact": "Itália é um país. Sua capital é Roma.", "location": "Europa"}, {"id": "pt", "name": "Portugal", "flag": "pt.svg", "fact": "Portugal é um país. Sua capital é Lisboa.", "location": "Europa"}, {"id": "za", "name": "África do Sul", "flag": "za.svg", "fact": "África do Sul é um país. Tem três capitais, com funções diferentes: Pretória, Cidade do Cabo e Bloemfontein.", "location": "África"}]};
  content.geoQuizzes = {"biomas": [{"prompt": "Qual paisagem tem plantas adaptadas a pouca chuva?", "choices": ["🌵 Caatinga", "💧 Pantanal", "🌧️ Amazônia"], "answer": 0, "fact": "Na Caatinga, muitas plantas conseguem viver com pouca chuva."}, {"prompt": "Qual bioma tem épocas de cheia e de seca?", "choices": ["🌾 Pampa", "💧 Pantanal", "🌵 Caatinga"], "answer": 1, "fact": "As cheias e secas fazem parte da vida no Pantanal."}, {"prompt": "Qual cuidado ajuda todos os biomas?", "choices": ["🗑️ Jogar lixo no rio", "🔥 Queimar a mata", "🌱 Proteger plantas e animais"], "answer": 2, "fact": "Cuidar das plantas, dos animais e da água ajuda a natureza."}], "estados": [{"prompt": "Qual é a capital de Minas Gerais?", "choices": ["🏘️ Belo Horizonte", "🏘️ Curitiba", "🏘️ Manaus"], "answer": 0, "fact": "Belo Horizonte é a capital de Minas Gerais."}, {"prompt": "Qual destes é um estado?", "choices": ["🏘️ Uberlândia", "📍 Paraná", "🌍 Brasil"], "answer": 1, "fact": "Paraná é um estado. Curitiba é sua capital."}, {"prompt": "Onde fica Brasília?", "choices": ["📍 Distrito Federal", "📍 Acre", "📍 Bahia"], "answer": 0, "fact": "Brasília fica no Distrito Federal e é a capital do Brasil."}], "cidades": [{"prompt": "Em qual estado fica Uberlândia?", "choices": ["📍 Amazonas", "📍 Minas Gerais", "📍 Paraná"], "answer": 1, "fact": "Uberlândia fica em Minas Gerais."}, {"prompt": "Qual é uma cidade?", "choices": ["🌍 Japão", "🌍 Brasil", "🏘️ Curitiba"], "answer": 2, "fact": "Curitiba é uma cidade e a capital do Paraná."}, {"prompt": "Qual sequência vai do lugar maior para o menor?", "choices": ["🌍 Brasil → 📍 Minas Gerais → 🏘️ Uberlândia", "🏘️ Uberlândia → 🌍 Brasil → 📍 Minas Gerais"], "answer": 0, "fact": "Uberlândia fica em Minas Gerais, que faz parte do Brasil."}], "paises": [{"prompt": "Qual país tem um círculo vermelho na bandeira?", "choices": ["🇯🇵 Japão", "🇮🇹 Itália", "🇧🇷 Brasil"], "answer": 0, "fact": "A bandeira do Japão tem um círculo vermelho sobre um fundo branco."}, {"prompt": "Qual é o nome do nosso país?", "choices": ["🏘️ Curitiba", "🇧🇷 Brasil", "📍 Minas Gerais"], "answer": 1, "fact": "Brasil é o país. Ele tem estados, o Distrito Federal e muitos municípios."}, {"prompt": "Como tratamos pessoas de outros países?", "choices": ["🤝 Com respeito", "🙅 Com desprezo"], "answer": 0, "fact": "Todas as pessoas merecem respeito. Podemos aprender uns com os outros."}]};
  const stateFlags={"sp": "sp.png", "al": "al.png", "ap": "ap.png", "ba": "ba.jpg", "es": "es.jpg", "go": "go.png", "ce": "ce.png", "df": "df.png", "ma": "ma.png", "ms": "ms.png", "pa": "pa.png", "pe": "pe.png", "pr": "pr.png", "rn": "rn.png", "rr": "rr.jpg", "rs": "rs.jpg", "rj": "rj.png", "ro": "ro.jpg", "sc": "sc.png"};
  content.geography.estados.forEach(s=>{if(stateFlags[s.id])s.flag=stateFlags[s.id];});
  root.KidsContent = content;
  if (typeof module !== 'undefined' && module.exports) module.exports = content;
})(typeof window !== 'undefined' ? window : globalThis);
