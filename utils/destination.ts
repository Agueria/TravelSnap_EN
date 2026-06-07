export function extractCountry(destination: string): string {
  const parts = destination
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return parts[parts.length - 1] ?? destination.trim();
}
