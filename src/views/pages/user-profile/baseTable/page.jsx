'use client'

import { useState } from 'react'

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender
} from '@tanstack/react-table'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import classnames from 'classnames'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@/components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'

// Reusable Debounced Input
const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useState(() => setValue(initialValue), [initialValue])

  useState(() => {
    const timeout = setTimeout(() => onChange(value), debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

export default function BaseTable({ title, data, columns }) {
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 7 } }
  })

  return (
    <Card>
      <CardHeader title={title} />
      {/* Filters */}
      <div className='flex max-sm:flex-col items-center justify-between p-6 gap-4'>
        <CustomTextField
          select
          value={table.getState().pagination.pageSize}
          onChange={e => table.setPageSize(Number(e.target.value))}
          className='is-full sm:is-[70px]'
        >
          <MenuItem value='5'>5</MenuItem>
          <MenuItem value='7'>7</MenuItem>
          <MenuItem value='10'>10</MenuItem>
        </CustomTextField>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={val => setGlobalFilter(String(val))}
          placeholder='Search...'
        />
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={table.getFilteredRowModel().rows.length || 0}
        rowsPerPage={table.getState().pagination.pageSize || 0}
        page={table.getState().pagination.pageIndex || 0}
        onPageChange={(_, page) => table.setPageIndex(page) || 0}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value)) || 0}
      />
    </Card>
  )
}
