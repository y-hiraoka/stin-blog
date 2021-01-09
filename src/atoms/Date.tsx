import { parseISO, format } from "date-fns";

type Props = { dateString: string };

export const Date: React.VFCX<Props> = props => {
  const date = parseISO(props.dateString);
  return (
    <time dateTime={props.dateString} className={props.className}>
      {format(date, "yyyy/MM/dd HH:mm")}
    </time>
  );
};
