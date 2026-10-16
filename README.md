# Pedro Victor — Time Machine

Portfólio em português com inspiração retrofuturista: tipografia de pôster, carro vetorial original, painel temporal e terminal em fósforo verde. O conteúdo equilibra desenvolvimento full-stack, dados e inteligência artificial.

## Executar

Requer Node.js 18 ou mais recente. Não há dependências npm nem etapa de build.

```sh
npm run dev
```

No PowerShell com execução de scripts restrita, use `npm.cmd run dev`. Abra http://localhost:5173. Para outra porta, defina a variável `PORT` antes de iniciar.

## Estrutura

- `dist/index.html`: conteúdo, projetos, trajetória e contato.
- `dist/styles.css`: identidade visual, layout e adaptação para celular.
- `dist/app.js`: sincronização da viagem com a rolagem, velocímetro e pausa de efeitos.
- `dist/assets/time-machine.svg`: ilustração vetorial editável, sem modelo 3D externo.
- `dist/assets/pedro-victor-curriculo.pdf`: currículo fornecido pelo autor.
- `scripts/serve.mjs`: servidor de desenvolvimento local.

O diretório `dist` pode ser hospedado diretamente em qualquer serviço de sites estáticos. O manifesto `.openai/hosting.json` identifica a prévia privada do Sites.

## Comportamento e acessibilidade

O scroll é nativo. No desktop, a cena permanece ao lado dos capítulos; no celular, aparece após a apresentação. Animações respondem ao scroll e deixam de renderizar quando o movimento termina. O botão de pausa e a preferência `prefers-reduced-motion` desativam as transformações. O conteúdo e os links permanecem disponíveis sem JavaScript.

Os anos 1985 e 2015 no painel são referências cinematográficas, não datas de projetos. Datas profissionais estão na seção Trajetória. A formação em Ciência da Computação mantém a conclusão prevista em 2026 conforme o currículo.

## Conteúdo e fontes

Conteúdo profissional extraído de `curriculoPedroVictor.pdf`, fornecido pelo autor. Projetos consultados em 15/10/2026:

- https://github.com/viictorcsv/cogudex — projeto em coautoria com Iara.
- https://github.com/viictorcsv/wikiart-style-classifier-yolo
- https://github.com/viictorcsv/credit-fraud-detection
- https://github.com/viictorcsv/daily-word
- https://github.com/viictorcsv/viictorcsv

Referência de experiência de rolagem: https://ayush-yadav.com/. Layout, ilustração e implementação deste portfólio foram desenvolvidos para este projeto. A fonte Barlow Condensed é distribuída sob SIL Open Font License; veja `dist/assets/OFL.txt`.

## Verificação

`npm run check` verifica a sintaxe JavaScript. O script opcional `python scripts/verify.py` usa Playwright e Microsoft Edge já instalados, com o servidor ativo, para verificar navegação, rolagem, download do PDF, ausência de overflow e preferência de movimento reduzido. Capturas são gravadas em `artifacts/`, fora da publicação.

## Próximas evoluções possíveis

Expandir os projetos com capturas reais e estudos de caso. Uma evolução da cena pode usar um modelo GLB licenciado de carro, mantendo a ilustração como alternativa em aparelhos de menor capacidade. Áudio, caso adicionado, deve depender de ação explícita do visitante.
