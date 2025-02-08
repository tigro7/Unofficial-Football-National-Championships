import Image from 'next/image';
import Button from '../Button';

interface CardProps {
  imageSrc: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const Card = ({ imageSrc, title, description, buttonText, buttonLink }: CardProps) => {
  return (
    <div className="card w-[30rem] bg-system rounded-lg flex flex-col p-4 text-left">
      <div className="flex flex-col">
        <Image src={imageSrc} alt={title} height={64} width={64} className="object-cover rounded-lg mb-4" />
        <h3 className="sub">{title}</h3>
        <p className="small">{description}</p>
      </div>
      <div className="self-end btn-container">
        <Button buttonLink={buttonLink} buttonText={buttonText} primary />
      </div>
    </div>
  );
};

export default Card;