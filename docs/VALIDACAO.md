# Verificação da V3

- 12 testes automatizados de estado e recursos: migração V1/V2, saldo, decoração, armazenamento, baralhos, coleta no tempo certo, receitas, compras, baús, confecção e catálogos.
- Sintaxe JavaScript validada pelo Node.js.
- Navegação em navegador Chromium: personalização de personagem/pet/apelido; troca de região; Escolinha → Brasil e Mundo → biomas → desafio completo → recompensa; cuidado do pet; abertura de baú; equipar roupa; fazenda → alimentar/água/descanso → coletar leite; quebra-cabeça de quatro peças completo.
- Verificação visual em iframe de 390 × 844: estados e bandeiras, cartões, narração e quebra-cabeça. Sem rolagem horizontal no documento nesse teste.
- Limites: voz depende do aparelho; não validada por escuta humana. Não houve teste em Android físico ou com crianças. Não se afirma que cada combinação possível de progressão foi testada manualmente.

## V3.1

- Comparação byte a byte dos cinco arquivos principais do ZIP do repositório com a V3: iguais.
- 13 testes automatizados passaram, incluindo consistência dos recursos versionados e preservação da chave de salvamento.
- Percurso verificado no navegador: escolher personagem/pet/apelido → plantar alface → esperar → colher → preparar Folhinhas frescas com ingredientes consumidos → comprar/posicionar cama → abrir baú → recarregar → cama e progresso preservados.
- Tela estreita em iframe 390 × 844: logo medida em 52 × 52 px; largura do documento igual à largura disponível, sem excesso horizontal. Seleção de personagem acessível acima do mapa.
- Testes em navegador de desktop e iframe estreito; ainda precisa de confirmação no Android físico do usuário e no GitHub Pages após publicar. O cache do aparelho não foi inspecionado, portanto sua causa não é declarada como comprovada.
