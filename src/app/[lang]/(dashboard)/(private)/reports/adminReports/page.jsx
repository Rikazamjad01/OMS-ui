'use client'
import { useState, useEffect } from 'react'

import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'

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

import DownloadDialog from '../downloadDialogue/page'

const { RangePicker } = DatePicker

const reportTabs = [
  {
    key: 'agents',
    label: 'Agents',
    subs: [
      { key: 'activeAgents', label: 'Active Agents' },
      { key: 'inactiveAgents', label: 'Inactive Agents' }
    ]
  },
  { key: 'cities', label: 'Cities' }, // no subs
  {
    key: 'products',
    label: 'Products',
    subs: [
      { key: 'topSelling', label: 'Top Selling' },
      { key: 'lowStock', label: 'Low Stock' }
    ]
  },
  { key: 'discounts', label: 'Discounts' },
  { key: 'returns', label: 'Returns' }
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
  const doc = new jsPDF()

  doc.text('Admin Report', 14, 10)

  const headers = columns.map(col => col.header)
  const rows = data.map(row => columns.map(col => row[col.accessorKey]))

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 20
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

      // --- Demo API data (replace with your real API) ---
      if (selectedTab === 'agents' && selectedSubTab === 'activeAgents') {
        apiData = [
          { name: 'Ali', total: 50, confirmed: 30, assigned: 10 },
          { name: 'Sara', total: 40, confirmed: 20, assigned: 15 }
        ]
      } else if (selectedTab === 'cities') {
        apiData = [
          { city: 'Lahore', orders: 120, revenue: 56000 },
          { city: 'Karachi', orders: 200, revenue: 89000 }
        ]
      }

      // -------------------------------------------------

      // 🎨 Available chip colors
      const chipColors = ['primary', 'secondary', 'success', 'error', 'warning', 'info', 'default']

      // 🎨 Mapping to keep consistent random colors per unique value
      const valueColorMap = {}

      const getColorForValue = value => {
        if (!valueColorMap[value]) {
          const newColor = chipColors[Math.floor(Math.random() * chipColors.length)]

          valueColorMap[value] = newColor
        }

        return valueColorMap[value]
      }

      // 🔄 Dynamic columns
      const dynamicCols = Object.keys(apiData[0] || {}).map(key => ({
        accessorKey: key,
        header: key.charAt(0).toUpperCase() + key.slice(1),
        cell: ({ getValue }) => {
          const value = getValue()

          return <Chip label={value} size='small' variant='tonal' color={getColorForValue(value)} />
        }
      }))

      setData(apiData)
      setColumns(dynamicCols)
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
          Admin Reports
        </Typography>

        {/* Tabs as buttons */}
        <Box mb={4} display='flex' gap={2} px={4}>
          {reportTabs.map(tab => (
            <Button
              key={tab.key}
              variant={selectedTab === tab.key ? 'contained' : 'outlined'}
              onClick={() => {
                setSelectedTab(tab.key)
                setSelectedSubTab(tab.subs?.[0]?.key || '') // default to first sub if exists
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>

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
                  { label: 'Sukoon Wellness', value: 'sukoon' },
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
