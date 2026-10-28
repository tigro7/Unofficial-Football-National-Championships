import Image from 'next/image';
import Link from 'next/link';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface CardProps {
  imageSrc: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const Card = ({ imageSrc, title, description, buttonText, buttonLink }: CardProps) => {
  return (
    <Link href={buttonLink} className="card w-full h-full bg-system flex flex-col p-[var(--margin-lg)] text-left gap-[var(--margin-md)]">
      <div className="flex items-start gap-[var(--margin-md)] flex-1">
        <Image src={imageSrc} alt={title} height={64} width={64} className="object-cover rounded-md flex-shrink-0" />
        <div className="flex flex-col gap-[var(--margin-xxs)]">
          <h3 className="par font-semibold">{title}</h3>
          <p className="small text-secondary">{description}</p>
        </div>
      </div>
      <div className="self-end">
        <span className="small font-semibold text-primary flex items-center gap-[var(--margin-xs)]">
          {buttonText} <FontAwesomeIcon icon={faArrowRight} size="xs" />
        </span>
      </div>
    </Link>
  );
};

export default Card;