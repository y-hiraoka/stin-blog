import { RecipeVariantType } from "@vanilla-extract/recipes";
import { ComponentProps, FC, forwardRef, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { iconButtonStyle } from "./IconButton.css";

type IconButtonProps = Omit<ComponentProps<"button">, "children"> & {
  icon: ReactNode;
  "aria-label": string;
  variant?: RecipeVariantType<typeof iconButtonStyle, "variant">;
  color?: RecipeVariantType<typeof iconButtonStyle, "color">;
  size?: RecipeVariantType<typeof iconButtonStyle, "size">;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { icon, variant, color, size, className, ...buttonProps },
    forwardedRef,
  ) {
    return (
      <button
        {...buttonProps}
        ref={forwardedRef}
        type={buttonProps.type ?? "button"}
        className={cx(iconButtonStyle({ color, size, variant }), className)}>
        {icon}
      </button>
    );
  },
);
