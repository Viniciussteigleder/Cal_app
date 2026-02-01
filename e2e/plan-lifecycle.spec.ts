import { test, expect } from "@playwright/test";

test("Fluxo completo MVP1: consulta → plano → publicação → visão do paciente", async ({
  page,
}) => {
  await page.goto("/studio/patients");
  await expect(page.getByText("Pacientes ativos")).toBeVisible();

  await page.getByRole("button", { name: "Novo paciente" }).click();
  await page.getByLabel("Buscar paciente").fill("Maria");

  await page.goto("/studio/consultations/1");
  await page.getByLabel("Peso atual (kg)").fill("68");
  await page.getByRole("button", { name: "Próxima etapa" }).click();

  await page.goto("/studio/plans/1");
  await expect(page.getByText("Versionamento de planos")).toBeVisible();
  await page.getByRole("button", { name: "Duplicar versão" }).click();

  await page.goto("/patient/plan");
  await expect(page.getByText("Plano publicado")).toBeVisible();
  await expect(page.getByText("Arroz branco cozido")).toBeVisible();
});
