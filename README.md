# Ofício Barber

Sistema de agenda para uma barbearia, construído com Next.js 16.4, Drizzle ORM e PostgreSQL.

## Desenvolvimento

Requer Node.js 22+ e PostgreSQL 17. Copie `.env.example` para `.env`, troque todos os valores `replace-with...` e ajuste `DATABASE_URL` para `localhost` quando executar fora do Compose. Então execute:

```sh
npm install
npm run db:setup
npm run dev
```

O bootstrap exige `ADMIN_USERNAME`, `ADMIN_PASSWORD` (mínimo 12 caracteres), `BARBER_NAME` e `BARBER_SLUG` apenas na primeira execução. É idempotente e nunca substitui uma conta existente; remova a senha de bootstrap do ambiente depois da criação se o processo operacional permitir. `SCHEDULE_TIMEZONE` deve ser um identificador IANA, como `America/Sao_Paulo`. `PUBLIC_APP_URL` deve ser a URL externa completa.

Para a demonstração local, o `.env.example` fornece o usuário `admin` e a senha `local-admin-password-not-for-production`. Essas credenciais aparecem na tela de login para facilitar a avaliação e devem ser substituídas antes de qualquer publicação.

## Docker Compose

```sh
cp .env.example .env
# Edite .env e use senhas longas, aleatórias e diferentes.
docker compose config
docker compose up --build -d
docker compose ps
```

A aplicação fica em `http://localhost:3000`; o PostgreSQL só participa da rede interna e não publica porta. Migrações versionadas e bootstrap rodam antes do servidor. O volume nomeado `barber_db` preserva os dados entre recriações. Uma segunda execução de `docker compose up -d` não duplica o administrador.

## Produção, HTTPS e backup

Não exponha a porta 3000 diretamente à internet. Coloque um proxy reverso com certificado TLS válido na frente da aplicação e defina `PUBLIC_APP_URL=https://seu-dominio`. O cookie de sessão usa `Secure` em produção, portanto HTTPS é obrigatório.

Backup lógico:

```sh
docker compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > barber.dump
```

Restauração em banco vazio (interrompa a aplicação antes):

```sh
docker compose exec -T db pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists < barber.dump
```

Teste periodicamente a restauração e mantenha cópias criptografadas fora da máquina. Não apague o volume com `docker compose down -v` sem backup.

## Verificação

```sh
npm run lint
npm test
npm run build
TEST_DATABASE_URL=postgres://... npm run test:integration
```

Testes de integração são ignorados sem `TEST_DATABASE_URL` ou `DATABASE_URL`; use um banco descartável, pois o schema `public` é recriado.
