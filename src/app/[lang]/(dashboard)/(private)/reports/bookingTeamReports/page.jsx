'use client'

import { useState, useEffect } from 'react'

import {
  Box,
  Typography,
  Button,
  CircularProgress,
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
import { DatePicker } from 'antd'
import dayjs from 'dayjs'
import classNames from 'classnames'

import DownloadDialog from '../downloadDialogue/page'

const { RangePicker } = DatePicker

const reportTabs = [
  { key: 'products', label: 'Products' },
  { key: 'couriers', label: 'Couriers' },
  { key: 'city', label: 'City' },
  { key: 'demand-sheet', label: 'Demand Sheet' },
  { key: 'dispatch', label: 'Dispatch' }
]

export default function AdminReportsPage() {
  const [selectedTab, setSelectedTab] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [filters, setFilters] = useState({ search: '' })
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)

  useEffect(() => {
    if (!selectedTab) return
    setLoading(true)

    setTimeout(() => {
      let apiData = []

      if (selectedTab === 'products') {
        apiData = [
          {
            name: 'Ali',
            date: '2025-09-20',
            amount: 2000,
            unit: 'Box',
            status: 'Shipped',
            dispatch_date: '2025-09-22',
            last_process_working_date: '2025-09-21',
            origin: 'Faisalabad',
            destination: 'Lahore',
            address: '123 Street, Lahore',
            contact: '0300-1234567',
            tracking_number: 'TRK123',
            email: 'ali@example.com',
            courier: 'TCS'
          },
          {
            name: 'Sara',
            date: '2025-09-21',
            amount: 1500,
            unit: 'Carton',
            status: 'Pending',
            dispatch_date: '2025-09-23',
            last_process_working_date: '2025-09-22',
            origin: 'Karachi',
            destination: 'Islamabad',
            address: '456 Avenue, Islamabad',
            contact: '0301-9876543',
            tracking_number: 'TRK456',
            email: 'sara@example.com',
            courier: 'Leopard'
          }
        ]

        setColumns([
          { accessorKey: 'date', header: 'Booking Date' },
          {
            accessorKey: 'amount',
            header: 'Amount',
            cell: ({ getValue }) => <Chip label={getValue()} variant='tonal' size='small' color='success' />
          },
          {
            accessorKey: 'unit',
            header: 'Unit',
            cell: ({ getValue }) => <Chip label={getValue()} variant='tonal' size='small' color='info' />
          },
          {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ getValue }) => <Chip label={getValue()} variant='tonal' size='small' color='warning' />
          },
          {
            accessorKey: 'dispatch_date',
            header: 'Dispatch Date',
            cell: ({ getValue }) => <Chip label={getValue()} variant='tonal' size='small' color='info' />
          },
          {
            accessorKey: 'last_process_working_date',
            header: 'Last Process Working Date',
            cell: ({ getValue }) => <Chip label={getValue()} variant='tonal' size='small' color='error' />
          },
          {
            accessorKey: 'origin',
            header: 'Origin',
            cell: ({ getValue }) => <Chip label={getValue()} variant='tonal' size='small' color='success' />
          },
          {
            accessorKey: 'destination',
            header: 'Destination',
            cell: ({ getValue }) => <Chip label={getValue()} variant='tonal' size='small' color='info' />
          },
          {
            accessorKey: 'address',
            header: 'Address',
            cell: ({ getValue }) => <Chip label={getValue()} variant='tonal' size='small' />
          },
          {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ getValue }) => <Chip label={getValue()} variant='tonal' size='small' />
          },
          {
            accessorKey: 'contact',
            header: 'Contact',
            cell: ({ getValue }) => <Chip label={getValue()} variant='tonal' size='small' />
          },
          {
            accessorKey: 'tracking_number',
            header: 'Tracking Number',
            cell: ({ getValue }) => <Chip label={getValue()} variant='tonal' size='small' />
          },
          {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ getValue }) => <Chip label={getValue()} variant='tonal' size='small' />
          },
          {
            accessorKey: 'courier',
            header: 'Courier',
            cell: ({ getValue }) => <Chip label={getValue()} variant='tonal' size='small' />
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
          Booking Team Reports
        </Typography>

        {/* Tabs */}
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

        {/* Filters */}
        {selectedTab && (
          <Box className='p-4'>
            <Typography variant='h6' gutterBottom>
              Filters
            </Typography>

            <Box className='flex gap-4 mb-4'>
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
                    setFilters(prev => ({ ...prev, startDate: '', endDate: '' }))
                  }
                }}
              />

              {/* Platform */}
              <Autocomplete
                multiple
                fullWidth
                className='flex flex-1'
                options={[
                  { label: 'Shopify', value: 'shopify' },
                  { label: 'Whatsapp', value: 'whatsapp' },
                  { label: 'Manual', value: 'manual' }
                ]}
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
                  { label: 'Sukoon Wellness', value: 'Sukoon' },
                  { label: 'Glorify', value: 'glorify' }
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
            </Box>

            <Box className='flex gap-4 w-full items-center justify-end'>
              <Button variant='outlined' color='error' onClick={() => setFilters({})}>
                Reset Filters
              </Button>
              <Button variant='contained' onClick={() => console.log('Apply Filters:', filters)}>
                Apply Filters
              </Button>
            </Box>
          </Box>
        )}

        {/* Table */}
        {selectedTab ? (
          <Box position='relative'>
            <div className='overflow-x-auto my-5'>
              <table className='min-w-full border-collapse'>
                <thead className='border-y'>
                  {table.getHeaderGroups().map(hg => (
                    <tr key={hg.id}>
                      {hg.headers.map(h => (
                        <th
                          key={h.id}
                          className={classnames(
                            'px-4 py-2 border-b text-left font-medium text-gray-700 whitespace-nowrap',
                            {
                              'cursor-pointer select-none': h.column.getCanSort?.()
                            }
                          )}
                          onClick={h.column.getToggleSortingHandler?.()}
                        >
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
      {selectedTab ? (
        <div className='p-4 flex justify-end'>
          <Button
            variant='contained'
            color='primary'
            onClick={() => setDownloadDialogOpen(true)} // <-- open modal
          >
            Download Report
          </Button>
        </div>
      ) : null}

      <DownloadDialog
        open={downloadDialogOpen}
        onClose={() => setDownloadDialogOpen(false)}
        onConfirm={format => {
          console.log('User selected format:', format)

          // 🔽 Here you implement actual export logic:
          // - CSV: convert JSON to CSV
          // - PDF: use jsPDF or pdfmake
          // - Excel: use SheetJS (xlsx)
        }}
      />
    </Card>
  )
}
