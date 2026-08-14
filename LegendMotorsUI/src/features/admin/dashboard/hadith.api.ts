export type Hadith = { arabic: string; source?: string }

export async function getRandomHadith(): Promise<Hadith> {
  const response = await fetch("https://ummahapi.com/api/hadith/random", { signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new Error("Hadith service is unavailable")
  const payload = (await response.json()) as Record<string, unknown>
  const data = (payload.data ?? payload.hadith ?? payload) as Record<string, unknown>
  const arabic = [data.arabic, data.hadithArabic, data.text_ar, data.arabicText].find((value) => typeof value === "string")
  if (typeof arabic !== "string" || !arabic.trim()) throw new Error("Hadith text was not returned")
  const collection = data.collection as Record<string, unknown> | string | undefined
  const source = typeof data.collection_name === "string" ? data.collection_name : typeof collection === "string" ? collection : typeof collection?.name === "string" ? collection.name : typeof data.book === "string" ? data.book : undefined
  return { arabic, source }
}
