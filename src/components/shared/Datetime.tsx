import { format as formatter } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { FC, ComponentProps } from "react";

type Props = {
  datetime: string;
  format: string;
} & Omit<ComponentProps<"time">, "children" | "dateTime">;

export const Datetime: FC<Props> = ({ datetime, format, ...props }) => {
  const date = utcToZonedTime(datetime, "Asia/Tokyo");

  return (
    <time dateTime={datetime} {...props}>
      {formatter(date, format)}
    </time>
  );
};
