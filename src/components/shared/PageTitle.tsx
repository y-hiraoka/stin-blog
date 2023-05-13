import { FC, ReactNode } from "react";
import classes from "./PageTitle.module.scss";

export const PageTitle: FC<{ children: ReactNode }> = ({ children }) => {
  return <h1 className={classes.pageTitle}>{children}</h1>;
};
