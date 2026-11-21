# Dashboard do Concurseiro — PC-AC · Perito Criminal · Área 04 (Informática Forense)

Ficha pessoal de planejamento e controle de estudos para o concurso da Polícia Civil do Estado do Acre, regido pelo Edital nº 001 SEAD/PCAC, de 05/11/2026, com banca IDECAN. A prova objetiva e a discursiva serão aplicadas em 24/01/2027, das 07h00 às 12h00, no horário do Acre (item 10.1 e Anexo II do edital). O plano vai de 24/11/2026 até a véspera da prova: são 9 semanas e 19 horas líquidas por semana, com meta de 168 horas.

> Projeto de uso pessoal e não oficial. Não tem vínculo com a Polícia Civil do Acre, com a SEAD nem com o IDECAN. Confira sempre as retificações publicadas em idecan.org.br e no Diário Oficial do Estado.

## Funcionalidades

**Painel superior.** Mostra a contagem regressiva até a prova e três indicadores. O progresso do edital é ponderado por questões × peso. As horas líquidas aparecem sobre a meta de 168h, com o saldo em relação ao previsto até hoje. A taxa de acerto é dividida por bloco, com alerta para cada disciplina abaixo da meta pessoal (padrão de 60%) e uma projeção da nota na objetiva.

**Aba 01, Cronograma & Timer.** Traz a grade das 9 semanas, com dois blocos por dia de segunda a sexta, quatro blocos no sábado e os domingos de simulado quinzenal (06/12, 20/12, 03/01 e 17/01). Cada bloco abre um Pomodoro (50/10, ajustável) ou um cronômetro progressivo. Ao finalizar, o tempo líquido é somado às métricas e você registra questões feitas e certas. Também mostra o histórico de sessões e o card "Tempo do plano × peso na nota", que compara a fatia de horas de cada disciplina com a fatia de pontos.

**Aba 02, Edital Verticalizado.** São 107 tópicos do Anexo III, agrupados por bloco e disciplina. Cada tópico tem marcação de Teoria, Revisão 1 e Revisão 2, campos de questões, percentual de acerto e um painel de notas com resumo, caderno de erros e links. Tópicos que não estavam na lista original levam a etiqueta `+ EDITAL`. A aba tem busca e filtros (sem teoria, revisão pendente, abaixo da meta, com notas).

**Aba 03, Simulados & Discursivas.** Tabela de simulados com cálculo da nota /200 e verificação do corte, gráfico de evolução nas 9 semanas e checklist de 16 temas de discursiva de Informática Forense, que aceita temas próprios.

**Backup.** Os botões "Exportar Dados (.json)" e "Importar Dados (.json)" ficam no topo da página. A importação mostra um resumo e pede confirmação antes de substituir os dados.

## Parâmetros do edital usados no sistema

| Bloco | Disciplina | Questões | Peso | Pontos |
| --- | --- | --- | --- | --- |
| Específicos | TI e Informática Forense (estimativa) | 40 | 2 | 80 |
| Específicos | Criminalística e Medicina Legal (estimativa) | 20 | 2 | 40 |
| Básicos | Língua Portuguesa | 6 | 1 | 6 |
| Básicos | Raciocínio Lógico | 6 | 1 | 6 |
| Básicos | Noções de Informática | 8 | 1 | 8 |
| Básicos | Realidade do Estado do Acre | 4 | 1 | 4 |
| Jurídicos | Noções de Direito Constitucional | 3 | 1 | 3 |
| Jurídicos | Noções de Direito Administrativo | 3 | 1 | 3 |
| Jurídicos | Noções de Direito Penal e Processual Penal | 6 | 1 | 6 |
| Jurídicos | Legislação Institucional | 4 | 1 | 4 |
| **Total objetiva** | | **100** | | **160** |
| Discursiva | Redação sobre conhecimentos específicos (20 a 30 linhas) | — | — | 40 |

A distribuição de questões e pesos vem do item 10.4, II. O edital não diz quantas das 60 questões específicas são de TI e quantas são do conteúdo comum de Perito. A divisão 40/20 é uma estimativa, proporcional ao número de itens do Anexo III.

Para ser aprovado na objetiva, é preciso fazer pelo menos 80 de 160 pontos, ter no mínimo 1 ponto em cada disciplina básica e jurídica e ao menos 2 pontos nos específicos (subitem 10.5). Na discursiva, o mínimo é 20 de 40 pontos (subitem 11.1.2). A discursiva só é corrigida para 4 candidatos da ampla concorrência e 3 com deficiência na Área 4, além dos empatados na última posição (subitem 11.2). Os 60% de acerto usados nos alertas são uma meta pessoal, não uma regra do edital.

## Identidade visual

O visual segue um minimalismo institucional e tático, no estilo de ficha pericial e dossiê, sem estética futurista, brilho, sombra ou gradiente.

| Elemento | Valor |
| --- | --- |
| Fundo | `#09090B` |
| Superfícies | `#121214` e `#18181B` |
| Bordas | 1px em `#27272A` |
| Texto | `#FAFAFA` (principal) e `#A1A1AA` (secundário) |
| Ação primária | botão `#FFFFFF` com texto `#09090B` |
| Desempenho ≥ 80% | `#16A34A` |
| Desempenho 60–79% | `#D97706` |
| Desempenho < 60% / corte | `#DC2626` |
| Fontes | Inter (texto) e JetBrains Mono (números, cronômetros, pesos, códigos e referências legais) |

As cores de status aparecem só em bordas e marcadores dos indicadores de acerto e de corte; os números continuam em branco, para manter a legibilidade. Os blocos da prova se distinguem por tons de cinza e pelas siglas ESP, BAS e JUR. As disciplinas levam etiquetas retangulares no estilo de evidência, como `PESO 02`, `PRIORIDADE ALTA` e `ÁREA 04 · TI`.

## Como rodar localmente

Pré-requisito: Node.js 18 ou superior (https://nodejs.org).

1. Clone o repositório e entre na pasta.
2. Instale as dependências com `npm install`.
3. Inicie o servidor de desenvolvimento com `npm run dev`.
4. Abra o endereço exibido no terminal (normalmente http://localhost:5173).

Para gerar a versão estática, use `npm run build`; o resultado fica em `dist/`. Para conferir o build, use `npm run preview`.

## Publicação privada no Vercel

O app é protegido por usuário e senha (HTTP Basic Auth) pelo `middleware.ts`, que roda no servidor do Vercel antes de entregar qualquer arquivo. Se as variáveis abaixo não estiverem definidas, o acesso é negado a todos. O `vercel.json` adiciona cabeçalhos `noindex`, para que o site não seja indexado por buscadores.

| Variável de ambiente | Conteúdo |
| --- | --- |
| `BASIC_AUTH_USER` | Usuário de acesso |
| `BASIC_AUTH_PASSWORD` | Senha forte, com 16 caracteres ou mais |

Pelo painel do Vercel:

1. Em vercel.com/new, importe este repositório. O preset Vite é detectado sozinho.
2. Antes de publicar, abra "Environment Variables" e crie as duas variáveis da tabela acima.
3. Clique em Deploy e acesse `https://<nome-do-projeto>.vercel.app`. O navegador pedirá o usuário e a senha.
4. Se o deploy não for para produção, vá em Settings, depois Git, e ajuste a "Production Branch" para o branch que contém este código.

Pela linha de comando:

1. Faça login com `npx vercel login`.
2. Vincule o projeto com `npx vercel link`.
3. Cadastre o usuário com `npx vercel env add BASIC_AUTH_USER production`.
4. Cadastre a senha com `npx vercel env add BASIC_AUTH_PASSWORD production`.
5. Publique com `npx vercel deploy --prod`.

Para trocar a senha, altere a variável no painel e faça um novo deploy.

## Onde ficam os dados

O progresso (checkboxes, questões, notas, sessões, simulados e discursivas) fica só no LocalStorage do navegador em que você usa o app. O Vercel apenas hospeda os arquivos e não guarda nenhuma métrica. Por isso, computador e celular têm dados separados, e limpar os dados do navegador apaga o progresso. Exporte o backup .json regularmente e use a importação para levar os dados a outro aparelho.

## Estrutura do código

| Caminho | Conteúdo |
| --- | --- |
| `src/data/editalData.ts` | Dados fixos: perfil, pesos, regras de corte, disciplinas e tópicos do Anexo III, prioridades, grade semanal, domingos de simulado e temas de discursiva |
| `src/types.ts` | Tipos do domínio e do estado persistido |
| `src/hooks/useStudyStore.tsx` | Estado global, persistência em LocalStorage, backup e restauração |
| `src/hooks/useActiveTimer.ts` | Cronômetro e Pomodoro. O estado é persistido, então recarregar a página não perde a sessão |
| `src/lib/metrics.ts` | Progresso ponderado, taxas de acerto, projeção de nota e pontuação de simulados |
| `src/lib/dates.ts` | Semanas do plano e horas previstas até a data |
| `src/lib/theme.ts` | Escala de cinza por bloco e rótulos de prioridade |
| `src/components/ui/*` | Componentes base (botão, card, etiqueta, modal, drawer, abas, indicador de acerto, destaque de referências legais) |
| `src/components/dashboard/*` | Cabeçalho, contagem regressiva, indicadores e backup |
| `src/components/schedule/*` | Grade semanal, timer, registro de sessões e card de alocação de tempo |
| `src/components/edital/*` | Edital verticalizado, linhas de tópico e painel de notas |
| `src/components/simulados/*` | Simulados, gráfico de evolução e checklist de discursiva |
| `middleware.ts` | Bloqueio de acesso por usuário e senha no Vercel |
| `vercel.json` | Configuração de build e cabeçalhos de segurança |

## Regras de cálculo

O progresso de um tópico é calculado assim: Teoria vale 60%, Revisão 1 vale 20% e Revisão 2 vale 20%. O progresso de cada disciplina é a média dos seus tópicos. O progresso geral é ponderado pela pontuação máxima de cada disciplina (questões × peso), num total de 160.

Uma sessão registrada com um tópico selecionado soma as questões diretamente nesse tópico. Uma sessão sem tópico soma as questões no nível da disciplina, sem contar em dobro.

O percentual de acerto usa três faixas: vermelho abaixo de 60%, âmbar de 60% a 79% e verde a partir de 80%. A meta de alerta pode ser ajustada na aba do edital.

## Personalização

A grade semanal, os tópicos, as prioridades e os temas de discursiva ficam em `src/data/editalData.ts`. Para mudar a divisão estimada das questões específicas, edite o campo `questions` das disciplinas `ti` e `crim`. Nos blocos que atendem mais de uma disciplina, o campo `allocation` define como os minutos se dividem no card "Tempo do plano × peso na nota".
