# Tasks

## 1. Fundação da aplicação

- [x] 1.1 Inicializar o projeto Next.js 16.4 com App Router, TypeScript e scripts de desenvolvimento, build, lint e teste; verificar que instalação, lint e build de produção terminam com sucesso.
- [x] 1.2 Organizar os módulos de interface, domínio, autenticação e acesso a dados sem importar código server-only em componentes cliente; verificar por teste de arquitetura ou build que as fronteiras não vazam dependências do servidor.
- [x] 1.3 Definir e validar a configuração tipada de ambiente para conexão ao banco, URL pública, fuso da agenda e bootstrap administrativo; verificar por testes que valores ausentes ou inválidos falham com mensagens explícitas e sem revelar segredos.
- [x] 1.4 Criar a base visual responsiva e os layouts público e administrativo com estados de carregamento, vazio e erro; verificar em viewports móvel e desktop que não há conteúdo cortado ou navegação inacessível.

## 2. Persistência PostgreSQL

- [x] 2.1 Configurar o driver PostgreSQL e o sistema de migrações versionadas; verificar contra um banco limpo que todas as migrações sobem sem intervenção manual.
- [x] 2.2 Criar as tabelas de barbeiro, credencial administrativa, sessão, períodos semanais e agendamentos com chaves, índices, limites e tipos definidos no design; verificar o schema resultante em teste de integração.
- [x] 2.3 Implementar a restrição PostgreSQL de exclusão para intervalos semiabertos de agendamento; verificar em teste de integração que intervalos adjacentes são aceitos e sobreposições são rejeitadas.
- [x] 2.4 Implementar repositórios e transações sem registrar dados pessoais ou credenciais; verificar operações de criação e consulta e inspecionar os logs gerados pelos testes.

## 3. Horários de trabalho

- [x] 3.1 Implementar validação de períodos por dia, incluindo término após início e proibição de sobreposição; verificar com testes unitários para dias fechados, múltiplos períodos e entradas inválidas.
- [x] 3.2 Implementar leitura e substituição transacional da semana de trabalho, incluindo aplicação de um padrão aos dias selecionados; verificar que alterar um dia não modifica os demais.
- [x] 3.3 Implementar a resolução de períodos locais para instantes UTC no fuso IANA da agenda; verificar com testes de datas comuns e transições de horário de verão.
- [x] 3.4 Implementar a geração de janelas completas de 60 minutos e exclusão de restos menores; verificar os cenários de `working-hours/spec.md` com testes unitários.

## 4. Autenticação administrativa

- [x] 4.1 Implementar bootstrap idempotente do barbeiro e da credencial inicial, com senha armazenada apenas como hash seguro; verificar que a repetição não duplica o usuário e que configuração ausente impede bootstrap inseguro.
- [x] 4.2 Implementar login, criação de token aleatório, armazenamento apenas do hash da sessão, cookie seguro e expiração; verificar login válido, credencial inválida e atributos do cookie em testes de integração.
- [x] 4.3 Implementar verificação server-side compartilhada para páginas, Server Actions e Route Handlers administrativos, além de logout com revogação; verificar respostas não autenticadas, sessão expirada e sessão revogada.
- [x] 4.4 Garantir mensagens de autenticação não enumeráveis e logs sem senha ou token; verificar por testes de erro e inspeção dos logs capturados.

## 5. Domínio e API de agendamentos

- [x] 5.1 Implementar a consulta de disponibilidade combinando expediente, janelas, horário atual e agendamentos existentes; verificar horários livres, ocupados, passados e fora do expediente em testes unitários e de integração.
- [x] 5.2 Implementar o contrato público de disponibilidade retornando somente início, fim e estado; verificar por teste de resposta que nome, telefone, observação e identificadores privados nunca são expostos.
- [x] 5.3 Implementar reserva pública com validação de nome, telefone, observação opcional, janela futura e expediente; verificar todos os cenários de reserva pública e limites dos campos.
- [x] 5.4 Implementar criação administrativa de marcações futuras dentro ou fora do expediente, sempre sem sobreposição; verificar a autorização e ambos os tipos de horário em testes de integração.
- [x] 5.5 Traduzir conflitos da restrição do banco em erro de horário indisponível; verificar com duas solicitações concorrentes que exatamente uma reserva é confirmada.
- [x] 5.6 Adicionar limitação básica de frequência à criação pública e limites de intervalo para consultas da agenda; verificar que excesso de solicitações é recusado sem afetar o painel autenticado.

## 6. Agenda pública

- [x] 6.1 Criar a rota pública baseada no slug do barbeiro com navegação por datas e estados disponível, ocupado e indisponível; verificar o fluxo em viewport móvel e desktop.
- [x] 6.2 Criar o formulário de reserva com nome, telefone, observação livre opcional e exemplo de intenção de atendimento; verificar acessibilidade, validação e envio com e sem observação.
- [x] 6.3 Atualizar a agenda após confirmação e tratar conflito tardio solicitando nova escolha; verificar em teste de fluxo que o horário confirmado passa imediatamente a ocupado.
- [x] 6.4 Adicionar testes de fluxo que inspecionem página e chamadas públicas para confirmar que nenhum dado pessoal de outra marcação é exibido ou retornado.

## 7. Painel do barbeiro

- [x] 7.1 Criar páginas de login e logout e proteger todo o layout administrativo; verificar redirecionamento sem sessão e acesso após autenticação válida.
- [x] 7.2 Criar a visão diária de agendamentos em ordem cronológica com horário, nome, telefone, observação e origem; verificar dias com marcações e estado vazio em testes de fluxo.
- [x] 7.3 Criar o formulário administrativo de nova marcação, permitindo horários futuros fora do expediente e impedindo conflitos; verificar os dois comportamentos em teste de fluxo.
- [x] 7.4 Criar o editor semanal com dias fechados, múltiplos períodos, aplicação de padrão a dias selecionados e horários específicos de fim de semana; verificar persistência, validação e alteração independente por dia.
- [x] 7.5 Verificar que reduzir o expediente preserva marcações existentes e altera apenas novas disponibilidades públicas, cobrindo o cenário com teste de integração.

## 8. Docker Compose e validação integrada

- [x] 8.1 Criar Dockerfile multiestágio para a saída standalone, executando como usuário não privilegiado, e `.dockerignore`; verificar que a imagem é construída e inicia sem ferramentas de desenvolvimento no runtime.
- [x] 8.2 Criar `.env.example` sem segredos e documentar variáveis, bootstrap inicial, URL pública, persistência, backup e necessidade de HTTPS; verificar que um ambiente novo pode ser configurado somente pela documentação.
- [x] 8.3 Criar o Docker Compose final com serviços `app` e `db`, PostgreSQL em versão fixa, volume nomeado, rede interna, healthchecks e dependência de saúde; verificar com `docker compose config` que a configuração é válida e o banco não publica porta externa.
- [x] 8.4 Integrar migrações e bootstrap idempotentes antes da aplicação no fluxo de subida; verificar que `docker compose up --build` em volume vazio deixa banco e aplicação saudáveis e que uma segunda subida preserva dados sem duplicação.
- [x] 8.5 Executar no ambiente Compose o fluxo completo de configurar expediente, reservar como cliente, impedir uma reserva concorrente e consultar os detalhes no painel; verificar também responsividade, privacidade pública, lint, testes e build antes de considerar a mudança concluída.

## Workflow follow-up

- Revisar os artefatos e os resultados de teste antes de expor a aplicação publicamente.
- Arquivar a mudança OpenSpec depois que todos os requisitos de revisão forem atendidos.
