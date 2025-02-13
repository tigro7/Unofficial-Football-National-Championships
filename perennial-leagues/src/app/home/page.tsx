'use client'

import Link from 'next/link';
import Card from '@/app/components/Card';
import Button from '../components/Button';
import normalizeLeagueName from '../utils/leaguesMap';
import getLeagueDesc from '../utils/leaguesDescMap';
import { useEffect, useState } from 'react';
import { BlogPost } from '../lib/definitions';
import { faArrowRight, faChampagneGlasses } from '@fortawesome/free-solid-svg-icons';

const HomePage = () => {

    const [lastMatchNumber, setLastMatchNumber] = useState<string | null>(null);
    const [reigningChampion, setReigningChampion] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastMatchLeague, setLastMatchLeague] = useState<string | null>(null);
    const [lastPost, setLastPost] = useState<BlogPost>();
    const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // URL di base

    useEffect(() => {
        const fetchNextMatch = async () => {
            try {
                const response = await fetch(`${host}/api/matches/last`);
                const data = (await response.json())[0];
                const lastMatch = Number(data.numero);
                setLastMatchNumber(String(lastMatch));
                setReigningChampion(data.detentore);
                setLastMatchLeague(data.league);
            } catch (error) {
                console.error("Error fetching next match:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchLastPost = async () => {
            try {
                const response = await fetch(`${host}/api/blog/last`);
                const data = (await response.json())[0];
                setLastPost(data);
            } catch (error) {
                console.error("Error fetching last post:", error);
            }
        };

        fetchNextMatch();
        fetchLastPost();

    }, [host]);

    return (
        <>
            {lastPost && <span className='w-full lg:w-1/2 mt-[var(--margin-big)] mb-[var(--margin-md)] block'>
                <Button buttonLink={`/blog/${lastPost.id}`} buttonText={lastPost.call_to_action} primary={false} className='callToAction' iconpre={faChampagneGlasses} iconpost={faArrowRight} />
            </span>}
            <h3 className="h3 w-full lg:w-1/2">
                <span className='text-secondary'>UFNC</span> tracks championships
                like boxing titles
            </h3>
            <span className="par w-full lg:w-1/2 text-primary mt-[var(--margin-md)] block">
                Starting from Italian championship, you can follow titles, defenses and challenges.
                <Link href={`https://www.ufwc.co.uk/`} target='_blank' className='link-tertiary ml-[var(--margin-sm)]'>
                    Inspired by UFWC
                </Link>
            </span> 
            <span className='w-full lg:w-1/2 mt-[var(--margin-big)] block'>
                <Button buttonLink={`/${lastMatchLeague}/match/${lastMatchNumber}`} buttonText='Last match' primary className='mr-1' />
                <Button buttonLink={`/${lastMatchLeague}/${reigningChampion}`} buttonText={isLoading ? 'Crowning a champ...' : reigningChampion ? `${reigningChampion} is the reigning champion` : 'Uh oh! Something is missing...'} primary={false} />
            </span>
            <div className="flex flex-wrap justify-between w-full mt-[var(--margin-huge)]">
                <Card 
                    imageSrc='/asteriskCup.png' title={normalizeLeagueName('serie_a')} 
                    description={getLeagueDesc('serie_a')}
                    buttonText='Explore' buttonLink='/serie_a' 
                />
                <Card imageSrc='/image2.png' title='Blog' description='Read all the latest news and announcements.' buttonText='Read More' buttonLink='/blog' />
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