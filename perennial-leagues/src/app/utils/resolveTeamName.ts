import { VercelPoolClient } from "@vercel/postgres";
import normalizeTeamName from "./namesMap";

export async function resolveTeamName(
    raw: string,
    league: string,
    client: VercelPoolClient
): Promise<string> {
    // 1. static namesMap (~2100 known historical variants)
    const mapped = normalizeTeamName(raw);
    if (mapped !== raw) return mapped;

    // 2. DB aliases — escape hatch for variants not in namesMap
    const rows = await client.sql`
        SELECT squadra FROM squadre
        WHERE league = ${league}
          AND aliases IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(aliases::jsonb) AS alias_name
            WHERE alias_name = ${raw}
          )
        LIMIT 1
    `;
    return rows.rowCount && rows.rowCount > 0 ? rows.rows[0].squadra : raw;
}
