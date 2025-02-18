import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
    ColumnDef,
    InitialTableState
  } from '@tanstack/react-table';
  import { useState } from 'react';
  
interface TableComponentProps<T> {
    columns: ColumnDef<T, string>[];
    data: T[];
    title: string;
    initialState?: InitialTableState;
}

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const TableComponent = <T,>({ columns, data, title, initialState }: TableComponentProps<T>) => {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>(initialState?.sorting ?? []);

    const table = useReactTable({
        data,
        columns,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: { pagination, sorting},
    });

    return (
        <div className="card bg-background-dark shadow-md flex flex-col items-center p-4 hover:bg-system-300 transition cursor-pointer">
            <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-tertiary">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    {header.isPlaceholder ? null : (
                                            <div
                                                    className={
                                                            header.column.getCanSort()
                                                            ? 'cursor-pointer select-none'
                                                            : ''
                                                    }
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    title={
                                                            header.column.getCanSort()
                                                            ? header.column.getNextSortingOrder() === 'asc'
                                                                    ? 'Sort ascending'
                                                                    : header.column.getNextSortingOrder() === 'desc'
                                                                    ? 'Sort descending'
                                                                    : 'Clear sort'
                                                            : undefined
                                                    }
                                                    >
                                                    {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                    )}
                                                    {{
                                                            asc: <>{' '}<FontAwesomeIcon icon={faSortUp} /></>,
                                                            desc: <>{' '}<FontAwesomeIcon icon={faSortDown} /></>,
                                                            false: <>{' '}<FontAwesomeIcon icon={faSort} /></>,
                                                    }[header.column.getIsSorted() as string] ?? null}
                                            </div>)}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination flex justify-between items-center w-full mt-4">
                <div>
                    <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                        {'<<'}
                    </button>{' '}
                    <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        {'<'}
                    </button>{' '}
                    <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        {'>'}
                    </button>{' '}
                    <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                        {'>>'}
                    </button>
                </div>
                <span>
                    Page{' '}
                    <strong>
                        {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </strong>{' '}
                </span>
            </div>
        </div>
    );
};
  
  export default TableComponent;