'use client'

import { useState, useEffect } from 'react'

import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  TextField,
  LinearProgress,
  Chip,
  Card,
  Autocomplete
} from '@mui/material'
import classnames from 'classnames'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender
} from '@tanstack/react-table'

import { DatePicker, Space } from 'antd'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

const reportTabs = [
  { key: 'agents', label: 'Agents' },
  { key: 'cities', label: 'Cities' },
  { key: 'products', label: 'Products' },
  { key: 'discounts', label: 'Discounts' },
  { key: 'returns', label: 'Returns' }
]

export default function AdminReportsPage() {
  const [selectedTab, setSelectedTab] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [filters, setFilters] = useState({ search: '' })

  useEffect(() => {
    if (!selectedTab) return
    setLoading(true)

    setTimeout(() => {
      let apiData = []

      if (selectedTab === 'agents') {
        apiData = [
          {
            name: 'Ali',
            total: 50,
            confirmed: 30,
            assigned: 10,
            noPick: 5,
            cancelled: 5,
            progress: 60
          },
          {
            name: 'Sara',
            total: 40,
            confirmed: 20,
            assigned: 15,
            noPick: 2,
            cancelled: 3,
            progress: 80
          }
        ]
      }

      if (selectedTab === 'agents') {
        setColumns([
          { accessorKey: 'name', header: 'Name' },
          {
            accessorKey: 'total',
            header: 'Total',
            cell: ({ getValue }) => <Chip label={getValue()} color='success' size='small' />
          },
          {
            accessorKey: 'confirmed',
            header: 'Confirmed',
            cell: ({ getValue }) => <Chip label={getValue()} color='success' size='small' />
          },
          {
            accessorKey: 'assigned',
            header: 'Assigned',
            cell: ({ getValue }) => <Chip label={getValue()} color='info' size='small' />
          },
          {
            accessorKey: 'noPick',
            header: 'No Pick',
            cell: ({ getValue }) => <Chip label={getValue()} color='warning' size='small' />
          },
          {
            accessorKey: 'cancelled',
            header: 'Cancelled',
            cell: ({ getValue }) => <Chip label={getValue()} color='error' size='small' />
          },
          {
            accessorKey: 'progress',
            header: 'Progress',
            cell: ({ getValue }) => (
              <Box display='flex' alignItems='center' gap={1} minWidth={120}>
                <LinearProgress
                  variant='determinate'
                  value={getValue()}
                  sx={{ flexGrow: 1, height: 8, borderRadius: 5 }}
                  color={getValue() > 70 ? 'success' : 'warning'}
                />
                <Typography variant='body2' color='text.secondary'>
                  {getValue()}%
                </Typography>
              </Box>
            )
          }
        ])
      }

      setData(apiData)
      setLoading(false)
    })
  }, [selectedTab])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  })

  return (
    <Card>
      <Box>
        <Typography variant='h4' gutterBottom className='p-4'>
          Admin Reports
        </Typography>

        {/* Tabs as buttons */}
        <Box mb={3} display='flex' gap={2} px={4}>
          {reportTabs.map(tab => (
            <Button
              key={tab.key}
              variant={selectedTab === tab.key ? 'contained' : 'outlined'}
              onClick={() => setSelectedTab(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </Box>

        {/* Filters Section */}
        {selectedTab && (
          <div className='p-4'>
            <Typography variant='h6' gutterBottom>
              Filters
            </Typography>
            <div className='flex gap-4 mb-4'>
              {/* Date Range */}
              <RangePicker
                status='success'
                className='flex flex-1'
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
              />
              {/* Platform */}
              <Autocomplete
                multiple
                fullWidth
                options={[
                  { label: 'Shopify', value: 'shopify' },
                  { label: 'Whatsapp', value: 'whatsapp' },
                  { label: 'Manual', value: 'manual' }
                ]}
                className='flex flex-1'
                getOptionLabel={option => option.label}
                value={filters.platform || []}
                onChange={(e, newValue) => setFilters(prev => ({ ...prev, platform: newValue }))}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const props = getTagProps({ index })

                    return <Chip {...props} key={option.value || index} variant='outlined' label={option.label} />
                  })
                }
                renderInput={params => (
                  <TextField {...params} label='Platform' size='small' placeholder='Select Platform' />
                )}
              />

              {/* Brand */}
              <Autocomplete
                multiple
                fullWidth
                className='flex flex-1'
                options={[
                  { label: 'Brand A', value: 'brandA' },
                  { label: 'Brand B', value: 'brandB' },
                  { label: 'Brand C', value: 'brandC' }
                ]}
                getOptionLabel={option => option.label}
                value={filters.brand || []}
                onChange={(e, newValue) => setFilters(prev => ({ ...prev, brand: newValue }))}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const props = getTagProps({ index })

                    return <Chip {...props} key={option.value || index} variant='outlined' label={option.label} />
                  })
                }
                renderInput={params => <TextField {...params} label='Brand' size='small' placeholder='Select Brand' />}
              />

              {/* Comparison */}
              <Autocomplete
                multiple
                fullWidth
                className='flex flex-1'
                options={[
                  { label: 'By Month', value: 'month' },
                  { label: 'By Quarter', value: 'quarter' },
                  { label: 'By Year', value: 'year' }
                ]}
                getOptionLabel={option => option.label}
                value={filters.comparison || []}
                onChange={(e, newValue) => setFilters(prev => ({ ...prev, comparison: newValue }))}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const props = getTagProps({ index })

                    return <Chip {...props} key={option.value || index} variant='outlined' label={option.label} />
                  })
                }
                renderInput={params => (
                  <TextField {...params} label='Comparison' size='small' placeholder='Select Comparison' />
                )}
              />
            </div>
            <div className='flex gap-4 w-full items-center justify-end'>
              <Button variant='outlined' color='error' onClick={() => setFilters({})}>
                Reset Filters
              </Button>
              <Button variant='contained' onClick={() => console.log('Apply Filters:', filters)}>
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {/* Table Section */}
        {selectedTab ? (
          <Box position='relative'>
            <div className='overflow-x-auto my-5'>
              <table className='min-w-full border-collapse'>
                <thead className='border-y'>
                  {table.getHeaderGroups().map(hg => (
                    <tr key={hg.id}>
                      {hg.headers.map(h => (
                        <th key={h.id} className='px-4 py-2 border-b text-left font-medium text-gray-700'>
                          {flexRender(h.column.columnDef.header, h.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {data.length > 0 ? (
                    table.getRowModel().rows.map(row => (
                      <tr key={row.id} className='hover:bg-gray-50'>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className='px-4 py-2 border-b text-gray-800'>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className='text-center py-4'>
                        No data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {loading && (
              <Box
                position='absolute'
                top={0}
                left={0}
                right={0}
                bottom={0}
                display='flex'
                justifyContent='center'
                alignItems='center'
                bgcolor='rgba(255,255,255,0.6)'
                zIndex={2}
              >
                <CircularProgress />
              </Box>
            )}
          </Box>
        ) : (
          <Typography color='text.secondary' className='p-4 text-red-500 flex items-center'>
            Please select a report tab above to view data.
            <i className='bx bx-arrow-to-top' />
          </Typography>
        )}
      </Box>
    </Card>
  )
}
