import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

export const ExternalLinkIcon: React.VFCX = props => {
  return <FontAwesomeIcon className={props.className} icon={faExternalLinkAlt} />;
};
