import { MetadataRoute } from 'next';
import { Squadra, BlogPost, Match } from './lib/definitions';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const staticPages = [
        '/',
        '/about',
        '/blog',
    ];

    const fetchBlogPosts = async () => {
        try {            
            const response = await fetch(`${baseUrl}/api/blog`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching blog posts:", error);
        }
    };

    const fetchTeams = async (league: string) => {
        try {
            const response = await fetch(`${baseUrl}/api/${league}/squadre`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching teams:", error);
        }
    }

    const leagues = ['serie_a'];
    let matchIds: Match[] = [];
    for (const league of leagues) {
        const response = await fetch(`${baseUrl}/api/${league}/matches`);
        const matches = await response.json();
        matchIds = [...matchIds, ...matches];
    }
    let teamIds: Squadra[] = [];
    for (const league of leagues) {
        const teams = await fetchTeams(league);
        teamIds = [...teamIds, ...teams];
    }
    const blogPosts : BlogPost[] = await fetchBlogPosts();

    const dynamicPages = [
        ...leagues.flatMap(league => [
            `/${league}`,
            `/${league}/timeline`,
            `/${league}/ranks`
        ]),
        ...matchIds.map((match: Match) => `/${match.league}/match/${match.numero}`),
        ...teamIds.map((team: Squadra) => `/${team.league}/team/${team.squadra}`),
        ...blogPosts.map((post: BlogPost) => `/blog/${post.id}`)
    ];
    const pages = [...staticPages, ...dynamicPages];

    const sitemap: MetadataRoute.Sitemap = pages.map((page) => ({
        url: `${baseUrl}${page}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return sitemap;
}
