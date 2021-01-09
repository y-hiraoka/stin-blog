import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList } from "@fortawesome/free-solid-svg-icons";

export const ListIcon: React.VFCX = props => {
  return <FontAwesomeIcon className={props.className} icon={faList} />;
};
