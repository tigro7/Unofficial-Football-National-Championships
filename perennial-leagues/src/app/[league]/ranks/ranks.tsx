
'use client'

import TableComponent from '@/app/components/TanTable';
import {
    createColumnHelper,
  } from '@tanstack/react-table'
import { useState } from 'react';

type Squadra = {
    squadra: string, 
    regni: number, 
    durata: number,
    media: number, 
    colore_primario: string, 
    colore_secondario: string, 
    league: string, 
    difese: number,
    media_difese: number,
    sfide: number,
}

const columnHelper = createColumnHelper<Squadra>();

const columnsRegni = [
  columnHelper.accessor(row => row.squadra, {
    id: 'squadra',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>Squadra</span>,
    footer: info => info.column.id,
  }),
  columnHelper.accessor('regni', {
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
]

const columnsDurata = [
  columnHelper.accessor(row => row.squadra, {
    id: 'squadra',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>Squadra</span>,
    footer: info => info.column.id,
  }),
  columnHelper.accessor('durata', {
    header: () => 'Durata',
    cell: info => info.renderValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('media', {
    header: () => 'Media',
    cell: info => info.renderValue(),
    footer: info => info.column.id,
  }),
]

const columnsDifese = [
  columnHelper.accessor(row => row.squadra, {
    id: 'squadra',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>Squadra</span>,
    footer: info => info.column.id,
  }),
  columnHelper.accessor('difese', {
    header: () => <span>Difese</span>,
    footer: info => info.column.id,
  }),
  columnHelper.accessor('media_difese', {
    header: 'Media Difese',
    footer: info => info.column.id,
  }),
]

const columnsSfide = [
  columnHelper.accessor(row => row.squadra, {
    id: 'squadra',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>Squadra</span>,
    footer: info => info.column.id,
  }),
  columnHelper.accessor('sfide', {
    header: 'Sfide',
    footer: info => info.column.id,
  }),
]

const Ranks = ({ squadre }: {squadre: Squadra[],}) => {
    
  const [data,] = useState(() => [...squadre])
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
              
  return(
    <div className="container mx-auto mt-8 p-4 border-4 rounded-xl shadow-md bg-tertiary bg-[center_top_4rem] bg-no-repeat min-h-screen flex flex-col items-center p-6">
      <h1 className="text-4xl md:text-6xl font-bold text-highlights mb-8 text-center">Ranks</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mt-auto">
        <TableComponent<Squadra> columns={columnsRegni} data={data} title="Top 10 Regni" initialState={initialRegni} />
        <TableComponent<Squadra> columns={columnsDurata} data={data} title="Top 10 Durata" initialState={initialDurata}/>
        <TableComponent<Squadra> columns={columnsDifese} data={data} title="Top 10 Difese" initialState={initialDifese}/>
        <TableComponent<Squadra> columns={columnsSfide} data={data} title="Top 10 Sfide" initialState={initialSfide}/>
        {/* Aggiungi altre due tabelle per le statistiche qui */}
      </div>
    </div>
  )

}
export default Ranks;