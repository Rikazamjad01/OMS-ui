'use client'

import { useState, useEffect } from 'react'

import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  LinearProgress,
  Chip,
  Card,
  Autocomplete,
  Snackbar,
  Alert as MuiAlert
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

import DownloadDialog from '../downloadDialogue/page'

const { RangePicker } = DatePicker

const reportTabs = [
  {
    key: 'products',
    label: 'Products',
    subs: [
      { key: 'topSelling', label: 'Top Selling' },
      { key: 'lowStock', label: 'Low Stock' }
    ]
  },
  {
    key: 'couriers',
    label: 'Couriers'
  },
  {
    key: 'city',
    label: 'City'
  },
  {
    key: 'demand-sheet',
    label: 'Demand Sheet'
  },
  {
    key: 'dispatch',
    label: 'Dispatch'
  }
]

// CSV/Excel Export
const exportToExcel = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report')
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

const exportToCSV = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  link.href = URL.createObjectURL(blob)
  link.download = `${fileName}.csv`
  link.click()
}

// PDF Export
const exportToPDF = (data, columns, fileName) => {
  const doc = new jsPDF({ orientation: 'landscape' })

  doc.text('Admin Report', 14, 10)
  const truncate = (str, maxLength = 15) => (str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str)

  const headers = columns.map(col => col.header)
  const rows = data.map(row => columns.map(col => truncate(row[col.accessorKey], 20)))

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 20,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: 'ellipsize', // show dots instead of wrapping
      lineWidth: 0.1,
      lineColor: [0, 0, 0]
    },
    headStyles: {
      fillColor: [41, 128, 185], // nice blue header
      textColor: 255,
      halign: 'center'
    }
  })

  doc.save(`${fileName}.pdf`)
}

export default function AdminReportsPage() {
  const [selectedTab, setSelectedTab] = useState('')
  const [selectedSubTab, setSelectedSubTab] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [filters, setFilters] = useState({ search: '' })
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')

  useEffect(() => {
    if (!selectedTab) return
    setLoading(true)

    setTimeout(() => {
      let apiData = []
      let cols = []

      if (selectedTab === 'products') {
        if (selectedSubTab === 'topSelling') {
          apiData = [
            { name: 'Product A', sold: 500, stock: 100 },
            { name: 'Product B', sold: 300, stock: 150 }
          ]
        }

        if (selectedSubTab === 'lowStock') {
          apiData = [
            { name: 'Product X', sold: 50, stock: 5 },
            { name: 'Product Y', sold: 30, stock: 2 }
          ]
        }

        cols = [
          { accessorKey: 'name', header: 'Product Name' },
          {
            accessorKey: 'sold',
            header: 'Units Sold',
            cell: ({ getValue }) => <Chip label={getValue()} variant='tonal' size='small' color='success' />
          },
          {
            accessorKey: 'stock',
            header: 'Stock Remaining',
            cell: ({ getValue }) => <Chip label={getValue()} variant='tonal' size='small' color='warning' />
          }
        ]
      }

      setData(apiData)
      setColumns(cols)
      setLoading(false)
    }, 500)
  }, [selectedTab, selectedSubTab])

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
              onClick={() => {
                setSelectedTab(tab.key)
                setSelectedSubTab(tab.subs?.[0]?.key || '') // auto-select first sub-tab
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>

        {/* Sub-Tabs */}
        {selectedTab && reportTabs.find(t => t.key === selectedTab)?.subs && (
          <Box mb={3} display='flex' gap={2} px={4}>
            {reportTabs
              .find(t => t.key === selectedTab)
              .subs.map(sub => (
                <Button
                  key={sub.key}
                  variant={selectedSubTab === sub.key ? 'contained' : 'outlined'}
                  onClick={() => setSelectedSubTab(sub.key)}
                >
                  {sub.label}
                </Button>
              ))}
          </Box>
        )}

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
      {selectedTab && data.length > 0 ? (
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

          const fileName = `${selectedTab}_report_${dayjs().format('YYYYMMDD')}`

          try {
            if (format === 'csv') {
              exportToCSV(data, fileName)
            } else if (format === 'excel') {
              exportToExcel(data, fileName)
            } else if (format === 'pdf') {
              exportToPDF(data, columns, fileName)
            }

            // ✅ Show success snackbar
            setSnackbarMessage(`Report downloaded successfully as ${format.toUpperCase()}`)
            setSnackbarSeverity('success')
            setSnackbarOpen(true)
          } catch (error) {
            console.error(error)
            setSnackbarMessage(`Failed to download report as ${format.toUpperCase()}`)
            setSnackbarSeverity('error')
            setSnackbarOpen(true)
          }
        }}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
          variant='filled'
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Card>
  )
}
