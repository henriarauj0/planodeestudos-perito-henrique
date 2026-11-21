/**
 * Dados fixos do concurso: Edital nº 001 SEAD/PCAC, de 05/11/2026 (banca IDECAN).
 * Cargo: Perito Criminal – Área 4 – Informática Forense.
 *
 * Fontes no edital:
 *  - Distribuição de questões e pesos: item 10.4, II.
 *  - Regras de aprovação na objetiva: subitem 10.5.
 *  - Discursiva (40 pontos, 20 a 30 linhas): subitens 11.1.1 a 11.1.3.
 *  - Data e horário da prova: ANEXO II (24/01/2027) e item 10.1 (07h às 12h, horário do Acre).
 *  - Conteúdo: ANEXO III ("Conteúdo comum a todas as áreas de Perito Criminal" e "Área 4 – Informática Forense").
 *
 * Tópicos com origin 'edital' não constavam da lista original do aluno e foram
 * acrescentados a partir do Anexo III para que o edital verticalizado fique completo.
 */
import type {
  BlockId,
  Discipline,
  DiscursivaTheme,
  ExamBlock,
  ExtraTrack,
  ScheduleDay,
} from '../types';

// ---------------------------------------------------------------------------
// Parâmetros do perfil e da prova
// ---------------------------------------------------------------------------

export const PROFILE = {
  cargo: 'Perito Criminal – Área 4: Informática Forense',
  orgao: 'Polícia Civil do Estado do Acre (PC-AC)',
  banca: 'IDECAN',
  edital: 'Edital nº 001 SEAD/PCAC, de 05/11/2026',
  /** Início do plano (data local). */
  startDate: '2026-11-24',
  /** Data da prova (domingo). */
  examDate: '2027-01-24',
  /** 07h00 no Acre (UTC-5) = 12h00 UTC. O Acre não adota horário de verão. */
  examStartUtc: '2027-01-24T12:00:00Z',
  examEndUtc: '2027-01-24T17:00:00Z',
  examTimeLabel: '07h00 às 12h00 (horário do Acre, UTC-5)',
  weeklyHours: 19,
  totalHoursGoal: 168,
  vagas: '1 vaga imediata (Baixo Acre)',
  discursivaCorrigidas:
    'Discursiva corrigida apenas para 4 candidatos da ampla concorrência + 3 PcD (subitem 11.2), além dos empatados na última posição.',
} as const;

export const EXAM_BLOCKS: ExamBlock[] = [
  {
    id: 'especificos',
    name: 'Conhecimentos Específicos',
    questions: 60,
    weight: 2,
    maxPoints: 120,
    minRule: 'Mínimo de 2,0 pontos no bloco (10.5, d)',
  },
  {
    id: 'basicos',
    name: 'Conhecimentos Básicos',
    questions: 24,
    weight: 1,
    maxPoints: 24,
    minRule: 'Mínimo de 1,0 ponto em cada disciplina (10.5, b)',
  },
  {
    id: 'juridicos',
    name: 'Conhecimentos Jurídicos',
    questions: 16,
    weight: 1,
    maxPoints: 16,
    minRule: 'Mínimo de 1,0 ponto em cada disciplina (10.5, c)',
  },
];

export const OBJECTIVE_MAX = 160;
export const DISCURSIVA_MAX = 40;
export const TOTAL_MAX = 200;
/** 50% do total da objetiva (10.5, a). */
export const OBJECTIVE_MIN = 80;
/** 50% da discursiva (11.1.2). */
export const DISCURSIVA_MIN = 20;

/** Ponderação do progresso de um tópico. */
export const TOPIC_STAGE_WEIGHTS = { t: 0.6, r1: 0.2, r2: 0.2 } as const;

// ---------------------------------------------------------------------------
// Disciplinas e tópicos (edital verticalizado)
// ---------------------------------------------------------------------------

export const DISCIPLINES: Discipline[] = [
  // ===================== ESPECÍFICOS (peso 2) =====================
  {
    id: 'ti',
    name: 'TI e Informática Forense',
    short: 'TI / Forense',
    block: 'especificos',
    questions: 40,
    weight: 2,
    estimated: true,
    topics: [
      { id: 'ti-01', ref: 'Itens 1 e 16', origin: 'edital', title: 'Organização e arquitetura de computadores; hardware (placas-mãe, memórias, armazenamento, interfaces de E/S, alimentação)' },
      { id: 'ti-02', ref: 'Item 1', origin: 'aluno', title: 'Processadores: arquiteturas paralelas, multiprocessamento, multicore, hyper-threading, GPUs, CUDA e processamento vetorial' },
      { id: 'ti-03', ref: 'Item 1', origin: 'aluno', title: 'Sistemas operacionais: arquiteturas, kernel, gerência de memória, de arquivos e de E/S, middleware' },
      { id: 'ti-04', ref: 'Item 1', origin: 'edital', title: 'Sistemas distribuídos (memória compartilhada), virtualização (emuladores, VMs, contêineres), RAID e computação quântica' },
      { id: 'ti-05', ref: 'Item 1', origin: 'aluno', title: 'Sistemas de arquivos NTFS, FAT32, exFAT, EXT3, EXT4 e XFS: organização e metadados' },
      { id: 'ti-06', ref: 'Item 2', origin: 'aluno', title: 'Bancos de dados: arquitetura, modelos, SGBDs relacionais, SQL, transações e análise de logs, multidimensional, NoSQL' },
      { id: 'ti-07', ref: 'Item 3', origin: 'aluno', title: 'Engenharia reversa: descompilação, debuggers, Assembly, ofuscação, compactadores (packers), malware polimórfico, sandboxing' },
      { id: 'ti-08', ref: 'Item 4', origin: 'edital', title: 'Linguagens de programação: OO (classes, herança, polimorfismo, sobrecarga), procedurais, compiladores, ligadores, interpretadores; C, Java, JavaScript, Python' },
      { id: 'ti-09', ref: 'Item 4', origin: 'aluno', title: 'Desenvolvimento Web (HTML, XML, JSON), APIs REST/GraphQL e análise estática de código (SonarQube)' },
      { id: 'ti-10', ref: 'Item 5', origin: 'edital', title: 'Estruturas de dados e algoritmos: listas, filas, pilhas, árvores, busca/ordenação, complexidade, autômatos (AFD/AFN)' },
      { id: 'ti-11', ref: 'Item 6', origin: 'aluno', title: 'Redes: tipos, topologias, comutação, equipamentos de interconexão, modelo OSI e TCP/IP, protocolos (IP, TCP, UDP, SCTP, ARP, DNS, DHCP, ICMP, OSPF, BGP, HTTP/S, SMTP, IMAP, POP3, SSH, FTP)' },
      { id: 'ti-12', ref: 'Item 6', origin: 'aluno', title: 'Redes sem fio e móveis, P2P, deep web, dark web, rede TOR e computação em nuvem' },
      { id: 'ti-13', ref: 'Item 7', origin: 'aluno', title: 'Segurança da informação: ISO/IEC 27001:2022 e 27002:2022, desenvolvimento seguro (SDL, CLASP, OWASP Top 10), segurança de contêineres (Docker, Kubernetes)' },
      { id: 'ti-14', ref: 'Item 7', origin: 'edital', title: 'Autenticação e autorização: SSO, SAML, OAuth 2.0, OpenID Connect, MFA, FIDO2/WebAuthn, biometria (facial, íris, voz, digital, comportamental)' },
      { id: 'ti-15', ref: 'Item 7', origin: 'aluno', title: 'Malware (vírus, worm, trojan, spyware, keylogger, backdoor, rootkit, adware, fileless, ransomware), OSINT e esteganografia' },
      { id: 'ti-16', ref: 'Item 7', origin: 'edital', title: 'Recuperação de dados: arquivos apagados em sistemas de arquivos e em nuvem (AWS, Azure, Google Cloud)' },
      { id: 'ti-17', ref: 'Item 8', origin: 'aluno', title: 'Segurança de redes: firewall, IDS/IPS, antivírus, EDR, XDR, SOAR, SIEM, NAT, proxy, VPN, IPSec, DNSSEC, SPF, DKIM, DMARC' },
      { id: 'ti-18', ref: 'Item 8', origin: 'aluno', title: 'Monitoramento de tráfego (sniffers/Wireshark, traffic shaping) e segurança Wi-Fi (WEP, WPA, WPA2, WPA3, EAP, 802.1X)' },
      { id: 'ti-19', ref: 'Item 8', origin: 'edital', title: 'Ataques (DoS/DDoS, botnets, spoofing, MAC flooding, buffer overflow, SQLi, XSS, DNS poisoning, zero-day), APTs, MITRE ATT&CK, CIS Controls, NIST CSF' },
      { id: 'ti-20', ref: 'Item 9', origin: 'aluno', title: 'Criptografia simétrica e assimétrica, modos de operação, RSA, AES, ECC, IDEA, Twofish, Blowfish, 3DES, RC4, Diffie-Hellman, certificação digital, protocolo Signal' },
      { id: 'ti-21', ref: 'Item 9', origin: 'aluno', title: 'Hashes (MD5, SHA-1, SHA-2, SHA-3, colisões) e ataques: força bruta, criptoanálise, canal lateral, texto conhecido/escolhido, MitM' },
      { id: 'ti-22', ref: 'Item 10', origin: 'edital', title: 'Windows (Desktop e Server): usuários e permissões, log de eventos, Registro do Windows, BitLocker' },
      { id: 'ti-23', ref: 'Item 11', origin: 'edital', title: 'Linux: usuários e permissões, administração, logs de sistema e serviços (proxy, e-mail, web, arquivos), shell e comandos' },
      { id: 'ti-24', ref: 'Item 12', origin: 'aluno', title: 'Android e iOS: arquitetura, segurança, permissões, sandboxing, criptografia, memória/processos, sistemas de arquivos (mobile forensics)' },
      { id: 'ti-25', ref: 'Item 13', origin: 'edital', title: 'Governança e legislação: ITIL 4, contratações de TI (Lei 14.133/2021), Marco Civil da Internet (Lei 12.965/2014), LGPD (Lei 13.709/2018), Lei 12.737/2012' },
      { id: 'ti-26', ref: 'Item 14', origin: 'aluno', title: 'Inteligência artificial: aprendizado supervisionado, não supervisionado, semissupervisionado e por reforço; redes neurais, deep learning, LLMs, PLN, IA generativa, deepfakes' },
      { id: 'ti-27', ref: 'Item 15', origin: 'aluno', title: 'Princípios da computação forense: crimes cibernéticos e vestígios; identificação, isolamento, preservação e coleta; cadeia de custódia do vestígio digital; principais exames (incl. memória RAM)' },
      { id: 'ti-28', ref: 'Item 17', origin: 'edital', title: 'Criptomoedas: blockchain, Bitcoin, stablecoins, altcoins, hard wallets e cold wallets' },
    ],
  },
  {
    id: 'crim',
    name: 'Criminalística e Medicina Legal',
    short: 'Criminalística / ML',
    block: 'especificos',
    questions: 20,
    weight: 2,
    estimated: true,
    topics: [
      { id: 'cr-01', ref: 'Itens 1.1 e 1.2', origin: 'aluno', title: 'Criminalística: conceito, objetivos, princípios e postulados; áreas de atuação e modalidades de perícia' },
      { id: 'cr-02', ref: 'Itens 1.3 e 1.4', origin: 'edital', title: 'Prova: conceito, objeto, tipos (confessional, testemunhal, documental, pericial), formas direta e indireta; corpo de delito' },
      { id: 'cr-03', ref: 'Itens 1.5 e 1.6', origin: 'aluno', title: 'Locais de crime (classificação, isolamento, preservação, levantamento), vestígios e indícios; cadeia de custódia (arts. 158-A a 158-F do CPP)' },
      { id: 'cr-04', ref: 'Item 2', origin: 'edital', title: 'Documentação pericial: fotografia forense, croqui, laudo e resposta a quesitos' },
      { id: 'cr-05', ref: 'Item 3', origin: 'aluno', title: 'Balística forense' },
      { id: 'cr-06', ref: 'Item 4', origin: 'edital', title: 'Documentoscopia e grafoscopia' },
      { id: 'cr-07', ref: 'Item 5', origin: 'edital', title: 'Perícia em acidentes de trânsito: levantamento, dinâmica e noções de cálculo de velocidade' },
      { id: 'cr-08', ref: 'Item 6', origin: 'edital', title: 'Perícia em locais de incêndio (arts. 158 e 159 do CPP)' },
      { id: 'cr-09', ref: 'Itens 7.1 a 7.3', origin: 'edital', title: 'Medicina legal: conceitos e divisões; corpo de delito, perícia e peritos; documentos médico-legais' },
      { id: 'cr-10', ref: 'Item 7.4', origin: 'edital', title: 'Identidade, identificação e reconhecimento; principais métodos de identificação' },
      { id: 'cr-11', ref: 'Item 7.5', origin: 'aluno', title: 'Traumatologia: ação contundente, armas brancas e projéteis de arma de fogo (comuns e de alta energia)' },
      { id: 'cr-12', ref: 'Item 7.6', origin: 'aluno', title: 'Tanatologia: diagnóstico da morte, fenômenos cadavéricos, cronotanatognose, comoriência e premoriência, exumação, morte súbita e suspeita' },
      { id: 'cr-13', ref: 'Item 7.7', origin: 'edital', title: 'Imputabilidade penal e capacidade civil: doença mental, desenvolvimento mental incompleto/retardado, perturbação mental' },
      { id: 'cr-14', ref: 'Itens 8 e 9', origin: 'edital', title: 'Lei 12.030/2009 (perícias oficiais de natureza criminal); ética e responsabilidade do perito' },
    ],
  },

  // ===================== BÁSICOS (peso 1) =====================
  {
    id: 'port',
    name: 'Língua Portuguesa',
    short: 'Português',
    block: 'basicos',
    questions: 6,
    weight: 1,
    topics: [
      { id: 'pt-01', ref: 'Item 1', origin: 'aluno', title: 'Leitura, compreensão e interpretação de textos; gêneros e tipologia textual' },
      { id: 'pt-02', ref: 'Itens 2 e 3', origin: 'aluno', title: 'Estruturação do texto e dos parágrafos; articulação textual (referenciação, nexos, conectivos)' },
      { id: 'pt-03', ref: 'Item 4', origin: 'aluno', title: 'Coesão (referencial, lexical, sequencial) e coerência textual' },
      { id: 'pt-04', ref: 'Item 5', origin: 'aluno', title: 'Reescrita de frases: equivalência, transformação, paralelismo sintático e semântico' },
      { id: 'pt-05', ref: 'Item 6', origin: 'edital', title: 'Significação contextual: sinonímia, antonímia, polissemia, ambiguidade, denotação e conotação' },
      { id: 'pt-06', ref: 'Item 7', origin: 'aluno', title: 'Ortografia oficial, acentuação gráfica e pontuação' },
      { id: 'pt-07', ref: 'Itens 8 e 9', origin: 'aluno', title: 'Morfologia, estrutura e formação de palavras; emprego das classes de palavras' },
      { id: 'pt-08', ref: 'Item 10', origin: 'aluno', title: 'Sintaxe: termos da oração; período composto por coordenação e subordinação' },
      { id: 'pt-09', ref: 'Item 11', origin: 'aluno', title: 'Concordância verbal e nominal' },
      { id: 'pt-10', ref: 'Itens 12 e 14', origin: 'aluno', title: 'Regência verbal e nominal; crase' },
      { id: 'pt-11', ref: 'Item 13', origin: 'edital', title: 'Colocação pronominal' },
      { id: 'pt-12', ref: 'Itens 15 a 17', origin: 'edital', title: 'Variação linguística, figuras de linguagem, gêneros digitais e IA aplicada à linguagem' },
    ],
  },
  {
    id: 'rlm',
    name: 'Raciocínio Lógico',
    short: 'RLM',
    block: 'basicos',
    questions: 6,
    weight: 1,
    topics: [
      { id: 'rl-01', ref: 'Item 1', origin: 'edital', title: 'Raciocínio lógico numérico: problemas com números reais' },
      { id: 'rl-02', ref: 'Itens 2 a 4', origin: 'aluno', title: 'Proposições simples e compostas, conectivos e tabelas-verdade' },
      { id: 'rl-03', ref: 'Item 4', origin: 'aluno', title: 'Equivalências lógicas e negação de proposições' },
      { id: 'rl-04', ref: 'Itens 5 e 6', origin: 'aluno', title: 'Argumentação lógica (validade de argumentos); verdades e mentiras' },
      { id: 'rl-05', ref: 'Itens 7 e 8', origin: 'aluno', title: 'Sequências e padrões; progressões aritmética e geométrica' },
      { id: 'rl-06', ref: 'Itens 9 e 10', origin: 'aluno', title: 'Relações de ordem e equivalência; problemas com conjuntos' },
      { id: 'rl-07', ref: 'Itens 10 e 14', origin: 'aluno', title: 'Porcentagem, razão e proporção, regra de três simples e composta, juros simples e compostos' },
      { id: 'rl-08', ref: 'Item 11', origin: 'aluno', title: 'Análise combinatória' },
      { id: 'rl-09', ref: 'Item 12', origin: 'aluno', title: 'Probabilidade: união de eventos, condicional, eventos independentes' },
      { id: 'rl-10', ref: 'Itens 13 e 15', origin: 'aluno', title: 'Média aritmética simples e ponderada; interpretação de gráficos e tabelas' },
    ],
  },
  {
    id: 'info',
    name: 'Noções de Informática',
    short: 'Informática Básica',
    block: 'basicos',
    questions: 8,
    weight: 1,
    topics: [
      { id: 'ni-01', ref: 'Item 1', origin: 'edital', title: 'Fundamentos: hardware, software, formatos de arquivo, armazenamento local/remoto/nuvem, versionamento, software livre e licenças' },
      { id: 'ni-02', ref: 'Item 2', origin: 'edital', title: 'Windows 11 e Linux Ubuntu: arquivos, pastas, permissões, contas, recuperação de arquivos, atualizações e privacidade' },
      { id: 'ni-03', ref: 'Item 3', origin: 'edital', title: 'Microsoft Word e LibreOffice Writer: estilos, sumário, mala direta, controle de alterações, proteção e PDF' },
      { id: 'ni-04', ref: 'Item 4', origin: 'edital', title: 'Microsoft Excel e LibreOffice Calc: fórmulas, referências, funções, filtros, validação, formatação condicional, tabelas dinâmicas' },
      { id: 'ni-05', ref: 'Item 5', origin: 'edital', title: 'PowerPoint e Impress; integração entre aplicativos (vinculação/incorporação), compatibilidade e PDF' },
      { id: 'ni-06', ref: 'Item 6', origin: 'edital', title: 'Internet, intranet, extranet; navegadores; HTTPS e certificados; operadores de busca; desinformação' },
      { id: 'ni-07', ref: 'Item 7', origin: 'edital', title: 'Correio eletrônico: SMTP, POP3, IMAP, webmail e clientes; regras; phishing e falsificação de remetente' },
      { id: 'ni-08', ref: 'Item 8', origin: 'edital', title: 'Nuvem e trabalho colaborativo (Microsoft 365, Google Workspace, Teams, Meet, Zoom): permissões, coautoria, links públicos' },
      { id: 'ni-09', ref: 'Item 9', origin: 'edital', title: 'Sistemas de informação: dado, informação e conhecimento; banco de dados; autenticação, autorização, auditoria; menor privilégio' },
      { id: 'ni-10', ref: 'Item 10', origin: 'aluno', title: 'Sistemas na Administração Pública: transparência ativa e passiva (LAI – Lei 12.527/2011), informação sigilosa e proteção de dados pessoais (LGPD)' },
    ],
  },
  {
    id: 'acre',
    name: 'Realidade do Estado do Acre',
    short: 'Realidade do Acre',
    block: 'basicos',
    questions: 4,
    weight: 1,
    topics: [
      { id: 'ac-01', origin: 'aluno', title: 'Formação histórica: ocupação, ciclos da borracha, Tratado de Ayacucho, Revolução Acreana, Tratado de Petrópolis, Território Federal, movimento autonomista e elevação a Estado' },
      { id: 'ac-02', origin: 'aluno', title: 'Movimento dos seringueiros, Chico Mendes e criação das reservas extrativistas' },
      { id: 'ac-03', origin: 'aluno', title: 'Geografia: localização, limites e fronteiras, fuso horário, municípios e regionais, bacias hidrográficas, relevo, clima, vegetação, unidades de conservação' },
      { id: 'ac-04', origin: 'aluno', title: 'Aspectos étnicos e culturais: povos indígenas (inclusive isolados), populações tradicionais, extrativismo, manifestações culturais' },
      { id: 'ac-05', origin: 'aluno', title: 'Aspectos políticos: Constituição do Estado do Acre, organização dos Poderes e símbolos estaduais' },
      { id: 'ac-06', origin: 'aluno', title: 'Aspectos sociais e econômicos: população, indicadores, economia extrativista e agropecuária, transportes, integração regional e fronteiriça' },
      { id: 'ac-07', origin: 'edital', title: 'Segurança pública no Acre: estrutura do sistema estadual e aspectos das regiões de fronteira' },
    ],
  },

  // ===================== JURÍDICOS (peso 1) =====================
  {
    id: 'const',
    name: 'Noções de Direito Constitucional',
    short: 'Dir. Constitucional',
    block: 'juridicos',
    questions: 3,
    weight: 1,
    topics: [
      { id: 'dc-01', origin: 'edital', title: 'Princípios fundamentais' },
      { id: 'dc-02', origin: 'aluno', title: 'Direitos e garantias fundamentais (art. 5º): direitos e deveres individuais e coletivos; remédios constitucionais' },
      { id: 'dc-03', origin: 'aluno', title: 'Administração Pública: disposições gerais e servidores públicos (arts. 37 a 41 da CF)' },
      { id: 'dc-04', origin: 'aluno', title: 'Segurança pública (art. 144 da CF)' },
      { id: 'dc-05', origin: 'edital', title: 'Constituição do Estado do Acre: segurança pública e Polícia Civil' },
    ],
  },
  {
    id: 'adm',
    name: 'Noções de Direito Administrativo',
    short: 'Dir. Administrativo',
    block: 'juridicos',
    questions: 3,
    weight: 1,
    topics: [
      { id: 'da-01', origin: 'aluno', title: 'Princípios da Administração Pública' },
      { id: 'da-02', origin: 'edital', title: 'Organização administrativa: administração direta e indireta; centralização, descentralização e desconcentração' },
      { id: 'da-03', origin: 'aluno', title: 'Poderes administrativos; poder de polícia; polícia administrativa e polícia judiciária' },
      { id: 'da-04', origin: 'aluno', title: 'Atos administrativos' },
      { id: 'da-05', origin: 'aluno', title: 'Agentes públicos' },
      { id: 'da-06', origin: 'edital', title: 'Responsabilidade civil do Estado' },
      { id: 'da-07', origin: 'aluno', title: 'Improbidade administrativa (Lei 8.429/1992, com as alterações da Lei 14.230/2021)' },
    ],
  },
  {
    id: 'penal',
    name: 'Noções de Direito Penal e Processual Penal',
    short: 'Penal / Proc. Penal',
    block: 'juridicos',
    questions: 6,
    weight: 1,
    topics: [
      { id: 'dp-01', origin: 'edital', title: 'Aplicação da lei penal; crime: conceito, tipicidade, ilicitude e culpabilidade; consumação e tentativa; concurso de pessoas' },
      { id: 'dp-02', origin: 'edital', title: 'Crimes contra a pessoa, contra o patrimônio e contra a dignidade sexual' },
      { id: 'dp-03', origin: 'edital', title: 'Crimes contra o respeito aos mortos (arts. 209 a 212 do CP) e contra a fé pública (arts. 296 a 311 do CP)' },
      { id: 'dp-04', origin: 'edital', title: 'Crimes contra a administração pública (arts. 312 a 327), falso testemunho/falsa perícia (art. 342) e fraude processual (art. 347)' },
      { id: 'dp-05', origin: 'edital', title: 'Tortura (Lei 9.455/1997) e abuso de autoridade (Lei 13.869/2019)' },
      { id: 'dp-06', origin: 'aluno', title: 'Crimes cibernéticos (Lei 12.737/2012 e tipos correlatos) — no edital, consta no item 13 da Área 4' },
      { id: 'dp-07', origin: 'aluno', title: 'Inquérito policial (arts. 4º a 23 do CPP)' },
      { id: 'dp-08', origin: 'aluno', title: 'Prova: disposições gerais, exame de corpo de delito, cadeia de custódia e perícias (arts. 155 a 184 do CPP); peritos e intérpretes (arts. 275 a 281)' },
      { id: 'dp-09', origin: 'edital', title: 'Identificação criminal (Lei 12.037/2009)' },
      { id: 'dp-10', origin: 'aluno', title: 'Prisão em flagrante, preventiva e temporária; medidas cautelares diversas da prisão' },
    ],
  },
  {
    id: 'leg',
    name: 'Legislação Institucional',
    short: 'Leg. Institucional',
    block: 'juridicos',
    questions: 4,
    weight: 1,
    topics: [
      { id: 'li-01', origin: 'edital', title: 'Lei Federal 14.735/2023 – Lei Orgânica Nacional das Polícias Civis' },
      { id: 'li-02', origin: 'aluno', title: 'LC Estadual 129/2004 e alterações – Lei Orgânica da Polícia Civil do Acre (inclusive LC 496/2025 e LC 526/2026)' },
      { id: 'li-03', origin: 'edital', title: 'Lei Estadual 2.250/2009 e alterações – Plano de Cargos, Carreiras e Remuneração da PC-AC' },
      { id: 'li-04', origin: 'edital', title: 'LC Estadual 39/1993 – Estatuto dos Servidores do Acre: direitos, deveres e regime disciplinar' },
    ],
  },
];

/** Trilhas que contam horas mas não fazem parte do edital verticalizado. */
export const EXTRA_TRACKS: ExtraTrack[] = [
  { id: 'discursiva', name: 'Discursiva (redação)', short: 'Discursiva' },
  { id: 'simulado', name: 'Simulado', short: 'Simulado' },
];

// ---------------------------------------------------------------------------
// Cronograma semanal (19h líquidas)
// ---------------------------------------------------------------------------

export const WEEKLY_SCHEDULE: ScheduleDay[] = [
  {
    weekday: 1,
    name: 'Segunda-feira',
    short: 'Seg',
    blocks: [
      { id: 'seg-1', label: 'TI / Informática Forense', minutes: 90, disciplineIds: ['ti'] },
      { id: 'seg-2', label: 'Língua Portuguesa', minutes: 90, disciplineIds: ['port'] },
    ],
  },
  {
    weekday: 2,
    name: 'Terça-feira',
    short: 'Ter',
    blocks: [
      { id: 'ter-1', label: 'TI / Informática Forense', minutes: 90, disciplineIds: ['ti'] },
      { id: 'ter-2', label: 'Raciocínio Lógico', minutes: 90, disciplineIds: ['rlm'] },
    ],
  },
  {
    weekday: 3,
    name: 'Quarta-feira',
    short: 'Qua',
    blocks: [
      { id: 'qua-1', label: 'TI / Informática Forense', minutes: 90, disciplineIds: ['ti'] },
      { id: 'qua-2', label: 'Direito Const. / Adm.', minutes: 90, disciplineIds: ['const', 'adm'], allocation: { const: 45, adm: 45 } },
    ],
  },
  {
    weekday: 4,
    name: 'Quinta-feira',
    short: 'Qui',
    blocks: [
      { id: 'qui-1', label: 'Criminalística e Med. Legal', minutes: 90, disciplineIds: ['crim'] },
      { id: 'qui-2', label: 'Língua Portuguesa', minutes: 90, disciplineIds: ['port'] },
    ],
  },
  {
    weekday: 5,
    name: 'Sexta-feira',
    short: 'Sex',
    blocks: [
      { id: 'sex-1', label: 'TI / Informática Forense', minutes: 90, disciplineIds: ['ti'] },
      { id: 'sex-2', label: 'Raciocínio Lógico', minutes: 90, disciplineIds: ['rlm'] },
    ],
  },
  {
    weekday: 6,
    name: 'Sábado',
    short: 'Sáb',
    blocks: [
      { id: 'sab-1', label: 'Revisão TI + Questões', minutes: 120, disciplineIds: ['ti', 'crim', 'info'], kind: 'revisao' },
      { id: 'sab-2', label: 'Penal / Proc. / Leg. PC-AC', minutes: 60, disciplineIds: ['penal', 'leg'], kind: 'questoes', allocation: { penal: 30, leg: 30 } },
      { id: 'sab-3', label: 'Realidade do Acre / LAI', minutes: 30, disciplineIds: ['acre', 'info'], allocation: { acre: 15, info: 15 } },
      { id: 'sab-4', label: 'Discursiva', minutes: 30, disciplineIds: ['discursiva'], kind: 'discursiva' },
    ],
  },
  {
    weekday: 0,
    name: 'Domingo',
    short: 'Dom',
    blocks: [],
    note: 'Descanso ou Simulado Quinzenal (07h00 às 12h00, horário oficial da prova)',
  },
];

/** Domingos de simulado quinzenal (semanas 2, 4, 6 e 8). */
export const SIMULADO_SUNDAYS = ['2026-12-06', '2026-12-20', '2027-01-03', '2027-01-17'];

// ---------------------------------------------------------------------------
// Discursiva – temas de Informática Forense para treino aos sábados
// ---------------------------------------------------------------------------

export const DISCURSIVA_THEMES: DiscursivaTheme[] = [
  { id: 'dt-01', title: 'Cadeia de custódia do vestígio digital (arts. 158-A a 158-F do CPP)', hint: 'Etapas, rastreabilidade, documentação e nulidades' },
  { id: 'dt-02', title: 'Coleta de evidências digitais: live forensics × post-mortem e ordem de volatilidade', hint: 'RFC 3227, memória RAM antes do disco' },
  { id: 'dt-03', title: 'Integridade da prova: imagem forense, write blocker e funções hash', hint: 'MD5/SHA-256, colisões, verificação' },
  { id: 'dt-04', title: 'Análise de memória volátil (dump de RAM) e seus vestígios', hint: 'Processos, conexões, chaves, malware fileless' },
  { id: 'dt-05', title: 'Ransomware: resposta a incidente e vestígios periciais', hint: 'Vetor de entrada, persistência, criptografia, resgate em cripto' },
  { id: 'dt-06', title: 'Perícia em dispositivos móveis (Android/iOS)', hint: 'Extração lógica, sistema de arquivos e física; criptografia; isolamento de rede' },
  { id: 'dt-07', title: 'Marco Civil da Internet: guarda de registros e requisição judicial', hint: 'Registros de conexão e de acesso a aplicações' },
  { id: 'dt-08', title: 'Deepfakes e IA generativa: detecção e valor probatório', hint: 'Artefatos, metadados, cadeia de custódia' },
  { id: 'dt-09', title: 'Criptomoedas: rastreamento em blockchain e apreensão de carteiras', hint: 'Endereços, exchanges, hard/cold wallets, seed phrase' },
  { id: 'dt-10', title: 'Recuperação de arquivos apagados em NTFS e EXT4', hint: 'MFT, inodes, slack space, file carving' },
  { id: 'dt-11', title: 'Linha do tempo a partir de logs (Windows Event Log, syslog, Registro)', hint: 'Correlação, fuso horário, integridade de logs' },
  { id: 'dt-12', title: 'Phishing e e-mail: análise de cabeçalhos, SPF, DKIM e DMARC', hint: 'Falsificação de remetente, rastreio de origem' },
  { id: 'dt-13', title: 'Perícia em ambiente de nuvem (AWS, Azure, Google Cloud)', hint: 'Volatilidade, multi-tenancy, jurisdição, logs do provedor' },
  { id: 'dt-14', title: 'Estrutura do laudo pericial de informática e resposta a quesitos', hint: 'Preâmbulo, histórico, exames, discussão, conclusão' },
  { id: 'dt-15', title: 'Anti-forense: esteganografia, criptografia de disco (BitLocker) e wiping', hint: 'Detecção e limites técnicos' },
  { id: 'dt-16', title: 'LGPD e tratamento de dados pessoais na atividade pericial', hint: 'Base legal, segurança pública, art. 4º, III' },
];

// ---------------------------------------------------------------------------
// Utilitários de consulta
// ---------------------------------------------------------------------------

export const ALL_TOPICS = DISCIPLINES.flatMap((d) =>
  d.topics.map((t) => ({ ...t, disciplineId: d.id })),
);

export function getDiscipline(id: string): Discipline | undefined {
  return DISCIPLINES.find((d) => d.id === id);
}

export function trackName(id: string, short = false): string {
  const d = getDiscipline(id);
  if (d) return short ? d.short : d.name;
  const x = EXTRA_TRACKS.find((e) => e.id === id);
  return x ? (short ? x.short : x.name) : id;
}

export function trackBlock(id: string): BlockId | 'extra' {
  return getDiscipline(id)?.block ?? 'extra';
}
