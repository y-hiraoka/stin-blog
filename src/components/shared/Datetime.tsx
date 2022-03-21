import { Box, HTMLChakraProps } from "@chakra-ui/react";
import { parseISO, format as formatter } from "date-fns";
import { useMemo, VFC } from "react";

type Props = {
  datetime: string;
  format: string;
} & Omit<HTMLChakraProps<"time">, "children" | "dateTime">;

export const Datetime: VFC<Props> = ({ datetime, format, ...rest }) => {
  const date = useMemo(() => parseISO(datetime), [datetime]);

  return (
    <Box as="time" dateTime={datetime} {...rest}>
      {formatter(date, format)}
    </Box>
  );
};
