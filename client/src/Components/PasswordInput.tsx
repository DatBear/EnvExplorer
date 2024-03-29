import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InputHTMLAttributes, useState } from "react";

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {

};

function PasswordInput({ ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex items-center bg-inherit rounded-md border border-primary-800">
      <input className="ml-2 outline-none bg-inherit flex-grow" {...props} type={isVisible ? "text" : "password"} />
      <div className="input-group-text" onClick={_ => setIsVisible(!isVisible)}>
        <FontAwesomeIcon icon={isVisible ? faEye : faEyeSlash} className="p-2" />
      </div>
    </div>
  );
}

export default PasswordInput;