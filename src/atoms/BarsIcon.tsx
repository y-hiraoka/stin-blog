import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export const BarsIcon: React.VFCX = props => {
  return <FontAwesomeIcon className={props.className} icon={faBars} />;
};
