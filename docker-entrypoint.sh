#!/usr/bin/env sh
set -eu
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

exec "$@"