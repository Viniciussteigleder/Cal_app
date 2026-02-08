import { PrismaClient, Prisma } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// Default password for all seeded users - change after first login
const DEFAULT_PASSWORD = "Nutri@2026";

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
  const protein = Number(((index % 20) + 5) / 2); // 2.5 - 12.5g
  const carbs = Number(((index % 30) + 10) / 2); // 5 - 20g
  const fat = Number(((index % 12) + 2) / 2); // 1 - 7g
  const fiber = Number(((index % 8) + 1) / 2); // 0.5 - 4.5g
  const energy = Number((protein * 4 + carbs * 4 + fat * 9).toFixed(1));

  return {
    energy_kcal: energy,
    protein_g: protein,
    carbs_g: carbs,
    fat_g: fat,
    fiber_g: fiber,
  };
}

async function seedTenantData(tx: Prisma.TransactionClient, tenantId: string) {
  const tacoRelease = await tx.datasetRelease.create({
    data: {
      tenant_id: tenantId,
      region: "BR",
      source_name: "TACO",
      version_label: "v7.1",
      status: "published",
      published_at: new Date("2025-12-15"),
    },
  });

  const blsRelease = await tx.datasetRelease.create({
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
      tx.foodCanonical.create({
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

  await tx.foodNutrient.createMany({ data: nutrientRows });

  await tx.foodAlias.createMany({
    data: foods.slice(0, 12).map((food) => ({
      tenant_id: tenantId,
      food_id: food.id,
      alias: `${food.name} (alias)`,
      locale: "pt-BR",
    })),
  });

  return { tacoRelease, blsRelease, foods };
}

async function seedCanonicalExams(tx: Prisma.TransactionClient) {
  const exams = [
    {
      common_name: "Glicose",
      synonyms_pt: ["Glicemia", "Glicose em Jejum", "Glicose Sérica"],
      synonyms_en: ["Glucose", "Fasting Glucose"],
      category: "Metabolismo",
    },
    {
      common_name: "Colesterol Total",
      synonyms_pt: ["Colesterol", "Colesterol Sérico"],
      synonyms_en: ["Total Cholesterol"],
      category: "Lipidograma",
    },
    {
      common_name: "HDL",
      synonyms_pt: ["Colesterol HDL", "HDL Colesterol"],
      synonyms_en: ["HDL Cholesterol"],
      category: "Lipidograma",
    },
    {
      common_name: "LDL",
      synonyms_pt: ["Colesterol LDL", "LDL Colesterol"],
      synonyms_en: ["LDL Cholesterol"],
      category: "Lipidograma",
    },
    {
      common_name: "Triglicerídeos",
      synonyms_pt: ["Triglicérides"],
      synonyms_en: ["Triglycerides"],
      category: "Lipidograma",
    },
    {
      common_name: "TSH",
      synonyms_pt: ["Hormônio Tireoestimulante", "Tireotropina"],
      synonyms_en: ["TSH", "Thyroid Stimulating Hormone"],
      category: "Tireoide",
    },
    {
      common_name: "Hemoglobina Glicada",
      synonyms_pt: ["HbA1c", "A1C", "Hemoglobina A1c"],
      synonyms_en: ["HbA1c", "Hemoglobin A1c"],
      category: "Metabolismo",
    },
  ];

  for (const exam of exams) {
    await tx.examCanonical.create({
      data: {
        common_name: exam.common_name,
        synonyms_pt: exam.synonyms_pt,
        synonyms_en: exam.synonyms_en,
        synonyms_de: [],
        category: exam.category,
      }
    });
  }
}

async function main() {
  console.log("Seeding database...");

  // Hash password once for all users
  const passwordHash = await hash(DEFAULT_PASSWORD, 10);
  console.log(`Default password for all users: ${DEFAULT_PASSWORD}`);

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      "SELECT set_config('app.user_id', $1, true), set_config('app.tenant_id', $2, true), set_config('app.role', $3, true), set_config('app.owner_mode', $4, true)",
      "00000000-0000-0000-0000-000000000500",
      "00000000-0000-0000-0000-000000000000",
      "OWNER",
      "true"
    );

    const tenantA = await tx.tenant.create({
      data: { name: "Clínica NutriVida", type: "B2C", status: "active" },
    });
    const tenantB = await tx.tenant.create({
      data: { name: "Clínica Saúde Digestiva", type: "B2C", status: "active" },
    });

    const owner = await tx.user.create({
      data: {
        email: "owner@nutriplan.com",
        name: "Owner Admin",
        role: "OWNER",
        password_hash: passwordHash,
        tenant_id: tenantA.id,
        status: "active",
      },
    });

    const nutriA = await tx.user.create({
      data: {
        email: "nutri@nutriplan.com",
        name: "Dr. Carlos Nutricionista",
        role: "TENANT_ADMIN",
        password_hash: passwordHash,
        tenant_id: tenantA.id,
        status: "active",
      },
    });
    await tx.user.create({
      data: {
        email: "equipe@nutriplan.com",
        name: "Ana Assistente",
        role: "TEAM",
        password_hash: passwordHash,
        tenant_id: tenantA.id,
        status: "active",
      },
    });
    const nutriB = await tx.user.create({
      data: {
        email: "nutri-b@nutriplan.com",
        name: "Dra. Fernanda Lima",
        role: "TENANT_ADMIN",
        password_hash: passwordHash,
        tenant_id: tenantB.id,
        status: "active",
      },
    });

    const patientUsers = await Promise.all(
      [
        { email: "maria@nutriplan.com", name: "Maria Silva", tenant: tenantA },
        { email: "joao@nutriplan.com", name: "João Pereira", tenant: tenantA },
        { email: "ana@nutriplan.com", name: "Ana Souza", tenant: tenantA },
        { email: "lena@nutriplan.com", name: "Lena Fischer", tenant: tenantB },
        { email: "paul@nutriplan.com", name: "Paul Schmidt", tenant: tenantB },
      ].map((user) =>
        tx.user.create({
          data: {
            email: user.email,
            name: user.name,
            role: "PATIENT",
            password_hash: passwordHash,
            tenant_id: user.tenant.id,
            status: "active",
          },
        })
      )
    );

    const patients = await Promise.all(
      patientUsers.map((user, index) =>
        tx.patient.create({
          data: {
            tenant_id: user.tenant_id,
            user_id: user.id,
            assigned_team_id: user.tenant_id === tenantA.id ? nutriA.id : nutriB.id,
            status: "active",
          },
        })
      )
    );

    // Create patient profiles separately
    await Promise.all(
      patients.map((patient, index) =>
        tx.patientProfile.create({
          data: {
            tenant_id: patient.tenant_id,
            patient_id: patient.id,
            sex: index % 2 === 0 ? "female" : "male",
            birth_date: new Date("1990-05-15"),
            height_cm: new Prisma.Decimal(165 + index),
            current_weight_kg: new Prisma.Decimal(68 + index),
            target_weight_kg: new Prisma.Decimal(63 + index),
            activity_level: "moderate",
            goal: "loss",
          },
        })
      )
    );

    const tenantAData = await seedTenantData(tx, tenantA.id);
    const tenantBData = await seedTenantData(tx, tenantB.id);

    for (const patient of patients) {
      const isJourneyBR = patient.id === patients[0].id;
      const isJourneyDE = patient.id === patients[3].id;
      const policy = await tx.patientDataPolicy.create({
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
        await tx.patientCategoryOverride.create({
          data: {
            policy_id: policy.id,
            category_code: "grains",
            preferred_source: "TACO",
            notes: "Preferir TACO para grãos.",
          },
        });
      }
      if (isJourneyDE) {
        await tx.patientCategoryOverride.create({
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
      patients.map((patient) =>
        tx.plan.create({
          data: {
            tenant_id: patient.tenant_id,
            patient_id: patient.id,
            status: "active",
          },
        })
      )
    );

    for (const [index, plan] of plans.entries()) {
      const planVersion = await tx.planVersion.create({
        data: {
          tenant_id: plan.tenant_id,
          plan_id: plan.id,
          version_no: 1,
          status: "published",
          created_by: plan.tenant_id === tenantA.id ? nutriA.id : nutriB.id,
        },
      });
      const publishedAt = new Date();

      const foodPool = plan.tenant_id === tenantA.id ? tenantAData.foods : tenantBData.foods;
      const food = foodPool[index % foodPool.length];
      const nutrients = buildNutrients(index);
      const snapshotJson = {
        nutrients,
        source: plan.tenant_id === tenantA.id ? "TACO v7.1" : "BLS 3.02",
        per_100g: true,
      };

      const snapshot = await tx.foodSnapshot.create({
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

      await tx.planItem.create({
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

      await tx.planApproval.create({
        data: {
          tenant_id: plan.tenant_id,
          plan_version_id: planVersion.id,
          approved_by: plan.tenant_id === tenantA.id ? nutriA.id : nutriB.id,
          approved_at: publishedAt,
        },
      });

      await tx.planPublication.create({
        data: {
          tenant_id: plan.tenant_id,
          plan_version_id: planVersion.id,
          published_by: plan.tenant_id === tenantA.id ? nutriA.id : nutriB.id,
          published_at: publishedAt,
        },
      });

      for (let day = 0; day < 5; day += 1) {
        const date = new Date();
        date.setDate(date.getDate() - day);

        const meal = await tx.meal.create({
          data: {
            tenant_id: plan.tenant_id,
            patient_id: plan.patient_id,
            date,
            type: "lunch",
          },
        });

        await tx.mealItem.create({
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

    await seedCanonicalExams(tx);
  });

  console.log("\n========================================");
  console.log("Seed completed successfully!");
  console.log("========================================");
  console.log("\nAll accounts use password: " + DEFAULT_PASSWORD);
  console.log("\nAvailable logins:");
  console.log("  OWNER:        owner@nutriplan.com");
  console.log("  NUTRITIONIST: nutri@nutriplan.com   (Clínica NutriVida)");
  console.log("  TEAM:         equipe@nutriplan.com  (Clínica NutriVida)");
  console.log("  NUTRITIONIST: nutri-b@nutriplan.com (Clínica Saúde Digestiva)");
  console.log("  PATIENT:      maria@nutriplan.com   (Clínica NutriVida)");
  console.log("  PATIENT:      joao@nutriplan.com    (Clínica NutriVida)");
  console.log("  PATIENT:      ana@nutriplan.com     (Clínica NutriVida)");
  console.log("  PATIENT:      lena@nutriplan.com    (Clínica Saúde Digestiva)");
  console.log("  PATIENT:      paul@nutriplan.com    (Clínica Saúde Digestiva)");
  console.log("========================================\n");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
