#!/bin/sh
set -eu
node dist/migrate.mjs
node dist/bootstrap.mjs
exec node server.js
