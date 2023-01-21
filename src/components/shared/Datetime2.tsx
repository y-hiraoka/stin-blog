import { Box, HTMLChakraProps } from "@chakra-ui/react";
import { parseISO, format as formatter } from "date-fns";
import { useMemo, FC } from "react";

type Props = {
  datetime: string;
  format: string;
} & Omit<HTMLChakraProps<"time">, "children" | "dateTime">;

export const Datetime2: FC<Props> = ({ datetime, format, ...rest }) => {
  const date = useMemo(() => parseISO(datetime), [datetime]);

  return (
    // @ts-expect-error div と推論されてしまう
    <Box as="time" dateTime={datetime} {...rest}>
      {formatter(date, format)}
    </Box>
  );
};
