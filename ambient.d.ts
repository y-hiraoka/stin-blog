import React from "react";

declare module "react" {
  type FCX<P = {}> = React.FC<P & { className?: string }>;
  type VFCX<P = {}> = React.VFC<P & { className?: string }>;
}
