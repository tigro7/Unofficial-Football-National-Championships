
'use client'

import TableComponent from '@/app/components/TanTable';
import { ColumnDef, createColumnHelper, } from '@tanstack/react-table'
import { useState } from 'react';
import TeamLink from '@/app/components/TeamLink';
import Link from 'next/link';
import normalizeLeagueName from '@/app/utils/leaguesMap';
import Card from '@/app/components/Card';

type Squadra = {
  squadra: string, 
  regni: string, 
  durata: string,
  media: string, 
  colore_primario: string, 
  colore_secondario: string, 
  league: string, 
  difese: string,
  media_difese: string,
  sfide: string,
}

type Stats = {
  squadra: string,
  stats: string,
}

type Ultimo = {
  detentore: string,
  data: string,
  numero: number,
}

const columnHelper = createColumnHelper<Squadra>();
const columnHelperStats = createColumnHelper<Stats>();
const columnHelperUltimo = createColumnHelper<Ultimo>();

const Ranks = ({ squadre, stats, last, league = "serie_a"}: {squadre: Squadra[], stats: Stats[], last: Ultimo[], league: string}) => {

  const columnsRegni = [
    columnHelper.accessor('squadra', {
      cell: info => <TeamLink teamName={info.getValue()} league={league} />,
      header: () => <span>Team</span>,
      footer: info => info.column.id,
    }),
    columnHelper.accessor('regni', {
      cell: info => info.getValue(),
      header: () => <span>Reigns</span>,
      footer: info => info.column.id,
    }),
  ]
  
  const columnsDurata = [
    columnHelper.accessor(row => row.squadra, {
      id: 'squadra',
      cell: info => <TeamLink teamName={info.getValue()} league={league} />,
      header: () => <span>Team</span>,
      footer: info => info.column.id,
    }),
    columnHelper.accessor('durata', {
      header: () => 'Time',
      cell: info => info.renderValue(),
      footer: info => info.column.id,
    }),
    columnHelper.accessor('media', {
      header: () => 'Avg',
      cell: info => info.renderValue(),
      footer: info => info.column.id,
    }),
  ]
  
  const columnsDifese = [
    columnHelper.accessor(row => row.squadra, {
      id: 'squadra',
      cell: info => <TeamLink teamName={info.getValue()} league={league} />,
      header: () => <span>Team</span>,
      footer: info => info.column.id,
    }),
    columnHelper.accessor('difese', {
      header: () => <span>Def</span>,
      footer: info => info.column.id,
    }),
    columnHelper.accessor('media_difese', {
      header: 'Avg',
      footer: info => info.column.id,
    }),
  ]
  
  const columnsSfide = [
    columnHelper.accessor(row => row.squadra, {
      id: 'squadra',
      cell: info => <TeamLink teamName={info.getValue()} league={league} />,
      header: () => <span>Team</span>,
      footer: info => info.column.id,
    }),
    columnHelper.accessor('sfide', {
      header: 'Challenges',
      footer: info => info.column.id,
    }),
  ]
  
  const columnsStats = [
    columnHelperStats.accessor(row => row.squadra, {
      id: 'squadra',
      cell: info => <TeamLink teamName={info.getValue()} league={league} />,
      header: () => <span>Team</span>,
      footer: info => info.column.id,
    }),
    columnHelperStats.accessor('stats', {
      header: 'Stats',
      footer: info => info.column.id,
    }),
  ]
  
  const columnsUltimo: ColumnDef<Ultimo, string>[] = [
    columnHelperUltimo.accessor(row => row.detentore, {
      id: 'detentore',
      cell: info => <TeamLink teamName={info.getValue()} league={league} />,
      header: () => <span>Team</span>,
      footer: info => info.column.id,
    }),
    columnHelperUltimo.accessor(row => row.data, {
      id: 'data',
      header: 'Last time',
      cell: ({cell, row}) => {
        const value = cell.renderValue();
        return value ? <Link href={`/${league}/match/${row.original.numero}`}> {new Date(value).toLocaleDateString()} </Link> : '';
      },
      footer: info => info.column.id,
    }),
  ]
    
  const [teams,] = useState(() => [...squadre])
  const [statistiche,] = useState(() => [...stats])
  const initialRegni = {
    sorting: [
      {
        id: 'regni',
        desc: true, // sort by reigns in descending order by default
      },
    ],
  }
  const initialDurata = {
    sorting: [
      {
        id: 'durata',
        desc: true, // sort by duration in descending order by default
      },
    ],
  }
  const initialDifese = {
    sorting: [
      {
        id: 'difese',
        desc: true, // sort by defenses in descending order by default
      },
    ],
  } 
  const initialSfide = { 
    sorting: [
      {
        id: 'sfide',
        desc: true, // sort by challenges in descending order by default
      },
    ],
  }
  const initialStats = {
    sorting: [
      {
        id: 'stats',
        desc: true, // sort by stats in descending order by default
      },
    ],
  } 
  const initialUltimo = {
    sorting: [
      {
        id: 'data',
        desc: false, // sort by date in ascending order by default
      },
    ],
  }
              
  return(
    <>
      <title>{league} - Stats & Stuff - UFNC</title>
      <h3 className="h3 w-full lg:w-1/2">{normalizeLeagueName(league)} - Stats & Stuff</h3>
      <section className="section mt-[var(--margin-big)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--margin-lg)] mb-[var(--margin-lg)]">
          <Card imageSrc='/card_background.png' title='Records' description='Stronghold Records and Decade Dominators - the teams that have held the title longest and ruled each era.' buttonText='View records' buttonLink={`/${league}/ranks/stronghold`} />
          <Card imageSrc='/card_background.png' title='Consolation Prizes' description='Teams that have challenged for the title but have never managed to win it.' buttonText='View challengers' buttonLink={`/${league}/ranks/no-titles`} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--margin-lg)]">
          <TableComponent<Squadra> columns={columnsRegni} data={teams} title="Top teams by reigns" initialState={initialRegni} />
          <TableComponent<Squadra> columns={columnsDurata} data={teams} title="Top teams by combined duration" initialState={initialDurata}/>
          <TableComponent<Squadra> columns={columnsDifese} data={teams} title="Top teams by defenses" initialState={initialDifese}/>
          <TableComponent<Squadra> columns={columnsSfide} data={teams} title="Top teams by challenges" initialState={initialSfide}/>
          <TableComponent<Stats> columns={columnsStats} data={statistiche} title="Top teams by stats" initialState={initialStats}/>
          <TableComponent<Ultimo> columns={columnsUltimo} data={last} title="Longest time without a title" initialState={initialUltimo}/>
        </div>
      </section>
    </>
  )

}
export default Ranks;