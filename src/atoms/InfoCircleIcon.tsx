import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

export const InfoCircleIcon: React.VFCX = props => {
  return <FontAwesomeIcon className={props.className} icon={faInfoCircle} />;
};
