#!/usr/bin/env bash
# scripts/detect-stack.sh — guesses a project's language, framework and IDE
# from files that are already on disk, so onboarding doesn't have to ask.
#
# Usage: scripts/detect-stack.sh <target-path>
# Output: three "key=value" lines — language=, framework=, ide= — each `unknown`
#   when nothing matched. Always exits 0: "found nothing" is a valid answer,
#   not a failure, and the caller confirms the result with the user either way.
set -euo pipefail

TARGET="${1:-}"

if [[ -z "$TARGET" || ! -d "$TARGET" ]]; then
  echo "Usage: scripts/detect-stack.sh <target-path>" >&2
  exit 1
fi

LANGUAGE="unknown"
FRAMEWORK="none"
IDE="unknown"

has() { [[ -e "$TARGET/$1" ]]; }

# Language: a manifest file is far more reliable than counting source extensions.
if has "package.json"; then
  if has "tsconfig.json"; then
    LANGUAGE="typescript"
  else
    LANGUAGE="javascript"
  fi
elif has "pyproject.toml" || has "requirements.txt" || has "setup.py"; then
  LANGUAGE="python"
elif has "go.mod"; then
  LANGUAGE="go"
elif has "Cargo.toml"; then
  LANGUAGE="rust"
elif has "pom.xml" || has "build.gradle" || has "build.gradle.kts"; then
  LANGUAGE="java"
elif has "Gemfile"; then
  LANGUAGE="ruby"
elif has "composer.json"; then
  LANGUAGE="php"
elif compgen -G "$TARGET/*.sln" >/dev/null || compgen -G "$TARGET/*.csproj" >/dev/null; then
  LANGUAGE="csharp"
elif has "Package.swift"; then
  LANGUAGE="swift"
elif has "pubspec.yaml"; then
  LANGUAGE="dart"
elif has "CMakeLists.txt"; then
  LANGUAGE="cpp"
fi

# Framework: only checked for the ecosystems where a dependency name is a
# dependable signal. grep on package.json beats parsing JSON in bash.
if has "package.json"; then
  if grep -q '"next"' "$TARGET/package.json" 2>/dev/null; then
    FRAMEWORK="next"
  elif grep -q '"@angular/core"' "$TARGET/package.json" 2>/dev/null; then
    FRAMEWORK="angular"
  elif grep -q '"nuxt"' "$TARGET/package.json" 2>/dev/null; then
    FRAMEWORK="nuxt"
  elif grep -q '"astro"' "$TARGET/package.json" 2>/dev/null; then
    FRAMEWORK="astro"
  elif grep -q '"marko"' "$TARGET/package.json" 2>/dev/null; then
    FRAMEWORK="marko"
  elif grep -q '"react"' "$TARGET/package.json" 2>/dev/null; then
    FRAMEWORK="react"
  elif grep -q '"vue"' "$TARGET/package.json" 2>/dev/null; then
    FRAMEWORK="vue"
  elif grep -q '"svelte"' "$TARGET/package.json" 2>/dev/null; then
    FRAMEWORK="svelte"
  elif grep -qE '"(@nestjs/core|nestjs)"' "$TARGET/package.json" 2>/dev/null; then
    FRAMEWORK="nestjs"
  elif grep -qE '"(express|fastify)"' "$TARGET/package.json" 2>/dev/null; then
    FRAMEWORK="node"
  fi
elif [[ "$LANGUAGE" == "python" ]]; then
  if grep -rqE '^(django|Django)' "$TARGET/requirements.txt" "$TARGET/pyproject.toml" 2>/dev/null; then
    FRAMEWORK="django"
  elif grep -rqE '^(fastapi|FastAPI)' "$TARGET/requirements.txt" "$TARGET/pyproject.toml" 2>/dev/null; then
    FRAMEWORK="fastapi"
  fi
elif [[ "$LANGUAGE" == "ruby" ]] && grep -qE "gem ['\"]rails['\"]" "$TARGET/Gemfile" 2>/dev/null; then
  FRAMEWORK="rails"
elif [[ "$LANGUAGE" == "php" ]] && grep -q '"laravel/framework"' "$TARGET/composer.json" 2>/dev/null; then
  FRAMEWORK="laravel"
elif [[ "$LANGUAGE" == "java" ]] && grep -rq 'spring' "$TARGET/pom.xml" "$TARGET/build.gradle" "$TARGET/build.gradle.kts" 2>/dev/null; then
  FRAMEWORK="spring"
fi

# IDE: inferred from committed editor config, never from what's installed on
# this machine — the question is what the team uses, not what this user opened.
if has ".vscode"; then
  IDE="vscode"
elif has ".idea"; then
  IDE="jetbrains"
fi

echo "language=$LANGUAGE"
echo "framework=$FRAMEWORK"
echo "ide=$IDE"
