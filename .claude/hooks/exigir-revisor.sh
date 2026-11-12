#!/bin/bash
# PreToolUse: el agente no puede hacer git commit sin la marca del revisor.
# Una persona que commitea en la terminal no tiene CLAUDE_PROJECT_DIR y no pasa por aquí.

if [ -z "${CLAUDE_PROJECT_DIR:-}" ]; then
  exit 0
fi

input=$(cat)
comando=$(printf '%s' "$input" | node -e '
let data = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  data += chunk;
});
process.stdin.on("end", () => {
  try {
    const json = JSON.parse(data);
    const entrada = json.tool_input ?? json;
    const comando = entrada.command || "";
    process.stdout.write(typeof comando === "string" ? comando : "");
  } catch {
    process.stdout.write("");
  }
});
')

case "$comando" in
  *git\ commit*) ;;
  *) exit 0 ;;
esac

marca="$CLAUDE_PROJECT_DIR/.git/REVISOR_OK"
if [ ! -f "$marca" ]; then
  echo "Falta la revisión adversarial. Invoca el subagente revisor y, si no hay bloqueo, crea .git/REVISOR_OK antes del commit." >&2
  exit 2
fi

rm -f "$marca"
exit 0
