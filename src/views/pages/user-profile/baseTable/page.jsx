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

import { DatePicker, Space } from 'antd'
import { Autocomplete, Button, Chip, DialogActions, TextField } from '@mui/material'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@/components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'

const { RangePicker } = DatePicker

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

export const platforms = {
  shopify: { text: 'Shopify', color: 'success', colorClassName: 'text-success' },
  whatsapp: { text: 'Whatsapp', color: 'secondary', colorClassName: 'text-secondary' }

  // socialMedia: { text: 'Social Media', color: 'info', colorClassName: 'text-info' }
}

const orderPlatformArray = Object.keys(platforms).map(key => ({
  value: key,
  label: platforms[key].text
}))

export default function BaseTable({ title, data, columns, extraFilters }) {
  const [globalFilter, setGlobalFilter] = useState('')

  const [filters, setFilters] = useState({
    platform: [],
    startDate: '',
    endDate: ''
  })

  const emptyFilters = {
    startDate: '',
    endDate: '',
    platform: []
  }

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } }
  })

  return (
    <Card>
      <CardHeader title={title} />
      {/* Filters */}
      <div className='flex max-sm:flex-col items-center justify-between p-4 gap-4'>
        <div className={classnames('flex items-center gap-2', { 'is-full': !title })}>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={val => setGlobalFilter(String(val))}
            placeholder='Search...'
          />
        </div>
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
      </div>

      <form className='flex flex-col justify-between p-4 gap-4'>
        <div className='flex flex-wrap items-center gap-4 w-full'>
          <RangePicker
            status='success'
            value={filters.startDate && filters.endDate ? [dayjs(filters.startDate), dayjs(filters.endDate)] : null}
            onChange={dates => {
              if (dates && dates.length === 2) {
                setFilters(prev => ({
                  ...prev,
                  startDate: dates[0].format('YYYY-MM-DD'),
                  endDate: dates[1].format('YYYY-MM-DD')
                }))
              } else {
                setFilters(prev => ({
                  ...prev,
                  startDate: '',
                  endDate: ''
                }))
              }
            }}
            className='flex w-1/5 py-4'
          />
          <Autocomplete
            multiple
            fullWidth
            className='w-1/5'
            options={orderPlatformArray}
            getOptionLabel={option => option.label}
            value={filters.platform || []}
            onChange={(e, newValue) => setFilters(prev => ({ ...prev, platform: newValue }))}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const props = getTagProps({ index })

                return (
                  <Chip
                    {...props}
                    key={option.value || index} // override key
                    variant='outlined'
                    label={option.label}
                  />
                )
              })
            }
            renderInput={params => (
              <TextField {...params} fullWidth placeholder='Order Platform' label='Order Platform' size='medium' />
            )}
          />
          {extraFilters}
        </div>
        <div className='flex w-full justify-end gap-4'>
          <DialogActions className='flex px-1 py-0'>
            <div className='flex'>
              <Button
                onClick={() => {
                  setFilters(emptyFilters)
                  dispatch(fetchOrders({ page: 1, limit, filters: emptyFilters }))
                  onFiltersChange?.(emptyFilters)

                  // onPageChange?.(1)
                }}
                color='error'
                variant='tonal'
              >
                Reset Filters
              </Button>
              <Button
                onClick={() => {
                  const apiFilters = mapFiltersToApiFormat(filters)

                  dispatch(fetchOrders({ page: 1, limit, filters: apiFilters }))
                  onFiltersChange?.(apiFilters)

                  onPageChange?.(1)
                }}
                variant='contained'
              >
                Apply Filters
              </Button>
            </div>
          </DialogActions>
        </div>

      </form>

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
