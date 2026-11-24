# Proposta

## Por que

O barbeiro precisa centralizar sua disponibilidade e seus agendamentos, enquanto os clientes precisam reservar horários livres sem depender de contato manual. O sistema deve oferecer esse fluxo com privacidade, operação simples e uma implantação inicial adequada a uma única máquina.

## O que muda

- Adiciona configuração de horário de trabalho por dia da semana, permitindo um padrão semanal e ajustes específicos, inclusive para sábado e domingo.
- Adiciona agenda pública acessível por link, exibindo horários disponíveis e ocupados sem revelar os dados dos clientes.
- Adiciona reserva pública sem conta, com nome, telefone e um texto livre sobre a intenção ou referência do atendimento.
- Define inicialmente cada agendamento como uma janela fixa de uma hora, preservando a possibilidade de tornar essa duração configurável posteriormente.
- Adiciona painel autenticado para o barbeiro consultar agendamentos, criar marcações em qualquer horário e administrar seus horários de trabalho.
- Adiciona persistência em PostgreSQL e empacotamento da aplicação com Docker e Docker Compose para execução em uma única máquina.
- Mantém fora do escopo inicial múltiplos barbeiros, contas de clientes, pagamentos, notificações automáticas e cancelamento ou reagendamento pelo cliente.

## Capacidades

### Novas capacidades

- `working-hours`: definição e resolução dos períodos de trabalho do barbeiro para cada dia da semana.
- `appointment-booking`: consulta pública da agenda e criação segura de agendamentos pelo cliente ou pelo barbeiro.
- `barber-dashboard`: acesso autenticado do barbeiro aos agendamentos e às configurações operacionais da agenda.

### Capacidades modificadas

Nenhuma.

## Impacto

- Criação da aplicação web, de sua API e do modelo de dados inicial.
- Introdução de autenticação exclusiva para o painel do barbeiro.
- Armazenamento de horários, agendamentos e credenciais no PostgreSQL.
- Necessidade de tratamento transacional para impedir duas reservas no mesmo horário.
- Exposição de uma agenda pública que deve preservar nome, telefone e observações dos clientes.
- Inclusão de imagens Docker, migrações de banco e um arquivo Docker Compose para aplicação e PostgreSQL.
