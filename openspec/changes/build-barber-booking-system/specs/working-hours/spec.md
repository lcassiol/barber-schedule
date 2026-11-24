# Delta da especificação

## Purpose

Permitir que o barbeiro defina quando atende em cada dia da semana e que o sistema derive dessa configuração os horários disponíveis ao público.

## ADDED Requirements

### Requirement: Configuração semanal por dia
O sistema MUST permitir que o barbeiro autenticado configure, para cada dia da semana, se trabalha e um ou mais períodos de início e término do expediente.

#### Scenario: Configurar horários diferentes por dia
- **WHEN** o barbeiro salva períodos distintos para segunda-feira e terça-feira
- **THEN** o sistema mantém e utiliza a configuração própria de cada dia

#### Scenario: Configurar horários específicos no fim de semana
- **WHEN** o barbeiro define períodos próprios para sábado ou domingo
- **THEN** o sistema utiliza esses períodos sem herdar automaticamente os horários dos dias úteis

#### Scenario: Fechar um dia da semana
- **WHEN** o barbeiro marca um dia como sem expediente
- **THEN** o sistema não oferece horários públicos nesse dia

### Requirement: Aplicação de um padrão semanal
O sistema MUST permitir que o barbeiro aplique o mesmo conjunto de períodos a vários dias selecionados, mantendo a possibilidade de alterar cada dia posteriormente.

#### Scenario: Aplicar padrão aos dias úteis
- **WHEN** o barbeiro seleciona segunda a sexta e aplica um período padrão
- **THEN** o sistema grava o período em cada dia selecionado

#### Scenario: Sobrescrever um dia após aplicar o padrão
- **WHEN** o barbeiro altera apenas a configuração de quarta-feira após aplicar um padrão
- **THEN** o sistema preserva o padrão nos outros dias e utiliza a nova configuração na quarta-feira

### Requirement: Validação dos períodos de trabalho
O sistema MUST rejeitar períodos inválidos ou sobrepostos dentro do mesmo dia da semana.

#### Scenario: Horário final anterior ao inicial
- **WHEN** o barbeiro tenta salvar um período cujo término não ocorre depois do início
- **THEN** o sistema rejeita a configuração e informa o erro

#### Scenario: Períodos sobrepostos
- **WHEN** o barbeiro tenta salvar dois períodos que se sobrepõem no mesmo dia
- **THEN** o sistema rejeita a configuração e informa o conflito

### Requirement: Resolução de horários públicos
O sistema MUST gerar janelas consecutivas de uma hora inteiramente contidas nos períodos de trabalho do dia, usando o fuso horário configurado para a agenda.

#### Scenario: Período divisível em janelas completas
- **WHEN** um dia possui expediente das 09:00 às 12:00
- **THEN** o sistema gera as janelas 09:00, 10:00 e 11:00

#### Scenario: Tempo restante menor que uma hora
- **WHEN** o final do expediente deixa menos de uma hora após a última janela completa
- **THEN** o sistema não oferece uma janela parcial

#### Scenario: Mudança futura da duração
- **WHEN** a duração padrão for alterada em uma evolução posterior
- **THEN** a resolução de disponibilidade pode usar a nova duração sem exigir mudança nos períodos de trabalho armazenados
