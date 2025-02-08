import Link from "next/link";

const Button = ({buttonLink, buttonText, primary}: {buttonLink: string, buttonText: string, primary: boolean}) => {
    const buttonStyle = primary ? 'primary' : 'secondary';
    return (
        <Link href={buttonLink} className={`btn ${buttonStyle}`}>
            {buttonText}
        </Link>
    );
}

export default Button;