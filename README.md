# A Luz do Mariri Kids — Jardim das Descobertas

**V1 · proposta inicial jogável · 2 de novembro de 2026**

Um pequeno jardim para crianças de **4 a 8 anos**, acompanhadas por um responsável. A proposta é brincar, descobrir, cuidar e levar pequenos gestos para a vida. Este projeto é independente das versões do jogo para jovens e adultos.

## Começar em um minuto

1. Extraia o ZIP inteiro.
2. Abra `index.html` no navegador. Mantenha `styles.css`, `js/` e `assets/` juntos.
3. Toque em qualquer lugar do mapa. Não há ordem obrigatória.
4. Conclua uma aventura, guarde a descoberta e use as sementes em **Meu jardim**.

Não precisa instalar pacotes nem criar conta. Os scripts usam caminhos relativos e funcionam sem etapa de compilação. Em alguns navegadores, o salvamento de arquivos abertos diretamente pelo computador é limitado; nesse caso, use o servidor opcional ou GitHub Pages.

## O que já funciona

| Lugar | Brincadeira | Descoberta |
|---|---|---|
| Horta da Terra | Semear, regar e oferecer luz, em três passos | Cuidado com as plantas |
| Lago da Água | Encontrar e recolher quatro objetos virtuais | Cuidado com a água |
| Bosque do Ar | Jogo de memória com 3 ou 4 pares de animais | Observação e atenção |
| Roda do Sol | Escolher como está se sentindo, ou passar, e conhecer um cuidado | Emoções e pedir companhia |

- Mapa ilustrado com quatro lugares clicáveis e casa na árvore.
- Seis companheiros animais para escolher, sem diferenças de poder.
- Duas sementes na **primeira conclusão** de cada aventura; oito sementes no total.
- Oito espaços decoráveis, quatro tipos de plantas, possibilidade de guardar e trocar plantas sem perder sementes.
- Álbum com quatro lembranças e uma proposta de cuidado fora da tela para cada aventura.
- Brincadeiras repetíveis, sem cobrança de frequência e sem cronômetro.
- Leitura em voz alta opcional, caso o navegador tenha suporte.
- Área dos responsáveis: quantidade de pares, movimentos reduzidos, exportação do progresso e reinício com confirmação.
- Salvamento local e aviso quando o navegador não permite salvar.

## Novo repositório e GitHub Pages

Nome sugerido: **a-luz-do-mariri-kids**.

1. Crie seu novo repositório no GitHub.
2. Envie **o conteúdo extraído do ZIP**, mantendo as pastas. Não envie apenas o ZIP: `index.html` precisa ficar na raiz do repositório.
3. No repositório, abra **Settings → Pages**.
4. Em **Build and deployment / Source**, selecione **Deploy from a branch**.
5. Escolha a branch que recebeu os arquivos, normalmente `main`, e a pasta **/(root)**. Salve.
6. Quando a publicação terminar, use o endereço mostrado pelo próprio GitHub.

Guia oficial consultado: https://docs.github.com/pt/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Este pacote não contém credenciais, identificação do site anterior, endereço de repositório obrigatório ou configurações que alterem o site principal. O domínio do Instituto e o jogo adulto ficam independentes.

## Desenvolvimento opcional

Com Node instalado:

```sh
npm test
npm run dev
```

O servidor opcional usa a porta 3000; `npm start` também aceita a variável `PORT`. Não há dependências externas. Não é necessário executar `npm install`.

## Organização

- `index.html`: mapa e estrutura da interface.
- `styles.css`: aparência e ajustes para diferentes telas.
- `js/content.js`: textos, animais, plantas e aventuras.
- `js/engine.js`: regras, normalização dos dados e salvamento.
- `js/app.js`: interação, painéis, minijogos e narração.
- `assets/`: ilustração original e ícone provisório.
- `tests/engine.test.cjs`: testes do progresso, recompensas e armazenamento.
- `docs/CONCEITO.md`: proposta pedagógica e próximos passos.
- `docs/VALIDACAO.md`: o que foi verificado e limites desta versão.
- `docs/ARTE.md`: origem da arte e prompt utilizado.

## Dados e limitações

Somente o companheiro, as descobertas concluídas, as plantas e as preferências são salvos neste navegador, na chave `a-luz-do-mariri-kids-v1`. **Nenhuma resposta sobre sentimentos é armazenada.** A aplicação não envia dados para serviços próprios ou analytics. A voz é fornecida pelo navegador/sistema, cuja disponibilidade e funcionamento podem depender do dispositivo e da internet.

Não há conta online, sincronização, multijogador, painel remoto para responsáveis, importação de backup nem aplicativo de loja. O arquivo JSON exportado serve como cópia técnica para uma futura restauração. O funcionamento offline foi pensado para os arquivos extraídos; não há service worker ou instalação PWA nesta V1.

O foco é educativo. Não há substâncias, cerimônias, combate, sorteios, compras, anúncios, chat, ranking ou perfil psicológico. A área dos responsáveis organiza preferências; não é uma autenticação nem bloqueio parental seguro. O jogo não substitui acompanhamento profissional nem promete resultados terapêuticos.

Antes de um lançamento infantil público, realizar testes acompanhados com famílias, revisar acessibilidade, conteúdo, privacidade e direitos de marca. A identidade Kids e os personagens animais são uma proposta inicial, não uma mudança da logo oficial do Instituto.
