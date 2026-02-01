import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const BR_FOODS = [
  "Arroz branco cozido",
  "Feijão preto cozido",
  "Frango grelhado",
  "Carne bovina magra",
  "Ovo cozido",
  "Banana prata",
  "Maçã",
  "Laranja",
  "Mamão formosa",
  "Batata doce cozida",
  "Batata inglesa cozida",
  "Aipim cozido",
  "Pão francês",
  "Tapioca",
  "Cuscuz de milho",
  "Queijo minas frescal",
  "Iogurte natural",
  "Leite desnatado",
  "Azeite de oliva",
  "Manteiga",
  "Aveia em flocos",
  "Granola simples",
  "Alface",
  "Tomate",
  "Cenoura cozida",
  "Abobrinha",
  "Brócolis cozido",
  "Couve manteiga",
  "Abacate",
  "Melancia",
  "Uva",
  "Peixe grelhado",
  "Salmão assado",
  "Atum em água",
  "Lentilha cozida",
  "Grão-de-bico cozido",
  "Pão integral",
  "Farinha de mandioca",
  "Milho cozido",
  "Pão de queijo",
  "Biscoito água e sal",
  "Castanha de caju",
  "Amendoim torrado",
  "Semente de linhaça",
  "Semente de chia",
  "Abacaxi",
  "Manga",
  "Pêssego",
  "Iogurte grego light",
  "Tofu",
];

const DE_FOODS = [
  "Kartoffel gekocht",
  "Vollkornbrot",
  "Roggenbrot",
  "Weizenbrötchen",
  "Haferflocken",
  "Quark mager",
  "Joghurt natur",
  "Käse gouda",
  "Butter",
  "Rindfleisch mager",
  "Hähnchenbrust",
  "Schweinefilet",
  "Lachs",
  "Forelle",
  "Ei gekocht",
  "Apfel",
  "Banane",
  "Birne",
  "Trauben",
  "Erdbeeren",
  "Tomate",
  "Gurke",
  "Paprika",
  "Karotte gekocht",
  "Brokkoli gekocht",
  "Blumenkohl",
  "Spinat",
  "Zucchini",
  "Sauerteigbrot",
  "Reis gekocht",
  "Nudeln gekocht",
  "Linsen gekocht",
  "Kichererbsen gekocht",
  "Bohnen gekocht",
  "Olivenöl",
  "Rapsöl",
  "Walnüsse",
  "Mandeln",
  "Chiasamen",
  "Leinsamen",
  "Quinoa gekocht",
  "Hirse gekocht",
  "Kefir",
  "Buttermilch",
  "Sauerkraut",
  "Rotkohl",
  "Pilze",
  "Tofu",
  "Zartbitterschokolade",
  "Honig",
];

function buildNutrients(index: number) {
  const base = 50 + index;
  return {
    energy_kcal: base + 30,
    protein_g: Number(((base % 20) + 5) / 2),
    carbs_g: Number(((base % 40) + 10) / 2),
    fat_g: Number(((base % 10) + 2) / 2),
    fiber_g: Number(((base % 8) + 1) / 2),
  };
}

async function seedTenantData(tenantId: string, label: string) {
  const tacoRelease = await prisma.datasetRelease.create({
    data: {
      tenant_id: tenantId,
      region: "BR",
      source_name: "TACO",
      version_label: "v7.1",
      status: "published",
      published_at: new Date("2025-12-15"),
    },
  });

  const blsRelease = await prisma.datasetRelease.create({
    data: {
      tenant_id: tenantId,
      region: "DE",
      source_name: "BLS",
      version_label: "3.02",
      status: "published",
      published_at: new Date("2025-11-20"),
    },
  });

  const foods = await Promise.all(
    [...BR_FOODS, ...DE_FOODS].map((name, index) =>
      prisma.foodCanonical.create({
        data: {
          tenant_id: tenantId,
          name,
          group: "grains",
          region_tag: index < BR_FOODS.length ? "BR" : "DE",
          is_generic: true,
        },
      })
    )
  );

  const nutrientRows: Prisma.FoodNutrientCreateManyInput[] = foods.flatMap(
    (food, index) => {
      const nutrients = buildNutrients(index);
      const dataset_release_id = index < BR_FOODS.length ? tacoRelease.id : blsRelease.id;
      const source = index < BR_FOODS.length ? "TACO" : "BLS";

      return (Object.keys(nutrients) as Array<keyof typeof nutrients>).map(
        (key) => ({
          tenant_id: tenantId,
          food_id: food.id,
          nutrient_key: key,
          per_100g_value: new Prisma.Decimal(nutrients[key]),
          unit: key === "energy_kcal" ? "kcal" : "g",
          source,
          dataset_release_id,
          quality_flag: "verified",
        })
      );
    }
  );

  await prisma.foodNutrient.createMany({ data: nutrientRows });

  await prisma.foodAlias.createMany({
    data: foods.slice(0, 12).map((food) => ({
      tenant_id: tenantId,
      food_id: food.id,
      alias: `${food.name} (alias)`,
      locale: "pt-BR",
    })),
  });

  return { tacoRelease, blsRelease, foods };
}

async function main() {
  console.log("Seeding database...");

  const tenantA = await prisma.tenant.create({
    data: { name: "Clínica A", type: "B2C", status: "active" },
  });
  const tenantB = await prisma.tenant.create({
    data: { name: "Clínica B", type: "B2C", status: "active" },
  });

  const owner = await prisma.user.create({
    data: {
      email: "owner@nutriplan.com",
      name: "Owner Admin",
      role: "OWNER",
      tenant_id: tenantA.id,
      status: "active",
    },
  });

  const nutriA = await prisma.user.create({
    data: {
      email: "nutri-a@example.com",
      name: "Nutricionista A",
      role: "TENANT_ADMIN",
      tenant_id: tenantA.id,
      status: "active",
    },
  });
  const nutriA2 = await prisma.user.create({
    data: {
      email: "nutri-b@example.com",
      name: "Nutricionista B",
      role: "TEAM",
      tenant_id: tenantA.id,
      status: "active",
    },
  });
  const nutriB = await prisma.user.create({
    data: {
      email: "nutri-c@example.com",
      name: "Nutricionista C",
      role: "TENANT_ADMIN",
      tenant_id: tenantB.id,
      status: "active",
    },
  });

  const patientUsers = await Promise.all(
    [
      { email: "patient1@example.com", name: "Maria Silva", tenant: tenantA },
      { email: "patient2@example.com", name: "João Pereira", tenant: tenantA },
      { email: "patient3@example.com", name: "Ana Souza", tenant: tenantA },
      { email: "patient4@example.com", name: "Lena Fischer", tenant: tenantB },
      { email: "patient5@example.com", name: "Paul Schmidt", tenant: tenantB },
    ].map((user) =>
      prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          role: "PATIENT",
          tenant_id: user.tenant.id,
          status: "active",
        },
      })
    )
  );

  const patients = await Promise.all(
    patientUsers.map((user, index) =>
      prisma.patient.create({
        data: {
          tenant_id: user.tenant_id,
          user_id: user.id,
          assigned_team_id: user.tenant_id === tenantA.id ? nutriA.id : nutriB.id,
          status: "active",
          profile: {
            create: {
              tenant_id: user.tenant_id,
              sex: index % 2 === 0 ? "female" : "male",
              birth_date: new Date("1990-05-15"),
              height_cm: new Prisma.Decimal(165 + index),
              current_weight_kg: new Prisma.Decimal(68 + index),
              target_weight_kg: new Prisma.Decimal(63 + index),
              activity_level: "moderate",
              goal: "loss",
            },
          },
        },
      })
    )
  );

  const tenantAData = await seedTenantData(tenantA.id, "A");
  const tenantBData = await seedTenantData(tenantB.id, "B");

  for (const patient of patients) {
    const isJourneyBR = patient.id === patients[0].id;
    const isJourneyDE = patient.id === patients[3].id;
    const policy = await prisma.patientDataPolicy.create({
      data: {
        tenant_id: patient.tenant_id,
        patient_id: patient.id,
        version_number: 1,
        is_active: true,
        default_region: isJourneyBR ? "BR" : isJourneyDE ? "DE" : patient.tenant_id === tenantA.id ? "BR" : "DE",
        allowed_sources: isJourneyBR
          ? ["TACO", "TBCA"]
          : isJourneyDE
          ? ["BLS"]
          : patient.tenant_id === tenantA.id
          ? ["TACO"]
          : ["BLS"],
        updated_by: patient.assigned_team_id ?? owner.id,
      },
    });

    if (isJourneyBR) {
      await prisma.patientCategoryOverride.create({
        data: {
          policy_id: policy.id,
          category_code: "grains",
          preferred_source: "TACO",
          notes: "Preferir TACO para grãos.",
        },
      });
    }
    if (isJourneyDE) {
      await prisma.patientCategoryOverride.create({
        data: {
          policy_id: policy.id,
          category_code: "dairy",
          preferred_source: "BLS",
          notes: "Priorizar BLS para laticínios.",
        },
      });
    }
  }

  const plans = await Promise.all(
    patients.map((patient, index) =>
      prisma.plan.create({
        data: {
          tenant_id: patient.tenant_id,
          patient_id: patient.id,
          status: "active",
        },
      })
    )
  );

  for (const [index, plan] of plans.entries()) {
    const planVersion = await prisma.planVersion.create({
      data: {
        tenant_id: plan.tenant_id,
        plan_id: plan.id,
        version_no: 1,
        status: "published",
        created_by: plan.tenant_id === tenantA.id ? nutriA.id : nutriB.id,
      },
    });

    const foodPool = plan.tenant_id === tenantA.id ? tenantAData.foods : tenantBData.foods;
    const food = foodPool[index % foodPool.length];
    const nutrients = buildNutrients(index);
    const snapshotJson = {
      nutrients,
      source: plan.tenant_id === tenantA.id ? "TACO v7.1" : "BLS 3.02",
      per_100g: true,
    };

    const snapshot = await prisma.foodSnapshot.create({
      data: {
        tenant_id: plan.tenant_id,
        patient_id: plan.patient_id,
        food_id: food.id,
        snapshot_json: snapshotJson,
        source: plan.tenant_id === tenantA.id ? "TACO" : "BLS",
        dataset_release_id:
          plan.tenant_id === tenantA.id
            ? tenantAData.tacoRelease.id
            : tenantBData.blsRelease.id,
      },
    });

    await prisma.planItem.create({
      data: {
        tenant_id: plan.tenant_id,
        plan_version_id: planVersion.id,
        meal_type: "lunch",
        food_id: food.id,
        grams: new Prisma.Decimal(150),
        snapshot_id: snapshot.id,
        instructions: "Cozinhar sem sal e temperar com ervas.",
      },
    });

    await prisma.planApproval.create({
      data: {
        tenant_id: plan.tenant_id,
        plan_version_id: planVersion.id,
        approved_by: plan.tenant_id === tenantA.id ? nutriA.id : nutriB.id,
        approved_at: new Date("2026-01-12"),
      },
    });

    await prisma.planPublication.create({
      data: {
        tenant_id: plan.tenant_id,
        plan_version_id: planVersion.id,
        published_by: plan.tenant_id === tenantA.id ? nutriA.id : nutriB.id,
        published_at: new Date("2026-01-12"),
      },
    });

    for (let day = 0; day < 5; day += 1) {
      const date = new Date();
      date.setDate(date.getDate() - day);

      const meal = await prisma.meal.create({
        data: {
          tenant_id: plan.tenant_id,
          patient_id: plan.patient_id,
          date,
          type: "lunch",
        },
      });

      await prisma.mealItem.create({
        data: {
          tenant_id: plan.tenant_id,
          meal_id: meal.id,
          food_id: food.id,
          grams: new Prisma.Decimal(150),
          snapshot_id: snapshot.id,
        },
      });
    }
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
