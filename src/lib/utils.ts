export function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export function formatNCM(code: string): string {
  if (code.length === 8 && !code.includes(".")) {
    return `${code.slice(0, 4)}.${code.slice(4, 6)}.${code.slice(6)}`;
  }
  return code;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}
