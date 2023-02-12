import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

function PasswordInput({ ...props }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="input-group">
      <input className="form-control" {...props} type={isVisible ? "text" : "password"} />
      <div className="input-group-text" onClick={_ => setIsVisible(!isVisible)}><FontAwesomeIcon icon={isVisible ? faEye : faEyeSlash} /></div>
    </div>
  );
}

export default PasswordInput;