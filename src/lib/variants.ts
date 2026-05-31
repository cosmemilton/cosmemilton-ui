import { cn } from "./utils.js";

type VariantOptions = Record<string, string | undefined>;
type VariantsSchema = Record<string, VariantOptions>;

type VariantSelection<S extends VariantsSchema> = {
  [K in keyof S]?: keyof S[K] | undefined;
};

type CmVariantsConfig<S extends VariantsSchema> = {
  /** Class(es) always applied. */
  base?: string;
  /** Named groups of mutually-exclusive option -> class mappings. */
  variants?: S;
  /** Option chosen per group when a prop is omitted. */
  defaultVariants?: VariantSelection<S>;
};

/** Extracts the variant-selection prop type from a `cmVariants` result. */
export type CmVariantProps<F> = F extends (props?: infer P) => string
  ? Omit<NonNullable<P>, "className">
  : never;

/**
 * Tiny, dependency-free variant resolver (the role `class-variance-authority`
 * plays elsewhere). Replaces the hand-written `toneMap`/`sizeMap` lookups each
 * component used to carry, centralizing `variant`/`tone`/`size`/`density`
 * resolution behind one typed helper.
 */
export function cmVariants<S extends VariantsSchema>(config: CmVariantsConfig<S>) {
  const { base, variants, defaultVariants } = config;

  return (props?: VariantSelection<S> & { className?: string }): string => {
    const classes: Array<string | undefined> = [base];

    if (variants) {
      for (const group in variants) {
        const selected = (props?.[group] ?? defaultVariants?.[group]) as
          | string
          | undefined;
        if (selected != null) classes.push(variants[group][selected]);
      }
    }

    return cn(...classes, props?.className);
  };
}
