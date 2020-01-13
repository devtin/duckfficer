#!/usr/bin/env bash
if [[ "$(git rev-parse --abbrev-ref HEAD)" -ne "master" ]]; then
  exit 1
fi
