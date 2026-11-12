# V3.1 — correção de carregamento e revisão visual

## O que foi encontrado

O ZIP enviado do repositório tem os mesmos cinco arquivos principais da V3 entregue: index.html, styles.css e js/content.js, js/engine.js, js/app.js. Não há diferença nesses arquivos. As capturas mostram HTML novo com visual e seleção de personagem anteriores, compatíveis com recursos antigos em cache. Isso é uma hipótese sustentada pela comparação; não foi possível inspecionar o cache do celular.

## Correções e melhorias

- O HTML carrega arquivos com nomes exclusivos desta versão: styles-v3-1.css e js/*-v3-1.js. Isso evita reutilizar os endereços antigos de CSS e JS.
- Logo com dimensões de 52 × 52 pixels no próprio HTML, além do CSS.
- Indicador V3.1 visível; aviso caso o JavaScript não conclua a inicialização.
- Acesso ao personagem e pet acima do mapa, inclusive no celular.
- Botões e abas com melhor contraste, espaçamento, profundidade e áreas de toque.
- Painéis com cabeçalho fixo e navegação Voltar/Início.
- Casa com piso, parede e espaços de decoração mais definidos; cartões e seleção de personagens refinados.
- Rótulo Casa de Jogos no mapa; Roda do Sol preservada dentro dela.
- Ajuste da navegação de retorno dos painéis e distinção dos antigos amigos da Roda do Sol.

Não é uma nova implementação 3D nem uma expansão do catálogo educativo. As limitações de conteúdo da V3 continuam no README. A melhoria visual desta etapa é de interface, cores, proporções e composição, sem novas ilustrações geradas.

## Atualizar o GitHub

1. Guarde o ZIP antigo como backup.
2. Extraia este ZIP inteiro.
3. Envie **todo o conteúdo**, incluindo index.html, styles-v3-1.css, js, assets e demais pastas, para a raiz do mesmo repositório. Substitua arquivos de mesmo nome. Não envie apenas o index.html.
4. Aguarde a implantação do GitHub Pages concluir e atualize a página.
5. Confira o selo **V3.1** acima do mapa. Se não aparecer, a página HTML nova ainda não está carregada.
6. Não apague os dados do site para tentar atualizar: eles contêm o progresso. A V3.1 mantém a mesma chave de salvamento da V3.

As páginas anteriores adicionais do repositório foram mantidas. Não é preciso excluir o repositório ou começar outro. Esta entrega não publica automaticamente.

## Abrir no computador

Extraia tudo e abra index.html; ou execute npm start e abra o endereço informado. No Android, prefira o endereço publicado no navegador.

## Manutenção

Edite os arquivos canônicos styles.css e js/{content,engine,app}.js e execute `node scripts/release.cjs` antes de empacotar. O script atualiza as cópias com nomes da V3.1. O teste de empacotamento detecta se alguma cópia ficou desatualizada.
