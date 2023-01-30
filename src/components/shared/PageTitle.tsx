import { FC, ReactNode } from "react";
import { pageTitleStyle } from "./PageTitle.css";

export const PageTitle: FC<{ children: ReactNode }> = ({ children }) => {
  return <h1 className={pageTitleStyle}>{children}</h1>;
};
