
'use client'

import TableComponent from '@/app/components/TanTable';
import { ColumnDef, createColumnHelper, } from '@tanstack/react-table'
import { useState } from 'react';
import TeamLink from '@/app/components/TeamLink';

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
    columnHelperUltimo.accessor('data', {
      header: 'Last time',
      cell: info => {
        const value = info.renderValue();
        return value ? new Date(value).toLocaleDateString() : '';
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
    <div className="container mx-auto mt-8 p-4 border-4 rounded-xl shadow-md bg-tertiary bg-[center_top_4rem] bg-no-repeat min-h-screen flex flex-col items-center p-6">
      <h1 className="text-4xl md:text-6xl font-bold text-highlights mb-8 text-center">Ranks</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mt-auto">
        <TableComponent<Squadra> columns={columnsRegni} data={teams} title="Top teams by reigns" initialState={initialRegni} />
        <TableComponent<Squadra> columns={columnsDurata} data={teams} title="Top teams by combined duration" initialState={initialDurata}/>
        <TableComponent<Squadra> columns={columnsDifese} data={teams} title="Top teams by defenses" initialState={initialDifese}/>
        <TableComponent<Squadra> columns={columnsSfide} data={teams} title="Top teams by challenges" initialState={initialSfide}/>
        <TableComponent<Stats> columns={columnsStats} data={statistiche} title="Top teams by stats" initialState={initialStats}/>
        <TableComponent<Ultimo> columns={columnsUltimo} data={last} title="Longest time without a title" initialState={initialUltimo}/>
      </div>
    </div>
  )

}
export default Ranks;