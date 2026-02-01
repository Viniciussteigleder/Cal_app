type NutrientMap = Record<string, number>;

export function scaleNutrients(per100g: NutrientMap, grams: number) {
  const multiplier = grams / 100;
  return Object.entries(per100g).reduce<NutrientMap>((acc, [key, value]) => {
    acc[key] = Number((value * multiplier).toFixed(2));
    return acc;
  }, {});
}

export function sumNutrients(...maps: NutrientMap[]) {
  return maps.reduce<NutrientMap>((acc, map) => {
    Object.entries(map).forEach(([key, value]) => {
      acc[key] = Number(((acc[key] ?? 0) + value).toFixed(2));
    });
    return acc;
  }, {});
}
