import bcrypt from "bcryptjs";

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error("Usage: tsx scripts/admin/hash-password.ts <password>");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  process.stdout.write(hash + "\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
