import { RecipeVariants, RuntimeFn } from "@vanilla-extract/recipes";

declare module "@vanilla-extract/recipes" {
  export type RecipeVariantType<
    Recipe extends RuntimeFn<unknown>,
    Variant extends keyof NonNullable<RecipeVariants<Recipe>>,
  > = NonNullable<NonNullable<RecipeVariants<Recipe>>[Variant]>;
}
