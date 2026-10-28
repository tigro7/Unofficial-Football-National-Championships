import { MetadataRoute } from 'next';
import { db } from '@vercel/postgres';

const leagues = ['serie_a', 'premier_league'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '') + '/';

    const staticPages = ['', 'about', 'blog'];

    const client = await db.connect();

    let matchRows: { numero: number; league: string }[] = [];
    let teamRows: { squadra: string; league: string }[] = [];
    let blogRows: { id: number }[] = [];

    try {
        for (const league of leagues) {
            const [matches, teams] = await Promise.all([
                client.sql<{ numero: number; league: string }>`
                    SELECT numero, league FROM matches WHERE league = ${league} ORDER BY numero DESC LIMIT 100
                `,
                client.sql<{ squadra: string; league: string }>`
                    SELECT squadra, league FROM squadre WHERE league = ${league}
                `,
            ]);
            matchRows = [...matchRows, ...matches.rows];
            teamRows = [...teamRows, ...teams.rows];
        }
        const blog = await client.sql<{ id: number }>`SELECT id FROM blog ORDER BY id DESC`;
        blogRows = blog.rows;
    } catch (error) {
        console.error('sitemap: DB query failed', error);
    } finally {
        client.release();
    }

    const dynamicPages = [
        ...leagues.flatMap(league => [
            `${league}`,
            `${league}/timeline`,
            `${league}/ranks`,
        ]),
        ...matchRows.map(m => `${m.league}/match/${m.numero}`),
        ...teamRows.map(t => `${t.league}/team/${t.squadra}`),
        ...blogRows.map(b => `blog/${b.id}`),
    ];

    return [...staticPages, ...dynamicPages].map(page => ({
        url: `${baseUrl}${page}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));
}
