# Delta da especificação

## Purpose

Oferecer uma agenda pública que permita consultar disponibilidade e reservar atendimentos sem expor dados pessoais nem aceitar conflitos de horário.

## ADDED Requirements

### Requirement: Acesso público por link
O sistema MUST disponibilizar a agenda do barbeiro por um link público que não exija autenticação do cliente.

#### Scenario: Abrir a agenda pública
- **WHEN** um visitante acessa o link válido da agenda
- **THEN** o sistema apresenta datas e horários consultáveis para aquele barbeiro

### Requirement: Visualização pública com privacidade
O sistema MUST indicar se cada janela é disponível ou ocupada sem revelar nome, telefone, intenção ou qualquer outro dado da marcação existente.

#### Scenario: Consultar horário ocupado
- **WHEN** um cliente visualiza uma janela que já possui agendamento
- **THEN** o sistema a identifica apenas como ocupada

#### Scenario: Consultar horário livre
- **WHEN** um cliente visualiza uma janela futura dentro do expediente e sem agendamento
- **THEN** o sistema a identifica como disponível para reserva

### Requirement: Reserva pública de horário
O sistema MUST permitir que um cliente reserve uma janela futura disponível informando nome, telefone e, opcionalmente, um texto livre com sua intenção ou referência para o atendimento.

#### Scenario: Criar reserva com observação
- **WHEN** o cliente informa nome, telefone, uma intenção de atendimento e confirma uma janela disponível
- **THEN** o sistema cria um agendamento de uma hora e confirma a reserva

#### Scenario: Criar reserva sem observação
- **WHEN** o cliente informa nome e telefone válidos, deixa a observação vazia e confirma uma janela disponível
- **THEN** o sistema cria o agendamento sem exigir o texto opcional

#### Scenario: Omitir dado obrigatório
- **WHEN** o cliente tenta reservar sem nome ou sem telefone
- **THEN** o sistema rejeita a solicitação e identifica os campos obrigatórios

#### Scenario: Reservar fora do expediente
- **WHEN** um cliente tenta reservar uma janela fora do horário de trabalho configurado
- **THEN** o sistema rejeita a solicitação sem criar agendamento

#### Scenario: Reservar horário passado
- **WHEN** um cliente tenta reservar uma janela que já começou
- **THEN** o sistema rejeita a solicitação sem criar agendamento

### Requirement: Criação administrativa de agendamento
O sistema MUST permitir que o barbeiro autenticado crie uma marcação futura em qualquer horário, inclusive fora do expediente público, desde que não haja conflito.

#### Scenario: Marcar dentro do expediente
- **WHEN** o barbeiro cria uma marcação em uma janela futura livre dentro do expediente
- **THEN** o sistema registra o agendamento de uma hora

#### Scenario: Marcar fora do expediente
- **WHEN** o barbeiro cria uma marcação futura livre fora do horário de trabalho configurado
- **THEN** o sistema registra o agendamento e o trata como ocupado

#### Scenario: Informar dados do cliente no painel
- **WHEN** o barbeiro cria uma marcação com nome, telefone e observação opcional
- **THEN** o sistema armazena esses dados para exibição exclusiva no painel autenticado

### Requirement: Exclusividade da janela
O sistema MUST garantir atomicamente que dois agendamentos não ocupem total ou parcialmente o mesmo intervalo de tempo.

#### Scenario: Solicitações simultâneas para a mesma janela
- **WHEN** duas solicitações concorrentes tentam reservar a mesma janela livre
- **THEN** o sistema confirma apenas uma e informa à outra que o horário não está mais disponível

#### Scenario: Barbeiro tenta usar uma janela ocupada
- **WHEN** o barbeiro tenta criar uma marcação que se sobrepõe a um agendamento existente
- **THEN** o sistema rejeita a nova marcação e preserva o agendamento existente

### Requirement: Duração inicial fixa
O sistema MUST criar todos os agendamentos deste MVP com duração de uma hora e MUST armazenar seus instantes de início e término.

#### Scenario: Persistir intervalo do agendamento
- **WHEN** uma reserva é confirmada para começar às 14:00
- **THEN** o sistema armazena início às 14:00 e término às 15:00 no fuso da agenda

### Requirement: Atualização imediata da disponibilidade
O sistema MUST refletir um agendamento confirmado nas consultas públicas subsequentes.

#### Scenario: Consultar após confirmação
- **WHEN** um agendamento acaba de ser confirmado para uma janela
- **THEN** a próxima consulta pública apresenta essa janela como ocupada
