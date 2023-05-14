import { ComponentProps, forwardRef, ReactNode } from "react";
import { cx } from "../../lib/cx";
import classes from "./IconButton.module.scss";

type IconButtonProps = Omit<ComponentProps<"button">, "children"> & {
  icon: ReactNode;
  "aria-label": string;
  variant?: "ghost" | "outlined";
  color?: "normal" | "primary";
  size?: "md";
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { icon, variant = "ghost", color = "normal", size = "md", className, ...buttonProps },
    forwardedRef,
  ) {
    return (
      <button
        {...buttonProps}
        ref={forwardedRef}
        type={buttonProps.type ?? "button"}
        className={cx(
          classes.iconButton,
          classes[`size-${size}`],
          classes[`color-${color}`],
          classes[`variant-${variant}`],
          className,
        )}>
        {icon}
      </button>
    );
  },
);
