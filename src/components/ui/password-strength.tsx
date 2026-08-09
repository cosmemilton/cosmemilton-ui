import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils.js";

export type CmPasswordStrengthScore = 0 | 1 | 2 | 3 | 4;

export type CmPasswordStrengthResult = {
  score: CmPasswordStrengthScore;
  /** Rótulo do nível. */
  label: string;
  /** O que falta para subir de nível — pronto para virar dica na tela. */
  hints: string[];
};

export type CmPasswordStrengthOptions = {
  /** Tamanho mínimo aceitável. Abaixo dele o resultado nunca passa de `1`. Padrão `8`. */
  minLength?: number;
  /** Rótulos dos cinco níveis, do 0 ao 4. */
  labels?: string[];
};

const defaultLabels = ["muito fraca", "fraca", "razoável", "boa", "forte"];

/* Palavras e formas que qualquer lista de ataque tem na primeira página. Não é
   uma lista de senhas vazadas — é o mínimo para o medidor não dizer "forte"
   para `Senha@2026`, que é exatamente o que um usuário digita quando o medidor
   pede maiúscula, número e símbolo. */
const obviousPatterns = [
  /^\d+$/,
  /senha/i,
  /password/i,
  /qwerty/i,
  /qwert/i,
  /asdf/i,
  /123456/,
  /admin/i,
  /iloveyou/i,
  /letmein/i,
];

function characterClasses(password: string) {
  let classes = 0;
  if (/[a-z]/.test(password)) classes += 1;
  if (/[A-Z]/.test(password)) classes += 1;
  if (/\d/.test(password)) classes += 1;
  if (/[^\p{L}\p{N}]/u.test(password)) classes += 1;
  return classes;
}

/** Três ou mais repetições do mesmo caractere (`aaa`, `!!!`). */
function hasRepetition(password: string) {
  return /(.)\1{2,}/u.test(password);
}

/** Quatro ou mais códigos consecutivos, para cima ou para baixo (`abcd`, `4321`). */
function hasSequence(password: string) {
  let ascending = 1;
  let descending = 1;
  for (let index = 1; index < password.length; index += 1) {
    const delta = password.charCodeAt(index) - password.charCodeAt(index - 1);
    ascending = delta === 1 ? ascending + 1 : 1;
    descending = delta === -1 ? descending + 1 : 1;
    if (ascending >= 4 || descending >= 4) return true;
  }
  return false;
}

/**
 * Heurística de INTERFACE, não medida de entropia: serve para orientar quem
 * digita, e nunca substitui a política de senha de quem valida do outro lado.
 * O resultado é estável (função pura), então serve igual em render de servidor.
 */
export function cmEstimatePasswordStrength(
  password: string,
  options: CmPasswordStrengthOptions = {},
): CmPasswordStrengthResult {
  const { labels = defaultLabels, minLength = 8 } = options;
  const level = (score: CmPasswordStrengthScore, hints: string[]): CmPasswordStrengthResult => ({
    score,
    label: labels[score] ?? defaultLabels[score],
    hints,
  });

  if (!password) return level(0, [`use pelo menos ${minLength} caracteres`]);

  const classes = characterClasses(password);
  const hints: string[] = [];
  if (password.length < minLength) hints.push(`use pelo menos ${minLength} caracteres`);
  else if (password.length < 12) hints.push("senhas longas valem mais que senhas complicadas");
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password))
    hints.push("misture maiúsculas e minúsculas");
  if (!/\d/.test(password)) hints.push("inclua números");
  if (!/[^\p{L}\p{N}]/u.test(password)) hints.push("inclua símbolos");
  if (hasRepetition(password)) hints.push("evite repetir o mesmo caractere");
  if (hasSequence(password)) hints.push("evite sequências como 1234 ou abcd");

  const obvious = obviousPatterns.some((pattern) => pattern.test(password));
  if (obvious) hints.push("evite palavras óbvias");

  let points = 0;
  if (password.length >= minLength) points += 1;
  if (password.length >= 12) points += 1;
  if (password.length >= 16) points += 1;
  if (classes >= 2) points += 1;
  if (classes >= 3) points += 1;
  if (classes >= 4) points += 1;
  if (hasRepetition(password)) points -= 1;
  if (hasSequence(password)) points -= 1;

  let score: CmPasswordStrengthScore = 0;
  if (points >= 6) score = 4;
  else if (points >= 4) score = 3;
  else if (points === 3) score = 2;
  else if (points === 2) score = 1;

  // Tetos duros: curta demais ou óbvia demais não sobe, por mais símbolos que
  // tenha. É a diferença entre um medidor honesto e um enfeite verde.
  if (password.length < minLength) score = Math.min(score, 1) as CmPasswordStrengthScore;
  if (obvious) score = Math.min(score, 1) as CmPasswordStrengthScore;

  return level(score, hints);
}

export type CmPasswordStrengthProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** A senha digitada. O nível sai daqui pelo estimador da lib. */
  value?: string;
  /** Nível já calculado por quem chama — ignora `value` e o estimador. */
  score?: CmPasswordStrengthScore;
  /** Texto à direita. Sem ele, usa o rótulo do nível. */
  label?: ReactNode;
  /** Rótulos dos cinco níveis, do 0 ao 4. */
  levelLabels?: string[];
  /** Tamanho mínimo repassado ao estimador. Padrão `8`. */
  minLength?: number;
  /** Lista as dicas do estimador abaixo da barra. Padrão `false`. */
  showHints?: boolean;
  /** Dicas próprias, no lugar das do estimador. */
  hints?: string[];
  /** Anuncia a mudança de nível (aria-live). Padrão `true`. */
  live?: boolean;
  /** Nome acessível do medidor. Padrão "Força da senha". */
  meterLabel?: string;
};

const toneByScore = ["danger", "danger", "warning", "info", "success"] as const;

/* A senha só é LIDA aqui — nunca guardada, nunca enviada. O medidor mora na
   página de propósito: mandar a senha para um serviço só para pintar quatro
   barrinhas seria criar superfície de vazamento a troco de estética. */
export const CmPasswordStrength = forwardRef<HTMLDivElement, CmPasswordStrengthProps>(
  function CmPasswordStrength(
    {
      className,
      hints,
      label,
      levelLabels,
      live = true,
      meterLabel = "Força da senha",
      minLength = 8,
      score,
      showHints = false,
      value,
      ...rest
    },
    ref,
  ) {
    const estimate =
      score === undefined
        ? cmEstimatePasswordStrength(value ?? "", { labels: levelLabels, minLength })
        : undefined;
    const level = score ?? estimate?.score ?? 0;
    const levelLabel =
      estimate?.label ?? (levelLabels ?? defaultLabels)[level] ?? defaultLabels[level];
    const shownHints = hints ?? estimate?.hints ?? [];
    const tone = toneByScore[level];

    return (
      <div
        ref={ref}
        className={cn("cm-password-strength", `cm-password-strength--tone-${tone}`, className)}
        {...rest}
      >
        <div
          className="cm-password-strength__meter"
          role="meter"
          aria-label={meterLabel}
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={level}
          aria-valuetext={typeof label === "string" ? label : levelLabel}
        >
          {[1, 2, 3, 4].map((segment) => (
            <span
              key={segment}
              className={cn(
                "cm-password-strength__segment",
                segment <= level && "cm-password-strength__segment--on",
              )}
            />
          ))}
        </div>
        <span
          className="cm-password-strength__label"
          aria-live={live ? "polite" : undefined}
          aria-hidden={live ? undefined : true}
        >
          {label ?? levelLabel}
          {level === 4 ? (
            <span className="cm-password-strength__check" aria-hidden="true">
              {" ✓"}
            </span>
          ) : null}
        </span>
        {showHints && shownHints.length > 0 ? (
          <ul className="cm-password-strength__hints">
            {shownHints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  },
);
CmPasswordStrength.displayName = "CmPasswordStrength";
