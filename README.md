
# Nursia — Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)

## Sobre o projeto

O **Nursia** é uma plataforma digital voltada à gestão de prontuários de enfermagem, desenvolvida no contexto do Mestrado Profissional em Telessaúde e Saúde Digital da Universidade do Estado do Rio de Janeiro (UERJ).

A aplicação tem como objetivo auxiliar os profissionais de enfermagem dos Centros de Atenção Psicossocial (CAPS) e das unidades de saúde na organização, consulta e registro de informações clínicas, contribuindo para a digitalização dos processos assistenciais e para a continuidade do cuidado ao paciente.

Este repositório contém o frontend da plataforma, responsável pela interface com o usuário, pela interação com os prontuários e pela comunicação com a API.

## Objetivos

- Digitalizar os registros do processo de enfermagem.
- Facilitar o acesso às informações clínicas dos pacientes.
- Auxiliar na organização e no acompanhamento dos atendimentos.
- Favorecer a continuidade do cuidado entre os serviços de saúde.
- Reduzir o trabalho manual de transcrição por meio de inteligência artificial.

## Funcionalidades

### Autenticação e controle de acesso

- Autenticação por senha de acesso.
- Diferenciação entre os perfis Enfermeiro CAPS e Enfermeiro Unidade.
- Proteção de rotas e funcionalidades conforme o perfil.
- Gerenciamento das senhas de acesso pelo perfil Enfermeiro CAPS.

### Gestão de prontuários

- Cadastro de prontuários de enfermagem.
- Consulta, edição e exclusão conforme as permissões de acesso.
- Pesquisa de pacientes pelo nome.
- Ordenação e paginação dos registros.
- Formulário estruturado em etapas.
- Salvamento automático de rascunhos no navegador.

### Processo de enfermagem

O sistema contempla cinco etapas do processo de enfermagem:

1. Avaliação de enfermagem.
2. Diagnóstico de enfermagem.
3. Planejamento de enfermagem.
4. Implementação de enfermagem.
5. Evolução de enfermagem.

Os prontuários incluem informações clínicas, sociodemográficas, histórico de saúde, hábitos de vida, necessidades psicossociais e psicobiológicas, além de sinais vitais e medidas antropométricas.

### Dashboard

- Visualização dos prontuários cadastrados.
- Indicadores de pressão arterial sistólica elevada.
- Indicadores de glicemia capilar elevada.
- Acesso aos rascunhos de prontuários.
- Busca e organização dos registros.

### Digitalização com inteligência artificial

- Captura de imagens de documentos pela câmera do dispositivo.
- Upload de até duas imagens.
- Extração automatizada de informações clínicas por meio da API.
- Consolidação dos dados extraídos.
- Revisão e correção das informações antes do salvamento.

## Tecnologias utilizadas

| Tecnologia | Finalidade |
| --- | --- |
| React | Desenvolvimento da interface |
| JavaScript | Linguagem de programação |
| Vite | Ambiente de desenvolvimento e build |
| Tailwind CSS | Estilização e responsividade |
| Material UI | Componentes de interface |
| React Router | Gerenciamento de rotas |
| Axios | Comunicação com a API REST |
| Framer Motion | Animações e transições |
| Lucide React | Ícones |
| Day.js e date-fns | Manipulação de datas |
| ESLint | Análise estática de código |
| Vercel | Hospedagem e deploy |

## Arquitetura

O Nursia utiliza uma arquitetura com separação entre frontend e backend.

```text
Usuário
   |
   v
Nursia Client (React)
   |
   | HTTP / REST API
   v
Nursia Server (Node.js + Express)
   |
   +---- MongoDB
   |
   +---- Cloudflare Workers AI
```

O frontend é responsável pela apresentação das informações e interação com os usuários, enquanto o backend centraliza as regras de negócio, a persistência dos dados, o controle de acesso e a integração com serviços de inteligência artificial.

## Estrutura do projeto

```text
nursia-client/
├── public/
├── src/
│   ├── components/    # Componentes reutilizáveis
│   ├── hooks/         # Hooks personalizados
│   ├── lib/           # Lógica compartilhada
│   ├── pages/         # Páginas da aplicação
│   ├── services/      # Comunicação com a API
│   ├── styles/        # Estilos globais
│   ├── utils/         # Funções auxiliares
│   ├── App.jsx        # Rotas e estrutura principal
│   └── main.jsx       # Ponto de entrada
├── index.html
├── package.json
├── vercel.json
└── vite.config.js
```

## Instalação e execução

### Pré-requisitos

- Node.js 22.12+ (versão recomendada).
- npm.
- Git.
- Nursia Server em execução.

### 1. Clone o repositório

```bash
git clone https://github.com/coder-gabrielsantos/nursia-client.git
cd nursia-client
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com o endereço do backend:

```env
VITE_API_URL=http://localhost:4000
```

### 4. Execute a aplicação

```bash
npm run dev
```

A aplicação estará disponível em:

http://localhost:5173

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a versão de produção |
| `npm run preview` | Visualiza a versão de produção |
| `npm run lint` | Executa a análise estática de código |

## Deploy

O projeto possui configuração para hospedagem na Vercel, incluindo o redirecionamento de rotas da Single Page Application (SPA).

Para realizar o deploy, configure a variável `VITE_API_URL` com o endereço da API em produção.

## Segurança e privacidade

Por se tratar de uma aplicação que manipula informações sensíveis de saúde, sua utilização deve observar os princípios de confidencialidade, privacidade e proteção de dados pessoais, incluindo as disposições aplicáveis da Lei Geral de Proteção de Dados (LGPD).

Os rascunhos são armazenados localmente no navegador. Recomenda-se utilizar dispositivos autorizados e evitar o armazenamento de informações clínicas em equipamentos de uso público ou compartilhado sem controle adequado.

As informações extraídas por inteligência artificial devem ser obrigatoriamente revisadas pelo profissional de enfermagem antes de serem incorporadas ao prontuário.

A plataforma é uma ferramenta de apoio ao trabalho assistencial e não substitui a avaliação clínica ou a tomada de decisão profissional.

## Contexto acadêmico

- **Instituição:** Universidade do Estado do Rio de Janeiro (UERJ).
- **Programa:** Mestrado Profissional em Telessaúde e Saúde Digital.
- **Área de aplicação:** Enfermagem, saúde mental e saúde digital.

## Repositório relacionado

- [Nursia Server — Backend](https://github.com/coder-gabrielsantos/nursia-server)

## Créditos

- **Concepção, requisitos clínicos e coordenação:** Rafael Rocha de Melo (Mestrado Profissional em Telessaúde e Saúde Digital, UERJ).
- **Desenvolvimento técnico (backend e frontend):** [Gabriel Santos](https://github.com/coder-gabrielsantos).

---

**Nursia** — Tecnologia a serviço da enfermagem e da continuidade do cuidado.
