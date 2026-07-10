/*
  Copia de seguridad de la base de datos SQLite.
  Uso: node scripts/backup.js
  Crea una copia con marca temporal dentro de ./backups.
*/
const fs = require("fs");
const path = require("path");

function resolveDbPath() {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  const file = url.replace(/^file:/, "");
  // Las rutas relativas de Prisma se resuelven respecto a la carpeta prisma/.
  if (path.isAbsolute(file)) return file;
  return path.join(__dirname, "..", "prisma", file);
}

function main() {
  const dbPath = resolveDbPath();
  if (!fs.existsSync(dbPath)) {
    console.error("No se encontró la base de datos en:", dbPath);
    process.exit(1);
  }

  const backupsDir = path.join(__dirname, "..", "backups");
  fs.mkdirSync(backupsDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = path.join(backupsDir, `trofeo-${stamp}.db`);
  fs.copyFileSync(dbPath, dest);
  console.log("Copia de seguridad creada:", dest);
}

main();
