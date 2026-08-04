// Usage: npm run hash-password -- "tu-contraseña"
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error('Uso: npm run hash-password -- "tu-contraseña"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
// Next.js expands "$VAR" references inside .env files, which would corrupt
// a bcrypt hash (it's full of "$"-prefixed segments). Escaping "$" as "\$"
// prevents that. See README "Panel de administración".
const escapedHash = hash.replace(/\$/g, "\\$");
console.log("\nAgrega esta línea a tu archivo .env.local:\n");
console.log(`ADMIN_PASSWORD_HASH=${escapedHash}\n`);
