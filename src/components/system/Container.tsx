import { FC, ReactNode } from "react";
import { containerStyle } from "./Container.css";

export const Container: FC<{ children: ReactNode }> = ({ children }) => {
  return <div className={containerStyle}>{children}</div>;
};
