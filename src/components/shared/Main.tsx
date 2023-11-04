import { FC, ReactNode } from "react";
import classes from "./Main.module.scss";

export const Main: FC<{ children: ReactNode }> = ({ children }) => {
  return <main className={classes.main}>{children}</main>;
};
