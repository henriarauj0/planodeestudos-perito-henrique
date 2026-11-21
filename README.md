# Dashboard do Concurseiro: PC-AC Perito Criminal (Área 4, Informática Forense)

Este é um sistema de planejamento e controle de estudos para o concurso da Polícia Civil do Acre (Edital nº 001 SEAD/PCAC, de 05/11/2026, banca IDECAN). A prova será em 24/01/2027, das 07h00 às 12h00, no horário do Acre.

Ele foi feito com React 18, TypeScript, Vite, Tailwind CSS e Lucide React. O progresso é salvo no LocalStorage do navegador, e há botões para exportar e importar um backup em JSON.

## Como rodar localmente

Pré-requisito: Node.js 18 ou superior (https://nodejs.org).

1. Clone o repositório e entre na pasta.
2. Instale as dependências: `npm install`
3. Inicie o servidor de desenvolvimento: `npm run dev`
4. Abra o endereço exibido no terminal (normalmente http://localhost:5173).

Para gerar uma versão estática, rode `npm run build`. O resultado fica em `dist/`. Para conferir essa versão, rode `npm run preview`. Como o build usa caminhos relativos, a pasta `dist/` pode ser publicada no GitHub Pages, no Netlify ou em qualquer hospedagem estática.

## Estrutura

| Caminho | Conteúdo |
| --- | --- |
| `src/data/editalData.ts` | Dados fixos: perfil, pesos, regras de corte, disciplinas e tópicos do Anexo III, grade semanal, domingos de simulado e temas de discursiva |
| `src/types.ts` | Tipos do domínio e do estado persistido |
| `src/hooks/useStudyStore.tsx` | Estado global, persistência em LocalStorage, backup e restauração |
| `src/hooks/useActiveTimer.ts` | Cronômetro e Pomodoro. O estado é persistido, então um recarregamento da página não perde a sessão |
| `src/lib/metrics.ts` | Progresso ponderado, taxas de acerto, projeção de nota e pontuação de simulados |
| `src/lib/dates.ts` | Semanas do plano e horas previstas até a data |
| `src/components/ui/*` | Componentes base no estilo shadcn/ui |
| `src/components/dashboard/*` | Cabeçalho, contagem regressiva, KPIs e backup |
| `src/components/schedule/*` | Grade semanal, timer, registro de sessões e alocação de tempo por peso |
| `src/components/edital/*` | Edital verticalizado, tópicos e drawer de notas e caderno de erros |
| `src/components/simulados/*` | Simulados, gráfico de evolução e checklist de discursiva |

## Regras de cálculo

O progresso de um tópico é calculado assim: Teoria vale 60%, Revisão 1 vale 20% e Revisão 2 vale 20%. O progresso de cada disciplina é a média dos seus tópicos. O progresso geral é ponderado pela pontuação máxima de cada disciplina, isto é, questões multiplicadas pelo peso, num total de 160.

Uma sessão registrada pelo timer com um tópico selecionado soma as questões diretamente nesse tópico. Uma sessão sem tópico soma as questões no nível da disciplina.

A cor do percentual de acerto segue três faixas: vermelho abaixo de 60%, amarelo de 60% a 79% e verde a partir de 80%. O alerta de corte usa a meta pessoal, que pode ser ajustada na aba do edital (padrão de 60%). As regras oficiais do edital são outras: 50% da objetiva, 1 ponto por disciplina básica e jurídica e 2 pontos nos específicos (subitem 10.5).

A divisão das 60 questões específicas entre TI (40) e Criminalística/Medicina Legal (20) é uma estimativa, porque o edital não a fixa. Para alterá-la, edite `questions` em `editalData.ts`.

## Personalização

A grade semanal, os tópicos e os temas de discursiva ficam em `src/data/editalData.ts`. No caso dos blocos que atendem mais de uma disciplina, o campo `allocation` define como os minutos se dividem para o card "Tempo do plano × peso na nota".
