import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

const Button = ({buttonLink, buttonText, primary, className, iconpre, iconpost}: {buttonLink: string, buttonText: string, primary: boolean, className?: string, iconpre?: IconDefinition, iconpost?: IconDefinition}) => {
    const buttonStyle = primary ? 'primary' : 'secondary';
    return (
        <Link href={buttonLink} className={`btn ${buttonStyle} ${className ? className : ''}`}>
            {iconpre && <><FontAwesomeIcon icon={iconpre} /> {' '}</>}
            {buttonText}
            {iconpost && <>{' '}<FontAwesomeIcon icon={iconpost} /></>}
        </Link>
    );
}

export default Button;