import { APP_NAME } from '../config/constants';

export const TERMS_OF_USE = {
  title: `Termos de Uso — ${APP_NAME}`,
  lastUpdated: '15 de Outubro de 2026',
  sections: [
    {
      title: '1. O que é o aplicativo',
      content:
        `${APP_NAME} é um espaço seguro e afetuoso de companhia, informação orientativa e comunidade anônima para gestantes e mães de recém-nascidos. Nossos conteúdos e ferramentas apoiam o bem-estar materno, mas NÃO substituem consultas médicas, exames pré-natais ou atendimentos de emergência obstétrica e pediátrica.`,
    },
    {
      title: '2. Comunidade Anônima e Convivência Acolhedora',
      content:
        'A comunidade é estritamente anônima para que você compartilhe sentimentos reais sem medo de julgamentos. É proibido divulgar dados de contato pessoal (como telefones, redes sociais, endereços), vender produtos, veicular ofensas, discursos de ódio ou julgamentos maternos. Todas as mães merecem respeito e apoio mútuo.',
    },
    {
      title: '3. Maioridade e Acesso',
      content:
        'O uso deste aplicativo é destinado a pessoas com 18 anos ou mais. A liberação de acesso está associada à confirmação de aquisição do plano e validação do e-mail da compradora.',
    },
    {
      title: '4. Direitos Autorais e Uso Pessoal',
      content:
        'Todos os textos, calculadoras, guias e conteúdos originais são de propriedade exclusiva do aplicativo e de seus autores, sendo vedada a reprodução ou compartilhamento comercial não autorizado.',
    },
  ],
};

export const PRIVACY_POLICY = {
  title: `Política de Privacidade — ${APP_NAME}`,
  lastUpdated: '15 de Outubro de 2026',
  sections: [
    {
      title: '1. Coleta Mínima de Dados',
      content:
        'Respeitamos a sua privacidade acima de tudo. Coletamos apenas o e-mail (para login e verificação do acesso comprado), seu apelido anônimo e as datas de gestação ou nascimento do bebê para personalizar os marcos e agrupar sua turma.',
    },
    {
      title: '2. Tratamento de Dados Sensíveis de Saúde (LGPD)',
      content:
        'Dados relativos à fase gestacional, data provável do parto e nascimento do bebê são tratados como dados sensíveis sob a LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018). Esses dados são utilizados exclusivamente para calcular as semanas de gestação, exibir o conteúdo adequado ao seu momento e alocar sua participação na turma correspondente.',
    },
    {
      title: '3. Nunca Comercializamos seus Dados',
      content:
        'Não vendemos, alugamos nem compartilhamos seus dados com anunciantes ou terceiros para fins de marketing. O aplicativo é sustentado pela assinatura de nossas usuárias.',
    },
    {
      title: '4. Exclusão Total da Conta',
      content:
        'Você possui total controle. A qualquer momento, na aba "Mais", você pode solicitar a exclusão imediata e definitiva de sua conta, apagando permanentemente todos os seus dados dos nossos servidores.',
    },
  ],
};
