import Link from "next/link";

const Button = ({buttonLink, buttonText, primary, className}: {buttonLink: string, buttonText: string, primary: boolean, className?: string}) => {
    const buttonStyle = primary ? 'primary' : 'secondary';
    return (
        <Link href={buttonLink} className={`btn ${buttonStyle} ${className ? className : ''}`}>
            {buttonText}
        </Link>
    );
}

export default Button;