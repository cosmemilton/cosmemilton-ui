export function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function onlyCNPJChars(value: string) {
  return value.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

export function formatNCM(code: string): string {
  if (code.length === 8 && !code.includes(".")) {
    return `${code.slice(0, 4)}.${code.slice(4, 6)}.${code.slice(6)}`;
  }
  return code;
}

export function formatCPF(value: string): string {
  const digits = onlyDigits(value);

  if (digits.length !== 11) {
    return value;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatCNPJ(value: string): string {
  const code = onlyCNPJChars(value);

  if (code.length !== 14 || !/^[A-Z0-9]{12}\d{2}$/.test(code)) {
    return value;
  }

  return `${code.slice(0, 2)}.${code.slice(2, 5)}.${code.slice(5, 8)}/${code.slice(8, 12)}-${code.slice(12)}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function formatPhone(value: string): string {
  const digits = onlyDigits(value);

  if (digits.length === 13 && digits.startsWith("55")) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }

  if (digits.length === 12 && digits.startsWith("55")) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`;
  }

  if (digits.length === 11 && /^0[3589]00/.test(digits)) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 9) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  return value;
}
