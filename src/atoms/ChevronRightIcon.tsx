import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

export const ChevronRight: React.VFCX = props => {
  return <FontAwesomeIcon className={props.className} icon={faChevronRight} />;
};
