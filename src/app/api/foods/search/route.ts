import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "20");

    // Get the latest published dataset for this tenant
    const datasetRelease = await prisma.datasetRelease.findFirst({
      where: {
        tenant_id: session.tenantId,
        status: "published",
      },
      orderBy: { published_at: "desc" },
    });

    if (!datasetRelease) {
      return NextResponse.json({ foods: [] });
    }

    // Search foods by name (case-insensitive)
    const foods = await prisma.foodCanonical.findMany({
      where: {
        tenant_id: session.tenantId,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          {
            aliases: {
              some: { alias: { contains: query, mode: "insensitive" } },
            },
          },
        ],
      },
      include: {
        nutrients: {
          where: { dataset_release_id: datasetRelease.id },
        },
        aliases: true,
      },
      take: limit,
    });

    const formattedFoods = foods.map((food) => {
      const nutrients: Record<string, number> = {};
      for (const n of food.nutrients) {
        nutrients[n.nutrient_key] = Number(n.per_100g_value);
      }

      // Determine histamine risk based on food type
      const histamineRisk = getHistamineRisk(food.name, food.group);

      return {
        id: food.id,
        name: food.name,
        group: food.group,
        regionTag: food.region_tag,
        nutrients: {
          calories: nutrients.energy_kcal || 0,
          protein: nutrients.protein_g || 0,
          carbs: nutrients.carbs_g || 0,
          fat: nutrients.fat_g || 0,
          fiber: nutrients.fiber_g || 0,
        },
        histamineRisk,
        aliases: food.aliases.map((a) => a.alias),
      };
    });

    return NextResponse.json({ foods: formattedFoods });
  } catch (error) {
    console.error("Food search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getHistamineRisk(name: string, group: string): "low" | "medium" | "high" {
  const lowerName = name.toLowerCase();

  // High histamine foods
  const highHistamine = [
    "queijo", "cheese", "käse",
    "vinho", "wine", "wein",
    "cerveja", "beer", "bier",
    "conserva", "pickled", "sauerkraut",
    "atum", "tuna", "thunfisch",
    "sardinha", "sardine",
    "embutido", "salame", "salami",
    "presunto", "schinken",
    "fermentado", "fermented",
    "iogurte", "yogurt", "joghurt",
  ];

  // Medium histamine foods
  const mediumHistamine = [
    "tomate", "tomato", "tomate",
    "espinafre", "spinach", "spinat",
    "abacate", "avocado",
    "morango", "strawberry", "erdbeere",
    "banana", "banane",
    "chocolate", "schokolade",
    "laranja", "orange",
    "limão", "lemon", "zitrone",
  ];

  for (const term of highHistamine) {
    if (lowerName.includes(term)) return "high";
  }

  for (const term of mediumHistamine) {
    if (lowerName.includes(term)) return "medium";
  }

  return "low";
}
