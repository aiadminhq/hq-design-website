#!/bin/zsh
set -e
cd "$(dirname "$0")/../web"
printf 'HQ Design 本地網站：http://127.0.0.1:3020/zh\n'
npm run dev -- --hostname 127.0.0.1 --port 3020
