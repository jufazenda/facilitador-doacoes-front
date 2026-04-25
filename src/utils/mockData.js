export const campaigns = [
  {
    id: 1,
    title: "Fisioterapia que transforma",
    institution: "Associação Passos de Luz",
    badge: "Urgente",
    badgeType: "urgent",
    raised: "R$ 48.750",
    goal: "R$ 75.000",
    percentage: 65,
    daysLeft: "28 dias restantes",
  },
  {
    id: 2,
    title: "Sala sensorial inclusiva",
    institution: "Instituto Caminhos do Saber",
    badge: "Nova",
    badgeType: "new",
    raised: "R$ 26.300",
    goal: "R$ 60.000",
    percentage: 44,
    daysLeft: "45 dias restantes",
  },
  {
    id: 3,
    title: "Equipamentos de mobilidade",
    institution: "Centro de Reabilitação Esperança",
    badge: "Urgente",
    badgeType: "urgent",
    raised: "R$ 33.210",
    goal: "R$ 90.000",
    percentage: 37,
    daysLeft: "19 dias restantes",
  },
];

export const campaignFilters = [
  "Todos",
  "Urgentes",
  "Higiene & Cuidados Pessoais",
  "Alimentação",
  "Educação & Escolar",
  "Roupas & Calçados",
  "Brinquedos & Lazer",
  "Financeira",
  "Saúde & Medicamentos",
  "Pets",
  "Moradia & Utensílios",
];

export const platformMetrics = [
  {
    icon: "♡",
    value: "R$ 124 mil",
    label: "arrecadados",
    description: "em doações com total transparência",
  },
  {
    icon: "⚑",
    value: "86",
    label: "campanhas concluídas",
    description: "impacto real, histórias transformadas",
  },
  {
    icon: "🛡",
    value: "42",
    label: "instituições verificadas",
    description: "avaliadas com rigor e cuidado",
  },
];

export const steps = [
  {
    icon: "⌕",
    title: "1. Explore",
    text: "Descubra campanhas e instituições verificadas.",
  },
  {
    icon: "♡",
    title: "2. Doe com segurança",
    text: "Sua doação é protegida e o impacto é garantido.",
  },
  {
    icon: "▥",
    title: "3. Acompanhe",
    text: "Veja como sua doação está transformando vidas.",
  },
  {
    icon: "♁",
    title: "4. Compartilhe",
    text: "Convide outras pessoas para multiplicar o impacto.",
  },
];

export const instituicoes = [
  {
    id: 1,
    nome: "Associação Passos de Luz",
    descricao: "Organização sem fins lucrativos dedicada à reabilitação física e inclusão social de pessoas com deficiência, oferecendo fisioterapia, terapia ocupacional e suporte emocional.",
    cidade: "São Paulo",
    estado: "SP",
    fundadoEm: 2010,
    cnpj: "12.345.678/0001-90",
    email: "contato@passosdeluz.org.br",
    telefone: "+55 11 3456-7890",
    verificada: true,
    certificacoes: ["OSCIP", "Utilidade Pública Federal", "ISO 9001"],
    balancoSocial: {
      familiasBeneficiadas: 1240,
      voluntarios: 87,
      arrecadadoTotal: 380000,
      campanhasRealizadas: 23,
    },
    redesSociais: { instagram: "#", facebook: "#" },
  },
  {
    id: 2,
    nome: "Instituto Caminhos do Saber",
    descricao: "Espaço de educação inclusiva para crianças com transtornos de aprendizagem e neurodesenvolvimento, com salas multissensoriais e atendimento especializado.",
    cidade: "Belo Horizonte",
    estado: "MG",
    fundadoEm: 2015,
    cnpj: "98.765.432/0001-10",
    email: "contato@caminhosdosaber.org.br",
    telefone: "+55 31 2222-3333",
    verificada: true,
    certificacoes: ["Utilidade Pública Estadual", "Certificação de Educação Especial"],
    balancoSocial: {
      familiasBeneficiadas: 650,
      voluntarios: 42,
      arrecadadoTotal: 195000,
      campanhasRealizadas: 11,
    },
    redesSociais: { instagram: "#", facebook: null },
  },
  {
    id: 3,
    nome: "Centro de Reabilitação Esperança",
    descricao: "Centro especializado no fornecimento de equipamentos de mobilidade e reabilitação para pessoas de baixa renda, promovendo independência e dignidade.",
    cidade: "Curitiba",
    estado: "PR",
    fundadoEm: 2008,
    cnpj: "55.444.333/0001-22",
    email: "esperanca@reabilitacao.org.br",
    telefone: "+55 41 3333-5555",
    verificada: true,
    certificacoes: ["OSCIP", "Certificação de Acessibilidade"],
    balancoSocial: {
      familiasBeneficiadas: 870,
      voluntarios: 55,
      arrecadadoTotal: 260000,
      campanhasRealizadas: 18,
    },
    redesSociais: { instagram: "#", facebook: "#" },
  },
];

export const campanhas = [
  {
    id: 1,
    titulo: "Fisioterapia que transforma",
    instituicao: "Associação Passos de Luz",
    instituicaoId: 1,
    categoria: "Saúde & Medicamentos",
    descricao: "Ajude a garantir sessões contínuas de fisioterapia para crianças e adultos com mobilidade reduzida. Cada sessão representa um passo a mais rumo à independência.",
    meta: 75000,
    arrecadado: 48750,
    urgente: true,
  },
  {
    id: 2,
    titulo: "Sala sensorial inclusiva",
    instituicao: "Instituto Caminhos do Saber",
    instituicaoId: 2,
    categoria: "Educação & Escolar",
    descricao: "A sala sensorial é um ambiente terapêutico essencial para crianças com autismo e TEA. Com equipamentos especializados, ela amplia o desenvolvimento cognitivo e emocional.",
    meta: 60000,
    arrecadado: 26300,
    urgente: false,
  },
  {
    id: 3,
    titulo: "Equipamentos de mobilidade",
    instituicao: "Centro de Reabilitação Esperança",
    instituicaoId: 3,
    categoria: "Saúde & Medicamentos",
    descricao: "Cadeiras de rodas, andadores e muletas para pessoas em situação de vulnerabilidade que não têm acesso a esses recursos pelo sistema público.",
    meta: 90000,
    arrecadado: 33210,
    urgente: true,
  },
];

export const categorias = [
  "Higiene & Cuidados Pessoais",
  "Alimentação",
  "Educação & Escolar",
  "Roupas & Calçados",
  "Brinquedos & Lazer",
  "Financeira",
  "Saúde & Medicamentos",
  "Pets",
  "Moradia & Utensílios",
];

export const necessidadesMock = [
  { id: 1, titulo: "50 fraldas geriátricas tamanho G", categoria: "Saúde & Medicamentos", urgente: true, status: "aberta", criadaEm: "2024-04-10" },
  { id: 2, titulo: "Cadeira de rodas motorizada para adulto", categoria: "Saúde & Medicamentos", urgente: false, status: "aberta", criadaEm: "2024-04-08" },
  { id: 3, titulo: "Alimentos não-perecíveis para 20 famílias", categoria: "Alimentação", urgente: false, status: "atendida", criadaEm: "2024-03-20" },
];

export const atualizacoesMock = [
  {
    id: 1,
    titulo: "Meta 65% atingida!",
    mensagem: "Graças ao apoio de vocês, já alcançamos 65% da nossa meta. As sessões de fisioterapia seguem acontecendo toda semana. Obrigado pelo carinho!",
    campanha: "Fisioterapia que transforma",
    enviadaEm: "2024-04-15",
  },
];

export const doacoesInstituicaoMock = [
  { id: 1, doador: "Maria S.", campanha: "Fisioterapia que transforma", valor: 150, status: "aplicado" },
  { id: 2, doador: "João P.", campanha: "Fisioterapia que transforma", valor: 50, status: "confirmado" },
  { id: 3, doador: "Ana L.", campanha: "Fisioterapia que transforma", valor: 200, status: "processado" },
  { id: 4, doador: "Carlos M.", campanha: "Fisioterapia que transforma", valor: 75, status: "pendente" },
];

export const doadorMock = {
  nome: "Maria Silva",
  email: "doador@email.com",
  cpf: "123.456.789-00",
  desde: "2022-03-15",
  totalDoado: 850,
  totalDoacoes: 7,
  doacoesRecorrentes: 2,
  pontos: 850,
  ranking: 12,
  badges: [
    { id: 1, icon: "💜", label: "Primeiro passo", descricao: "Realizou a primeira doação" },
    { id: 2, icon: "🔥", label: "Doador constante", descricao: "3 doações consecutivas" },
    { id: 3, icon: "⭐", label: "Impacto real", descricao: "Ajudou 5 campanhas diferentes" },
  ],
};

export const historicoMock = [
  { id: 1, campanhaId: 1, campanha: "Fisioterapia que transforma", instituicao: "Associação Passos de Luz", valor: 150, data: "2024-04-01", status: "aplicado", tipo: "recorrente", intervalo: "mensal", metodo: "pix" },
  { id: 2, campanhaId: 2, campanha: "Sala sensorial inclusiva", instituicao: "Instituto Caminhos do Saber", valor: 50, data: "2024-03-15", status: "confirmado", tipo: "unica", metodo: "cartao" },
  { id: 3, campanhaId: 3, campanha: "Equipamentos de mobilidade", instituicao: "Centro de Reabilitação Esperança", valor: 100, data: "2024-03-01", status: "aplicado", tipo: "unica", metodo: "pix" },
];

export const rankingMock = [
  { posicao: 1, nome: "Carlos A.", pontos: 4200 },
  { posicao: 2, nome: "Fernanda R.", pontos: 3800 },
  { posicao: 3, nome: "Pedro M.", pontos: 2950 },
  { posicao: 4, nome: "Beatriz L.", pontos: 2100 },
  { posicao: 5, nome: "Lucas S.", pontos: 1750 },
];

export const instituicoesPendentesMock = [
  {
    id: 1,
    nome: "Instituto Esperança Viva",
    cnpj: "98.765.432/0001-10",
    cidade: "Campinas",
    estado: "SP",
    email: "contato@esperancaviva.org.br",
    telefone: "+55 19 3333-4444",
    descricao: "Organização focada em apoio a crianças em situação de vulnerabilidade social, oferecendo alimentação, educação complementar e apoio psicológico.",
    documento: "estatuto_social_2024.pdf",
    status: "pendente",
    submetidaEm: "2024-04-18",
  },
  {
    id: 2,
    nome: "Lar Solidário Santana",
    cnpj: "11.222.333/0001-44",
    cidade: "Ribeirão Preto",
    estado: "SP",
    email: "lar@solidariosantana.org.br",
    telefone: "+55 16 3222-5555",
    descricao: "Abrigo para idosos em situação de abandono, com atendimento médico, fisioterapia e atividades de lazer.",
    documento: "registro_cnpj_2024.pdf",
    status: "aprovada",
    submetidaEm: "2024-03-10",
    resolvidaEm: "2024-03-20",
  },
  {
    id: 3,
    nome: "ONG Sonhos em Ação",
    cnpj: "55.666.777/0001-88",
    cidade: "Santos",
    estado: "SP",
    email: "contato@sonhosemacao.org.br",
    telefone: "+55 13 4444-6666",
    descricao: "Projeto de inclusão digital para jovens de comunidades carentes, oferecendo cursos de informática e programação.",
    documento: "ata_fundacao_2023.pdf",
    status: "rejeitada",
    submetidaEm: "2024-02-25",
    resolvidaEm: "2024-03-05",
    motivoRejeicao: "Documentação incompleta. O CNPJ informado não consta na base da Receita Federal como ativo.",
  },
];
