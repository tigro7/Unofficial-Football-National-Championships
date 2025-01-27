
'use client'

import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
  } from '@tanstack/react-table'
import { useState } from 'react';

type Squadra = {
    squadra: string, 
    regni: number, 
    media: number, 
    colore_primario: string, 
    colore_secondario: string, 
    league: string, 
    difese: number,
    media_difese: number,
    sfide: number,
}

const columnHelper = createColumnHelper<Squadra>();

const columns = [
    columnHelper.accessor('regni', {
      cell: info => info.getValue(),
      footer: info => info.column.id,
    }),
    columnHelper.accessor(row => row.squadra, {
      id: 'squadra',
      cell: info => <i>{info.getValue()}</i>,
      header: () => <span>Squadra</span>,
      footer: info => info.column.id,
    }),
    columnHelper.accessor('media', {
      header: () => 'Media',
      cell: info => info.renderValue(),
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
    columnHelper.accessor('sfide', {
      header: 'Sfide',
      footer: info => info.column.id,
    }),
  ]

const Ranks = ({ squadre }: {
                squadre: Squadra[],
            }) => {
    
                const [data, _setData] = useState(() => [...squadre])
              
                const table = useReactTable({
                  data,
                  columns,
                  getCoreRowModel: getCoreRowModel(),
                })
              
                return (
                  <div className="p-2">
                    <table>
                      <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                              <th key={header.id}>
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {table.getRowModel().rows.map(row => (
                          <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                              <td key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        {table.getFooterGroups().map(footerGroup => (
                          <tr key={footerGroup.id}>
                            {footerGroup.headers.map(header => (
                              <th key={header.id}>
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.footer,
                                      header.getContext()
                                    )}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </tfoot>
                    </table>
                  </div>
                )
}
export default Ranks;