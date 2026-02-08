import { prisma } from "../../src/lib/prisma";
import bcrypt from "bcryptjs";

type Role = "OWNER" | "TENANT_ADMIN" | "TEAM" | "PATIENT";

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

async function main() {
  const tenantId = getArg("tenant-id");
  const tenantName = getArg("tenant-name") ?? "Prod Tenant";
  const tenantType = (getArg("tenant-type") ?? "B2C") as "B2C" | "B2B";

  const email = getArg("email");
  const name = getArg("name") ?? "Admin";
  const role = (getArg("role") ?? "TENANT_ADMIN") as Role;
  const password = getArg("password");

  if (!tenantId) throw new Error("Missing --tenant-id (must be a UUID)");
  if (!email) throw new Error("Missing --email");
  if (!password) throw new Error("Missing --password");

  const password_hash = await bcrypt.hash(password, 12);

  const tenant = await prisma.tenant.upsert({
    where: { id: tenantId },
    create: { id: tenantId, name: tenantName, type: tenantType, status: "active" },
    update: { name: tenantName },
    select: { id: true, name: true },
  });

  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    create: {
      email: email.toLowerCase(),
      name,
      role,
      password_hash,
      tenant_id: tenant.id,
      status: "active",
    },
    update: {
      name,
      role,
      password_hash,
      tenant_id: tenant.id,
      status: "active",
    },
    select: { id: true, email: true, role: true, tenant_id: true },
  });

  process.stdout.write(
    JSON.stringify(
      {
        tenant,
        user,
        login: { email: user.email, password: "<the password you provided>" },
      },
      null,
      2
    ) + "\n"
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
