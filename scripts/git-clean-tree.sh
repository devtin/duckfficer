#!/usr/bin/env bash
if [[ -n "$(git status --untracked-files=no --porcelain)" ]]; then
  exit 1
fi
