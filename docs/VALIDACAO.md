# Validação — V2

Data: 02/11/2026.

## Testes automáticos

8 testes Node aprovados: recompensas únicas; gasto sem perda de conquistas; persistência e sanitização; falha de armazenamento; baralhos de 3/4/6/8/10 pares; arquivos locais; migração da V1; colheita com relógio controlado, cozinha e compra de móveis. Verificação de sintaxe JavaScript aprovada.

## Teste real no navegador

- Entrada com apelido fictício e seleção de Sapinho.
- Plantio de alface com terra, composto, muda e água.
- Crescimento real de 30 segundos enquanto outra atividade acontece.
- Quebra-cabeça de quatro peças concluído; recompensa recebida.
- Compra de cama e colocação na casa.
- Colheita de alface; receita de folhas frescas pelos quatro passos até servir.
- Configuração de dez pares e exibição de vinte cartas; duas cartas viradas.
- Pergunta sobre insetos respondida e recompensa conferida.
- Conversa da Roda do Sol: participação, pular sentimento, só ouvir e guardar descoberta.
- Recarregar preservou apelido, móvel colocado e sementes.
- Layout de 390×844 verificado em iframe com viewport próprio; vinte cartas visíveis em quatro colunas, sem sobreposição.

## Limites

Não foi executada uma partida inteira de dez pares nem todos os quebra-cabeças e receitas no navegador. A estrutura dos baralhos até vinte cartas foi testada automaticamente. Não houve teste em aparelho físico, nem validação auditiva das vozes específicas de Android/iOS/Windows. A leitura usa Web Speech do dispositivo: o ajuste de ritmo/tom não garante um timbre infantil uniforme. Conteúdo visual novo usa ícones/emoji, cujo desenho depende do sistema; quebra-cabeças reutilizam a arte original do jardim. Não há dublagem gravada ou novos retratos ilustrados.

O ZIP é a entrega. Não foi publicado automaticamente no GitHub ou alterado o site existente. Não contém progresso de teste.
