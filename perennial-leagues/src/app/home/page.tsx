'use client'

import Link from 'next/link';
import Card from '@/app/components/Card';
import Button from '../components/Button';
import normalizeLeagueName from '../utils/leaguesMap';
import getLeagueDesc from '../utils/leaguesDescMap';
import { useEffect, useState } from 'react';
import { BlogPost } from '../lib/definitions';
import { faArrowRight, faTrain } from '@fortawesome/free-solid-svg-icons';

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
                <Button buttonLink={`/blog/${lastPost.id}`} buttonText={lastPost.call_to_action} primary={false} className='callToAction' iconpre={faTrain} iconpost={faArrowRight} />
            </span>}
            <h3 className="h3 w-full lg:w-1/2">
                <span className='text-secondary'>UFNC</span> tracks championships
                like boxing titles
            </h3>
            <ol className="par w-full lg:w-1/2 mt-[var(--margin-md)] flex flex-col gap-[var(--margin-sm)] list-none">
                <li className="text-primary">Won against the <span className="text-secondary font-bold mr-[var(--margin-sm)]">Reigning Champion</span>and the title is yours</li>
                <li className="text-primary">You put your title up for <span className="text-secondary font-bold mr-[var(--margin-sm)]">Challenges</span>in every official match</li>
                <li className="text-primary"><span className="text-secondary font-bold mr-[var(--margin-sm)]">Defend</span>the crown and you might get some perks</li>
            </ol>
            <span className="par w-full lg:w-1/2 text-primary mt-[var(--margin-md)] block">
                Track every reign, defense, and challenge across multiple leagues.
                <Link href={`https://www.ufwc.co.uk/`} target='_blank' className='link-secondary ml-[var(--margin-sm)]'>
                    Inspired by UFWC
                </Link>
            </span>
            <div className='w-full lg:w-1/2 mt-[var(--margin-big)] flex flex-col sm:flex-row gap-[var(--margin-sm)]'>
                <Button buttonLink={`/${lastMatchLeague}/match/${lastMatchNumber}`} buttonText='Last match' primary className='w-full sm:w-auto text-center' />
                <Button buttonLink={`/${lastMatchLeague}/team/${reigningChampion}`} buttonText={isLoading ? 'Crowning a champ...' : reigningChampion ? `${reigningChampion} is the reigning champ` : 'Uh oh! Something is missing...'} primary={false} className='w-full sm:w-auto text-center' />
            </div>
            <section className="section mt-[var(--margin-big)]">
                <span className="section-label">Leagues</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--margin-lg)]">
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
            </section>
            <section className="section">
                <span className="section-label">Discover</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--margin-lg)]">
                    <Card imageSrc='/card_background.png' title='Blog' description='Read all the latest news and announcements. Stay up to the date on all future developments and check out cool stories about recent and past challenges.' buttonText='Read More' buttonLink='/blog' />
                    <Card imageSrc='/card_background.png' title='About UFNC' description='What is this all about? Who is the mad man behind this? Is there anything I need to understand before diving in?' buttonText='Find out' buttonLink='/about' />
                    <Card imageSrc='/card_background.png' title='Who reigned on…' description='Pick any date and discover who held the title across all leagues on that day.' buttonText='Explore' buttonLink='/date' />
                </div>
            </section>
        </main>  
    );
};

export default HomePage;