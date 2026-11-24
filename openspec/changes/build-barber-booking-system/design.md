# Design

## Contexto

O repositório contém apenas a estrutura OpenSpec, portanto a aplicação será iniciada do zero. Consulte `proposal.md` para a motivação e `specs/` para os contratos funcionais.

O primeiro ambiente terá um barbeiro, clientes públicos sem conta, uma única instância da aplicação e PostgreSQL na mesma máquina por meio de Docker Compose. A interface deve funcionar em desktop e celular, e os dados pessoais das marcações não podem atravessar a fronteira administrativa.

## Objetivos / Não objetivos

**Objetivos:**

- Manter interface, regras de negócio e API em um único serviço implantável.
- Fazer do PostgreSQL a autoridade para horários, agendamentos, credenciais e sessões.
- Impedir conflitos mesmo quando duas reservas chegam simultaneamente.
- Separar explicitamente consultas públicas de operações administrativas.
- Armazenar instantes de agendamento de forma segura em relação a fuso horário.
- Produzir uma implantação reproduzível para uma única máquina.

**Não objetivos:**

- Dividir o sistema em microsserviços ou adicionar filas e cache distribuído.
- Criar suporte multiempresa ou para vários barbeiros neste MVP.
- Implementar conta de cliente, pagamento, notificações ou autoatendimento para cancelamento.
- Tornar a duração das janelas configurável agora; o modelo apenas evita impedir essa evolução.
- Incluir proxy reverso, domínio, certificado TLS ou backup automatizado no Compose inicial.

## Decisões

### 1. Monólito full-stack em Next.js 16.4 com TypeScript

A aplicação usará Next.js 16.4, App Router e TypeScript. Páginas públicas e administrativas ficam no mesmo projeto; leituras podem ocorrer no servidor e mutações são expostas por Route Handlers ou Server Actions com validação no servidor. Cada operação administrativa verifica sessão e autorização, independentemente da proteção de navegação.

O build usará a saída `standalone` para gerar uma imagem de produção pequena e adequada ao Docker.

**Alternativas consideradas:** frontend e API separados aumentariam serviços, configuração e implantação sem benefício para o volume inicial. Uma aplicação somente estática não atende autenticação, persistência nem concorrência de reservas.

### 2. PostgreSQL como fonte única de verdade

O banco armazenará:

- `barbers`: identidade única, slug público e fuso horário IANA da agenda;
- `admin_credentials`: login e hash de senha do barbeiro;
- `sessions`: sessões administrativas revogáveis com expiração;
- `weekly_work_periods`: dia da semana, hora inicial e final, admitindo vários períodos por dia;
- `appointments`: início e fim, nome, telefone, observação opcional, origem e timestamps de auditoria.

Instantes de agendamento serão gravados como `timestamptz` em UTC. Os períodos semanais serão horas locais associadas ao fuso IANA do barbeiro. A camada de domínio converte uma data local e seus períodos em instantes antes de calcular disponibilidade, incluindo transições de horário de verão.

**Alternativas consideradas:** SQLite simplificaria o contêiner, mas o PostgreSQL foi solicitado e oferece uma garantia robusta de exclusão para intervalos concorrentes. Armazenar apenas o horário inicial dificultaria duração configurável e detecção futura de sobreposição.

### 3. Exclusão de intervalos no banco

Uma restrição de exclusão do PostgreSQL impedirá sobreposição entre os intervalos `[start_at, end_at)` dos agendamentos. Toda criação ocorrerá em transação e converterá a violação da restrição em resposta de horário indisponível. A validação prévia melhora a experiência, mas não substitui a restrição do banco.

O uso de intervalo semiaberto permite agendamentos adjacentes, por exemplo 09:00-10:00 e 10:00-11:00. A origem distinguirá reservas públicas das criadas pelo barbeiro.

**Alternativas consideradas:** consultar e depois inserir sem restrição deixa uma condição de corrida. Bloqueios globais na aplicação não protegem contra múltiplos processos nem reinícios.

### 4. Disponibilidade calculada, não materializada

Para uma data solicitada, o domínio:

1. resolve os períodos do dia da semana no fuso da agenda;
2. divide cada período em janelas completas de 60 minutos;
3. busca os agendamentos que intersectam a data;
4. marca cada janela como disponível ou ocupada;
5. remove a possibilidade de reservar janelas que já começaram.

A resposta pública contém somente início, fim e estado. O painel usa uma consulta administrativa separada para obter os detalhes privados. Alterações no expediente afetam a disponibilidade futura imediatamente, mas nunca apagam agendamentos existentes.

**Alternativas consideradas:** persistir cada slot criaria sincronização e migrações desnecessárias ao alterar expediente ou duração. O cálculo sob demanda é suficiente para um único barbeiro.

### 5. Autenticação por sessão e bootstrap explícito

O barbeiro fará login com credenciais próprias. A senha será processada com algoritmo de hash resistente a senha, com salt, e nunca será registrada ou persistida em texto simples. O navegador receberá cookie de sessão `HttpOnly`, `Secure` em produção e `SameSite=Lax`; o banco guardará apenas um hash do token, sua expiração e revogação.

Um comando idempotente de bootstrap criará a credencial inicial a partir de variáveis de ambiente obrigatórias quando ainda não existir administrador. A aplicação não terá usuário ou senha padrão. Todas as páginas, Server Actions e Route Handlers administrativos chamarão a mesma verificação server-side de sessão e papel.

**Alternativas consideradas:** autenticação básica expõe credenciais repetidamente e dificulta logout. Token administrativo permanente no navegador amplia o impacto de vazamento e não oferece revogação simples.

### 6. Validação e fronteiras de privacidade

Entradas serão validadas no servidor, mesmo quando a interface já tiver validação. Nome e telefone serão obrigatórios e terão limites de tamanho; a observação será opcional, texto simples e limitada. A renderização nunca interpretará a observação como HTML.

Endpoints públicos não reutilizarão DTOs administrativos. Respostas de erro de login não informarão se usuário ou senha falhou. Logs omitirão senha, token de sessão, telefone e observação. A criação pública terá limitação básica de frequência por origem, compatível com uma única instância.

### 7. Imagem Docker e Docker Compose

O Dockerfile terá múltiplos estágios para dependências, build e runtime não privilegiado. O Compose declarará:

- serviço `app`, construído localmente, com healthcheck e dependência do banco saudável;
- serviço `db`, usando uma versão fixa do PostgreSQL e volume nomeado persistente;
- rede interna para o banco, expondo externamente somente a porta da aplicação;
- variáveis de ambiente por `.env`, acompanhado apenas por `.env.example` sem segredos;
- execução de migrações e bootstrap antes de iniciar o servidor.

Os dados do PostgreSQL permanecerão no volume durante recriações dos contêineres. O Compose será apropriado para o primeiro servidor, mas produção pública ainda exigirá TLS e uma rotina externa de backup.

**Alternativas consideradas:** instalar Node.js e PostgreSQL diretamente na máquina aumenta divergência ambiental. Incorporar os dois processos no mesmo contêiner dificulta saúde, persistência e atualização independente.

### 8. Estratégia de testes

Testes unitários cobrirão resolução de períodos, geração de slots, limites do dia e fuso horário. Testes de integração usarão PostgreSQL real para restrições, transações, autenticação e consultas de privacidade. Testes de fluxo cobrirão reserva pública, conflito concorrente, login, visualização administrativa e configuração semanal em viewport móvel e desktop.

## Riscos / Trade-offs

- [A agenda pública pode ser usada para inferir a ocupação do barbeiro] -> Expor somente estado e limitar consultas a intervalos de datas razoáveis, sem dados pessoais.
- [Duas reservas simultâneas podem atravessar validações da aplicação] -> Usar restrição de exclusão no PostgreSQL como garantia final.
- [Erros de fuso horário podem deslocar marcações] -> Persistir instantes em UTC, manter fuso IANA explícito e testar transições de horário de verão.
- [Uma única instância e um único banco formam ponto único de falha] -> Aceitar no MVP, persistir em volume e documentar backup e restauração antes do uso real.
- [Bootstrap por ambiente pode deixar segredo no histórico operacional] -> Usar arquivo de ambiente fora do versionamento, restringir permissões e permitir remoção da variável após a criação inicial.
- [Rate limiting local perde estado ao reiniciar] -> Aceitar para uma instância inicial; migrar para mecanismo persistente se houver abuso ou escalabilidade horizontal.
- [O Next.js combina UI e backend, aumentando acoplamento] -> Manter regras de domínio e acesso a dados fora de componentes e handlers para permitir testes e evolução.

## Plano de migração

1. Criar o schema inicial e as migrações versionadas.
2. Construir as imagens e iniciar o PostgreSQL com volume persistente.
3. Executar migrações e o bootstrap idempotente do barbeiro.
4. Iniciar a aplicação e validar healthcheck, login, configuração de expediente e reserva pública.
5. Antes de exposição pública, configurar proxy com HTTPS e rotina de backup do volume ou do banco.

Como ainda não existem dados de produção, não há migração legada. Em caso de falha durante a primeira implantação, a aplicação pode voltar à imagem anterior; migrações incompatíveis futuras deverão ter plano explícito de rollback ou restauração de backup.
