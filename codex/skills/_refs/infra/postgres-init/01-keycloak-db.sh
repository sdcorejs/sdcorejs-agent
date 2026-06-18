#!/bin/sh
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  SELECT 'CREATE DATABASE ${KC_DB_NAME:-keycloak}'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${KC_DB_NAME:-keycloak}')\gexec
EOSQL
