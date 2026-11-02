# Verificação da V1 Kids

## Verificado automaticamente

Cinco testes passaram em `node --test tests/engine.test.cjs`:

1. Cada aventura entrega duas sementes apenas uma vez. Decorar não apaga conquistas; guardar uma planta devolve a semente.
2. O salvamento e a retomada preservam o jardim. A normalização remove campos desconhecidos, nomes e respostas emocionais.
3. Armazenamento bloqueado ou corrompido retorna um estado jogável, sem interromper a aplicação.
4. Os baralhos de três e quatro pares contêm exatamente duas cartas de cada animal.
5. Os recursos referenciados pela página existem e são locais.

O JavaScript da interface também passou na verificação de sintaxe com `node --check js/app.js`.

## Verificado no navegador

- Mapa e arte carregando; composição de computador inspecionada visualmente.
- Abertura da aventura da horta.
- Tentativa fora da sequência recebe orientação; sequência semear, regar e dar luz conclui a atividade.
- Recompensa de duas sementes e proposta de cuidado fora da tela.
- Compra de um girassol e uma árvore, saldo atualizado e duas plantas no jardim.
- Recarregar a página mantém a conquista e as plantas.
- Abertura do lago com os quatro objetos e respectivos controles acessíveis.

A sessão de prévia foi encerrada antes de concluir a revisão manual das outras três aventuras. Os demais fluxos estão implementados, mas não foram todos percorridos de ponta a ponta no navegador. A saída de voz e o uso em um aparelho celular real também ainda precisam de teste. Há estilos responsivos e suporte a movimentos reduzidos, mas isso não equivale a uma auditoria completa de acessibilidade.

## Roteiro para o primeiro teste acompanhado

1. Abra `index.html` e deixe a criança escolher um companheiro.
2. Concluam a horta e plantem uma decoração.
3. No lago, encontrem os quatro objetos e guardem a descoberta.
4. No bosque, procurem os pares sem limite de tempo.
5. Na roda, escolham um sentimento ou “Prefiro só ouvir”. Todas as escolhas têm o mesmo valor.
6. Visitem o álbum, recarreguem a página e confiram o progresso.
7. Nas preferências dos responsáveis, experimentem três ou quatro pares e a leitura em voz alta.
8. Encerrem com uma das propostas fora da tela. Observem onde a interface precisa de mais imagens, voz ou explicações.

O jogo é um protótipo inicial para revisão com famílias. Não foi publicado automaticamente nem conectado a um repositório remoto nesta entrega.
