import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags } from "@fortawesome/free-solid-svg-icons";

export const TagsIcon: React.VFCX = props => {
  return <FontAwesomeIcon className={props.className} icon={faTags} />;
};
