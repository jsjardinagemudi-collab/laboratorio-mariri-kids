# A Luz do Mariri Kids — V3.1

Leia primeiro LEIA_PRIMEIRO_V3_1.md para as correções, testes e instruções desta entrega.

# Base e funções preservadas da V3

Brincar para aprender. Aprender para cuidar. Cuidar para transformar.

Esta versão amplia a V2 existente. O mapa original, jardim, lago, Roda do Sol, companheiros, receitas, móveis, quebra-cabeças e memória foram preservados. Sem competição, anúncios, compras ou cadastro.

## Abrir no computador

1. Extraia **todo** o ZIP para uma pasta.
2. Abra `index.html` no Chrome, Edge ou Firefox.
3. Não mova o HTML sozinho: ele usa `assets`, `js` e `styles.css`.

Para desenvolvimento: instale Node.js e execute `npm start` na pasta. O endereço é mostrado no terminal. Não é necessário instalar pacotes.

## Abrir no celular e atualizar o GitHub Pages

Envie o conteúdo extraído para a raiz do repositório `laboratorio-mariri-kids`, substituindo os arquivos de mesmo nome. Mantenha as pastas completas. O `index.html` deve ficar na raiz, e não dentro de uma pasta adicional. Depois do processamento do GitHub Pages, abra o endereço habitual do jogo. Este ZIP não publica nem altera automaticamente seu repositório.

No Android, recomendamos usar o endereço publicado no navegador. Abrir HTML pelo gerenciador de arquivos pode impedir o carregamento de scripts. A voz depende do navegador e das vozes instaladas no aparelho.

## O que está funcional

- Duas regiões navegáveis: Jardim original e Vale, com Fazendinha, Escolinha e Casa de Jogos.
- Logo oficial fornecida, preservada; seis personagens humanos, apelido opcional, três pets e roupas/acessórios visíveis.
- Horta com seis canteiros e 14 cultivos: 13 alimentos e girassol. Plantar, cuidar, aguardar 30 segundos, colher e guardar.
- Sete animais da fazenda. Cuidado com alimento, água e descanso antes da coleta de leite, ovos ou lã. Descanso virtual de 20 segundos, sem penalização por sair.
- Casa com quarto e sala decoráveis, acesso ao jardim, cozinha e seis atividades de cuidado do pet. Lã pode virar manta ou tapete.
- Dez receitas: as três anteriores e sete novas. Seleção de ingredientes, sequência de preparo, consumo real do inventário. Aveia disponível na despensa. Comida humana e comida dos pets permanecem separadas.
- Casa de Jogos: quebra-cabeças de 4, 8, 12, 16 e 24 peças; antigos 6 e 9 preservados. Memória de 4 a 20 cartas, com progressão; configuração de 6 cartas anterior preservada.
- Montagem de quatro figuras; sequências, associação e diferenças com três desafios cada.
- Escolinha: Português, Matemática, Inglês, Natureza e Esportes, cada um com três etapas de três perguntas.
- **Brasil e Mundo:** seis biomas, 26 estados e Distrito Federal com capitais, seis cidades e seis países. Cartões narrados, bandeiras e quatro conjuntos de desafios.
- Seis baús com conteúdo fixo visível antes de abrir: móveis, brinquedos, roupas e acessórios. Sem sorteio ou compra. Recompensas únicas por descoberta.
- Sons dos botões, leitura em voz alta, redução de movimentos, início e voltar nos painéis.
- Progresso local: personagem, pet, apelido, inventário, conquistas, roupas, móveis, cultivos e preferências.

## Progresso anterior

Na primeira abertura, a V3 procura os dados da V2 ou V1 no mesmo navegador e endereço. A migração preserva as conquistas e inventário anteriores e grava uma chave nova para a V3, sem apagar os dados antigos. Mudança de domínio, navegador, aparelho ou pasta de arquivos locais pode criar um armazenamento diferente. Não há sincronização entre aparelhos. A cópia JSON em Responsáveis é um backup para suporte; importação pela interface ainda não existe.

## Limites e próximos desenvolvimentos

- Este é um preview funcional. Cenários são imagens, avatares são SVG e animais/pets usam emojis animados por CSS; não são personagens 3D independentes.
- Narração usa síntese de voz com ritmo mais lento e tom ajustado. Não há gravação de voz infantil. Disponibilidade/offline variam por aparelho.
- A área de geografia é um catálogo inicial. Há bandeiras de 20 unidades federativas, de Curitiba e dos seis países. Faltam as bandeiras de AC, AM, MT, PB, PI, SE e TO e das demais cinco cidades. Seus cartões já funcionam, com ícone de localização em vez de bandeira inventada.
- Cidades iniciais: Uberlândia, Belo Horizonte, Curitiba, Manaus, Salvador e São Paulo. Países: Brasil, Japão, França, Itália, Portugal e África do Sul.
- Biomas usam cenas simbólicas e descrições breves. Ainda não existe mapa geográfico com limites dos biomas, estados ou países, nem exploração espacial desses territórios.
- Diferenças e sequências são desafios visuais de escolha; montagem usa encaixe por toque. Não há arrastar livre ou editor livre de formas.
- Veterinário e receitas são brincadeiras educativas simplificadas, não simulações clínicas nem receitas culinárias completas.
- Não foram realizados testes com crianças, avaliação pedagógica formal nem testes em aparelhos Android físicos.

## Estrutura

`js/content.js`: conteúdo educativo e catálogos. `js/engine.js`: estado, migração, inventário e recompensas. `js/app.js`: interação e telas. `styles.css`: visual responsivo. `assets`: imagens locais. `docs`: fontes, arte e validação.

Execute `npm test` para testar migração, inventário, coleta, recompensas, baralhos e integridade dos recursos.
