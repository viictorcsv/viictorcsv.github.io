# Pedro Victor — Time Machine

Portfólio em português e inglês, baseado no esboço `Portfolio_261015_220558.pdf`: carro visto de cima, faixa temporal lateral, filmes, discos e terminal com pastas. O conteúdo equilibra desenvolvimento full-stack, dados e inteligência artificial.

## Executar

Requer Node.js 18 ou mais recente. Não há dependências npm. O comando de desenvolvimento gera as duas páginas estáticas antes de iniciar o servidor.

```sh
npm run dev
```

No PowerShell com execução de scripts restrita, use `npm.cmd run dev`. Abra http://localhost:5173. Para outra porta, defina a variável `PORT` antes de iniciar.

## Estrutura

- `scripts/content.mjs`: textos em português e inglês; edite aqui para alterar conteúdo.
- `scripts/build.mjs`: template compartilhado, gera os dois idiomas com `npm run build`.
- `dist/index.html`: página gerada em português (`/`).
- `dist/en/index.html`: página gerada em inglês (`/en/`).
- `dist/styles.css`: identidade visual, layout e adaptação para celular.
- `dist/app.js`: aceleração, faíscas em canvas, datas, temas, pastas e rascunho de e-mail.
- `dist/assets/time-machine-top.svg`: ilustração vetorial editável do carro visto de cima.
- `dist/assets/pedro-victor-curriculo.pdf`: currículo fornecido pelo autor.
- `scripts/serve.mjs`: servidor de desenvolvimento local.

O diretório `dist` pode ser hospedado diretamente em qualquer serviço de sites estáticos. O manifesto `.openai/hosting.json` identifica a prévia privada do Sites.

## Comportamento e acessibilidade

O scroll é nativo. No desktop, a cena permanece à direita; no celular, carro e data acompanham a leitura em uma faixa compacta no topo. A intensidade do scroll controla a velocidade, o movimento da pista, os rastros e as faíscas; o carro desacelera quando o scroll para. A renderização encerra após a desaceleração e a dissipação das partículas (máximo de 110, canvas limitado a DPR 2).

O botão de pausa e `prefers-reduced-motion` desativam os efeitos. Tema e pausa são armazenados localmente quando permitido. O seletor PT/EN mantém o capítulo atual entre as páginas. As pastas aceitam setas, Home e End. O texto dos dois idiomas e os links estão no HTML estático, sem depender de tradução externa.

O formulário prepara um link `mailto:` para revisão e envio pelo aplicativo do visitante. Não envia mensagens automaticamente e não depende de backend. Links das músicas abrem buscas no Spotify, sem reprodução automática. Os cartazes são ilustrações próprias em CSS. O currículo oferecido nos dois idiomas permanece em português e é identificado assim.

Os anos 1985 e 2015 no painel são referências cinematográficas, não datas de projetos. Datas profissionais estão na seção Trajetória. A formação em Ciência da Computação mantém a conclusão prevista em 2026 conforme o currículo.

## Conteúdo e fontes

Conteúdo profissional extraído de `curriculoPedroVictor.pdf`, fornecido pelo autor. Projetos consultados em 15/10/2026:

- https://github.com/viictorcsv/cogudex — projeto em coautoria com Iara.
- https://github.com/viictorcsv/wikiart-style-classifier-yolo
- https://github.com/viictorcsv/credit-fraud-detection
- https://github.com/viictorcsv/daily-word
- https://github.com/viictorcsv/viictorcsv

Referência inicial de rolagem: https://ayush-yadav.com/. A segunda versão segue o esboço fornecido pelo autor. Syne (títulos) e Manrope (texto) são fontes variáveis locais sob SIL Open Font License; veja `dist/assets/syne-OFL.txt` e `dist/assets/manrope-OFL.txt`.

## Verificação

`npm run check` verifica a sintaxe JavaScript. `python scripts/verify.py` usa Playwright e Microsoft Edge já instalados, com o servidor ativo. Verifica os dois idiomas em cinco larguras (320–1440 px), temas, navegação, datas, velocidade relativa do scroll, partículas visíveis, desaceleração, pausa, movimento reduzido, pastas por teclado, rascunho de e-mail e download do currículo. Capturas ficam em `artifacts/`, fora da publicação.

No Windows, os helpers de publicação do Sites precisam do Git Bash no início de `PATH` e de `TAR_OPTIONS=--force-local` para aceitar caminhos com letra de unidade. Caso haja diferença de proprietário entre sandbox e usuário, aplique `safe.directory` somente a este checkout no ambiente do processo Git. Não é necessário alterar configurações globais.

## Próximas evoluções possíveis

Expandir os projetos com capturas reais e estudos de caso. Uma evolução da cena pode usar um modelo GLB licenciado de carro, mantendo a ilustração como alternativa em aparelhos de menor capacidade. Áudio, caso adicionado, deve depender de ação explícita do visitante.
