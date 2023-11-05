import { FC, ReactNode } from "react";
import classes from "./Layout.module.scss";

export const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  return <div className={classes.layout}>{children}</div>;
};
