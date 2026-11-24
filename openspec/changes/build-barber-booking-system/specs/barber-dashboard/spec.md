# Delta da especificação

## Purpose

Fornecer ao barbeiro uma área privada para administrar sua agenda, consultar detalhes dos clientes e configurar os períodos de atendimento.

## ADDED Requirements

### Requirement: Autenticação do barbeiro
O sistema MUST exigir autenticação para todo acesso ao painel e às operações administrativas.

#### Scenario: Login com credenciais válidas
- **WHEN** o barbeiro envia credenciais válidas
- **THEN** o sistema inicia uma sessão autenticada e permite o acesso ao painel

#### Scenario: Login com credenciais inválidas
- **WHEN** alguém envia credenciais inválidas
- **THEN** o sistema rejeita o login sem revelar qual parte da credencial está incorreta

#### Scenario: Acesso administrativo sem sessão
- **WHEN** alguém sem sessão válida tenta acessar uma página ou operação administrativa
- **THEN** o sistema nega o acesso e solicita autenticação

#### Scenario: Encerrar sessão
- **WHEN** o barbeiro solicita sair do painel
- **THEN** o sistema invalida a sessão administrativa atual

### Requirement: Proteção das credenciais
O sistema MUST armazenar a senha do barbeiro somente como hash seguro e MUST aceitar a credencial inicial por configuração protegida de implantação.

#### Scenario: Inicializar credencial administrativa
- **WHEN** a aplicação é iniciada sem um barbeiro cadastrado e recebe a configuração inicial válida
- **THEN** o sistema cria o acesso administrativo sem persistir a senha em texto simples

#### Scenario: Configuração inicial ausente
- **WHEN** a aplicação precisa inicializar o acesso e a configuração obrigatória está ausente
- **THEN** o sistema falha de forma explícita sem criar uma credencial padrão insegura

### Requirement: Visão administrativa da agenda
O sistema MUST permitir que o barbeiro consulte seus agendamentos por data com horário, nome, telefone, observação e origem da marcação.

#### Scenario: Consultar dia com agendamentos
- **WHEN** o barbeiro autenticado seleciona uma data com marcações
- **THEN** o painel lista as marcações em ordem cronológica com todos os detalhes privados

#### Scenario: Consultar dia vazio
- **WHEN** o barbeiro autenticado seleciona uma data sem marcações
- **THEN** o painel informa que não existem agendamentos naquela data

### Requirement: Administração de horários de trabalho
O sistema MUST permitir que o barbeiro autenticado consulte e altere a configuração semanal de trabalho pelo painel.

#### Scenario: Abrir configuração de horários
- **WHEN** o barbeiro acessa a configuração de expediente
- **THEN** o painel apresenta o estado salvo para todos os dias da semana

#### Scenario: Salvar configuração válida
- **WHEN** o barbeiro envia uma configuração semanal válida
- **THEN** o sistema a persiste e passa a utilizá-la nas consultas públicas seguintes

#### Scenario: Alterar expediente com marcação existente
- **WHEN** o barbeiro altera o expediente e uma marcação existente fica fora do novo período
- **THEN** o sistema preserva a marcação e deixa de oferecer novas reservas públicas fora do novo expediente

### Requirement: Dados privados restritos
O sistema MUST disponibilizar nome, telefone e observações dos clientes somente em respostas e páginas administrativas autenticadas.

#### Scenario: Solicitar detalhes sem autenticação
- **WHEN** alguém sem sessão válida solicita detalhes de um agendamento
- **THEN** o sistema nega a solicitação sem retornar dados pessoais
