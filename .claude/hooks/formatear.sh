#!/bin/bash
# PostToolUse: formatea con Prettier el archivo que el agente acaba de escribir o editar.
input=$(cat)
archivo=$(printf '%s' "$input" | node -e '
let data = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  data += chunk;
});
process.stdin.on("end", () => {
  try {
    const json = JSON.parse(data);
    const entrada = json.tool_input ?? {};
    const ruta = entrada.file_path || entrada.filePath || "";
    process.stdout.write(typeof ruta === "string" ? ruta : "");
  } catch {
    process.stdout.write("");
  }
});
')

if [ -z "$archivo" ] || [ ! -f "$archivo" ]; then
  exit 0
fi

raiz="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$raiz" || exit 0
npx prettier --write --ignore-unknown "$archivo"
