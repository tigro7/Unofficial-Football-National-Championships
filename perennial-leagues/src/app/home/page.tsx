'use client'

import Link from 'next/link';
import Card from '@/app/components/Card';
import Button from '../components/Button';
import normalizeLeagueName from '../utils/leaguesMap';
import getLeagueDesc from '../utils/leaguesDescMap';
import { useEffect, useState } from 'react';
import { BlogPost } from '../lib/definitions';
import { faArrowRight, faFutbol } from '@fortawesome/free-solid-svg-icons';

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
        <main>
            <title>Home - UFNC</title>
            {lastPost && <span className='w-full lg:w-1/2 mt-[var(--margin-big)] mb-[var(--margin-md)] block'>
                <Button buttonLink={`/blog/${lastPost.id}`} buttonText={lastPost.call_to_action} primary={false} className='callToAction' iconpre={faFutbol} iconpost={faArrowRight} />
            </span>}
            <h3 className="h3 w-full lg:w-1/2">
                <span className='text-secondary'>UFNC</span> tracks championships
                like boxing titles
            </h3>
            <span className="par w-full lg:w-1/2 text-primary mt-[var(--margin-md)] block">
                Starting from Italian championship, you can follow titles, defenses and challenges.
                <Link href={`https://www.ufwc.co.uk/`} target='_blank' className='link-secondary ml-[var(--margin-sm)]'>
                    Inspired by UFWC
                </Link>
            </span> 
            <span className='w-full lg:w-1/2 mt-[var(--margin-big)] block'>
                <Button buttonLink={`/${lastMatchLeague}/match/${lastMatchNumber}`} buttonText='Last match' primary className='mr-1' />
                <Button buttonLink={`/${lastMatchLeague}/team/${reigningChampion}`} buttonText={isLoading ? 'Crowning a champ...' : reigningChampion ? `${reigningChampion} is the reigning champ` : 'Uh oh! Something is missing...'} primary={false} className='hidden lg:inline' />
            </span>
            <span className='w-full lg:w-1/2 mt-[var(--margin-md)] block lg:hidden'>
                <Button buttonLink={`/${lastMatchLeague}/team/${reigningChampion}`} buttonText={isLoading ? 'Crowning a champ...' : reigningChampion ? `${reigningChampion} is the reigning champ` : 'Uh oh! Something is missing...'} primary={false} />
            </span>
            <div className="flex flex-wrap justify-between w-full mt-[var(--margin-huge)] gap-y-[var(--margin-big)]">
                <Card 
                    imageSrc='/italian_card.png' title={normalizeLeagueName('serie_a')} 
                    description={getLeagueDesc('serie_a')}
                    buttonText='Explore' buttonLink='/serie_a' 
                />
                <Card 
                    imageSrc='/english_card.png' title={normalizeLeagueName('premier_league')} 
                    description={getLeagueDesc('premier_league')}
                    buttonText='Explore' buttonLink='/premier_league'
                />
                <Card imageSrc='/spanish_card.png' title={normalizeLeagueName('laliga')} description={getLeagueDesc('laliga')} buttonText='...' buttonLink='/' />
            </div>
            <div className="flex flex-wrap justify-between w-full mt-[var(--margin-big)] gap-y-[var(--margin-big)]">
                <Card imageSrc='/card_background.png' title='Blog' description='Read all the latest news and announcements. Stay up to the date on all future developments and check out cool stories about recent and past challenges.' buttonText='Read More' buttonLink='/blog' />
                <Card imageSrc='/card_background.png' title='About UFNC' description='What is this all about? Who is the mad man behind this? Is there anything I need to understand before diving in?' buttonText='Find out' buttonLink='/about' />
                {/*
                    <Card imageSrc='/card_background.png' title='Title 6' description='Description 6' buttonText='Button 6' buttonLink='/link6' />
                */}
            </div>
        </main>  
    );
};

export default HomePage;