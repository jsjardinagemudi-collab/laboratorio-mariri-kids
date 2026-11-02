# A Luz do Mariri Kids — Jardim das Descobertas V2

Protótipo independente para crianças de 4–8 anos acompanhadas de um adulto. Evolução da V1, preservando mapa, arte, quatro aventuras originais, jardim, álbum e configurações.

## Abrir e publicar

Extraia o ZIP e abra `index.html`. Não requer instalação ou compilação.

Para atualizar o repositório `laboratorio-mariri-kids`, envie o conteúdo desta pasta para a raiz do repositório, substituindo os arquivos da V1. Preserve a estrutura `assets/` e `js/`. O `index.html` deve ficar na raiz. Em GitHub Pages, mantenha `main` e `/(root)` como origem. A atualização depende da publicação do GitHub; este ZIP não altera o site automaticamente.

Servidor local opcional: `npm start` (Node.js). Testes: `npm test`.

## Novidades funcionais

- Entrada com seis personagens grandes e apelido opcional, editável pelo botão do personagem.
- Horta com três canteiros: girassol e alface disponíveis; cenoura após uma variedade colhida; tomate após duas variedades.
- Sequências ilustradas de terra, composto, semente ou muda, cobertura quando aplicável e água. Crescimento virtual de 30 segundos, inclusive fora da tela. Não há morte por ausência.
- Cesta persistente; colheita por toque; três receitas sem faca/fogão: folhas frescas, cenoura lavada e salada com alface e tomate. Separar, lavar, misturar e servir. Ingredientes são consumidos somente ao servir.
- Casa na árvore acessível no mapa e no jardim. Seis móveis, seis posições; escolher móvel e tocar no lugar. Compra única; reorganização gratuita. Um móvel substituído volta ao catálogo de móveis possuídos.
- Memória com 6, 8, 12, 16 e 20 cartas. Complete um tamanho e guarde a descoberta para liberar o próximo. Responsáveis podem selecionar qualquer tamanho.
- Quebra-cabeça do jardim com 4, 6, 9 e 12 peças: selecionar peça e tocar no encaixe correspondente, com imagem-guia. Progressão por conclusão.
- Lago original preservado; perguntas ilustradas de rio, praia, insetos e mamíferos, com feedback educativo.
- Amigo escolhido aparece na Roda do Sol. Conversas roteirizadas, sentimentos opcionais e possibilidade de pular. Não é chatbot nem avaliação psicológica.
- Botões maiores, sequências de ícones, instruções faladas e botão para ouvir novamente. Voz levemente mais aguda, ritmo tranquilo; timbre depende do navegador e sistema, sem voz infantil gravada.

## Recursos e progresso

As quatro aventuras originais dão duas sementes na primeira conclusão. Novos selos de colheita, receita, habitat, tamanho de memória e quebra-cabeça dão duas sementes cada, uma única vez. Repetir brincadeiras continua disponível. Móveis e decoração usam sementes; conhecimento e selos nunca são consumidos. O girassol aparece na cesta como colheita botânica; não é ingrediente das receitas atuais.

A V2 usa a chave local `a-luz-do-mariri-kids-v2` e importa automaticamente a V1 se não houver progresso V2. A migração exige o mesmo navegador e origem/endereço. A V1 permanece preservada na chave antiga. Dados não sincronizam entre dispositivos. Exportação JSON para cópia de segurança disponível; importação por interface não implementada.

Apelido, personagem, conquistas, inventário, alimentos, cultivos e preferências ficam no navegador. Nenhuma resposta de sentimento, conversa ou perfil psicológico é salva. Não há cadastro, rastreamento, anúncios, compra real, competição, mensagens entre usuários ou conexão com servidores de IA.

## Para quem acompanha

Ajude a criança a escolher um apelido, teste o áudio no aparelho e faça pausas. As atividades reais de cultivo e cozinha devem ter supervisão. O crescimento e as receitas são simplificações educativas. A voz pode não estar instalada ou disponível no navegador; ícones e textos continuam funcionando.

## Organização

`js/content.js`: conteúdo e catálogos. `js/engine.js`: estado, migração, recursos e regras. `js/app.js`: telas e interações. `styles.css`: visual responsivo. `tests/engine.test.cjs`: regressão do estado e novas regras. `docs/VALIDACAO.md`: verificações e limites da entrega.
