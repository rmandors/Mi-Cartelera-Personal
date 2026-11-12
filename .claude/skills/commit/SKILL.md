---
name: commit
description: Crea un commit Conventional Commits con el id del ticket, después de lint y tests. Se invoca con /commit.
disable-model-invocation: true
---

# /commit

Úsala solo cuando la persona pida hacer el commit.

1. Revisa `git status`, `git diff` y `git log` reciente. No incluyas `.env`, claves, `node_modules`, `dist` ni `.DS_Store`.
2. Corre `npm run lint`. Si el script `test` existe, corre también `npm test`. Si algo falla, no hagas commit.
3. Invoca el subagente `revisor` (`.claude/agents/revisor.md`) con el diff preparado. Si reporta un bloqueo, no hagas commit y no crees la marca.
4. Si los bloqueos son «ninguno», crea `.git/REVISOR_OK` y solo entonces corre `git commit`. El hook de PreToolUse consume esa marca. Sin ella, el commit del agente se niega.
5. Mensaje en Conventional Commits, en español, una o dos oraciones sobre el porqué. Si el cambio corresponde a un ticket, el id va en el alcance: `feat(NP-02): calcula si una sesión cabe`.
6. Un commit por ticket. No mezcles documentos de una etapa con el código de la siguiente.
7. No uses `--no-verify`, `--amend` ni un push forzado. No cambies la configuración de git.
