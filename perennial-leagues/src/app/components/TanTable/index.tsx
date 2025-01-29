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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: ColumnDef<T, any>[];
    data: T[];
    title: string;
    initialState?: InitialTableState;
}

const TableComponent = <T,>({ columns, data, title, initialState }: TableComponentProps<T>) => {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [, setSorting] = useState<SortingState>([]);

    const table = useReactTable({
        data,
        columns,
        state: { pagination },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: initialState as InitialTableState | undefined,
    });

    return (
        <div className="card bg-system rounded-lg shadow-md flex flex-col items-center p-4 hover:bg-system-300 transition cursor-pointer">
            <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                                            asc: ' 🔼',
                                                            desc: ' 🔽',
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
                                <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
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
                </button>{' '}
                <span>
                    Page{' '}
                    <strong>
                        {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </strong>{' '}
                </span>
                <span>
                    | Go to page:{' '}
                    <input
                        type="number"
                        defaultValue={table.getState().pagination.pageIndex + 1}
                        onChange={e => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0;
                            table.setPageIndex(page);
                        }}
                        style={{ width: '100px' }}
                    />
                </span>{' '}
                <select
                    value={table.getState().pagination.pageSize}
                    onChange={e => {
                        table.setPageSize(Number(e.target.value));
                    }}
                >
                    {[10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};
  
  export default TableComponent;