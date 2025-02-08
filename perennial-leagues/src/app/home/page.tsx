import Link from 'next/link';
import Card from '@/app/components/Card';
import Button from '../components/Button';
import normalizeLeagueName from '../utils/leaguesMap';
import getLeagueDesc from '../utils/leaguesDescMap';

const HomePage = () => {
  return (
    <>
        <h3 className="h3 w-1/2">
            <span className='text-secondary'>UFNC</span> tracks championships
            like boxing titles
        </h3>
        <span className="par w-1/2 text-primary mt-[var(--margin-md)] block">
            Starting from Italian championship, you can follow titles, defenses and challenges.
            <Link href={`https://www.ufwc.co.uk/`} target='_blank' className='link-tertiary ml-[var(--margin-sm)]'>
                Inspired by UFWC
            </Link>
        </span> 
        <span className='w-1/2 mt-[var(--margin-big)] block'>
            <Button buttonLink='/last' buttonText='Last match' primary />
            <Button buttonLink='/serie_a/napoli' buttonText='Napoli is the reigning champion' primary={false} />
        </span>
        <div className="flex flex-wrap justify-between w-full mt-[var(--margin-huge)]">
            <Card 
                imageSrc='/asteriskCup.png' title={normalizeLeagueName('serie_a')} 
                description={getLeagueDesc('serie_a')}
                buttonText='Explore' buttonLink='/serie_a' 
            />
            <Card imageSrc='/image2.png' title='Title 2' description='Description 2' buttonText='Button 2' buttonLink='/link2' />
            <Card imageSrc='/image3.png' title='Title 3' description='Description 3' buttonText='Button 3' buttonLink='/link3' />
        </div>
        <div className="flex flex-wrap justify-between w-full mt-[var(--margin-big)]">
            <Card imageSrc='/image4.png' title='Title 4' description='Description 4' buttonText='Button 4' buttonLink='/link4' />
            <Card imageSrc='/image5.png' title='Title 5' description='Description 5' buttonText='Button 5' buttonLink='/link5' />
            <Card imageSrc='/image6.png' title='Title 6' description='Description 6' buttonText='Button 6' buttonLink='/link6' />
        </div>
    </>  
  );
};

export default HomePage;