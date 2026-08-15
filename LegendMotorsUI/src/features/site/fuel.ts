const fuelKeys: Record<string, string> = {
  gasoline: "gasoline",
  petrol: "gasoline",
  "بنزين": "gasoline",
  diesel: "diesel",
  "ديزل": "diesel",
  electric: "electric",
  electricity: "electric",
  "كهرباء": "electric",
  hybrid: "hybrid",
  "هايبرد": "hybrid",
}

export function getFuelTranslationKey(value: string) {
  return fuelKeys[value.trim().toLocaleLowerCase()] ?? null
}
