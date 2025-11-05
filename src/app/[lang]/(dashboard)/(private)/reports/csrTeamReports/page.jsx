'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  Chip,
  Card,
  Autocomplete,
  Snackbar,
  Alert as MuiAlert
} from '@mui/material'
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
import Meta from 'antd/es/card/Meta'
import { fetchReports, selectReports, selectReportsLoading } from '@/redux-store/slices/reports'

import DownloadDialog from '../downloadDialogue/page'

const { RangePicker } = DatePicker

// 🔹 CSR Reports Tabs
const csrReportsTabs = [
  { key: 'agentOrderReports', label: 'Agent Reports' },
  { key: 'productUnitReports', label: 'Product Unit Reports' },
  { key: 'agentChannelReports', label: 'Courier Reports' },
  { key: 'demandSheet', label: 'Demand Sheet' },
  { key: 'arrivalReport', label: 'Arrival Report' },
  { key: 'channelOrderReport', label: 'Channel Order Report' },
  { key: 'orderGenerationReport', label: 'Order Generation Report' }
]

const valueColorMap = {
  confirmed: 'success',
  completed: 'primary',
  processing: 'info',
  pending: 'warning',
  cancelled: 'secondary',
  delivered: 'primary',
  onWay: 'warning',
  returned: 'error'
}

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

  doc.text('CSR Team Report', 14, 10)

  const truncate = (str, maxLength = 15) =>
    str && str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str

  const headers = columns.map(col => col.header)

  const rows = data.map(row =>
    columns.map(col => {
      const value = row[col.accessorKey]

      if (value === null || value === undefined) return '—'
      if (typeof value === 'object')
        return Object.entries(value)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
      return truncate(String(value), 20)
    })
  )

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 20,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: 'ellipsize',
      lineWidth: 0.1,
      lineColor: [0, 0, 0]
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      halign: 'left'
    }
  })

  doc.save(`${fileName}.pdf`)
}

export default function CSRReportsPage() {
  const [selectedTab, setSelectedTab] = useState('')
  const [selectedSubTab, setSelectedSubTab] = useState('')
  const dispatch = useDispatch()
  const data = useSelector(selectReports)
  const loading = useSelector(selectReportsLoading)
  const [columns, setColumns] = useState([])
  const [filters, setFilters] = useState({})
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')

  useEffect(() => {
    const activeKey = selectedSubTab || selectedTab

    if (!activeKey) return

    const reportTypeMap = {
      agentOrderReports: 'agentOrderReport',
      productUnitReports: 'productUnitReport',
      agentChannelReports: 'agentChannelReport',
      demandSheet: 'demandSheet',
      arrivalReport: 'arrivalReport',
      channelOrderReport: 'channelOrderReport',
      orderGenerationReport: 'orderGenerationReport'
    }

    const reportType = reportTypeMap[activeKey]

    if (!reportType) return

    const dateStart = filters.startDate || ''
    const dateEnd = filters.endDate || ''
    const brand = filters.brand?.[0]?.value || ''
    const channel = filters.platform?.[0]?.value || ''

    dispatch(fetchReports({ reportType, brand, channel, dateStart, dateEnd }))
  }, [dispatch, selectedTab, selectedSubTab, filters])

  const columnNameMap = {
    noPick: 'No Pick',
    PaymentPending: 'Payment Pending',
    UnitGenerated: 'Units Generated',
    UnitConfirmed: 'Units Confirmed',
    UnitNoPick: 'Units Not Picked',
    paymentPending: 'Payment Pending',
    unitGenerated: 'Units Generated',
    unitConfirmed: 'Units Confirmed',
    unitNoPick: 'Units Not Picked',
    UnitCancel: 'Units Cancelled',
    OrdersGenerated: 'Orders Generated',
    OrdersConfirmed: 'Orders Confirmed',
    OrdersNoPick: 'Orders Not Picked',
    OrdersCancelled: 'Orders Cancelled',
    OrdersGenerated: 'Orders Generated',
    OrdersConfirmed: 'Orders Confirmed',
    OrdersNoPick: 'Orders Not Picked',
    OrderCancelled: 'Orders Cancelled',
    NoOfUnits: 'No of Units',
    ChannelName: 'Channel Name',
    ShopifyAddress: 'Shopify Address',
    NoOfOrders: 'No of Orders'
  }

  useEffect(() => {
    if (data && data.length > 0) {
      const activeKey = selectedSubTab || selectedTab

      // Determine the report key part for highlighting
      const activeReportKeyword = activeKey
        ?.replace(/([A-Z])/g, ' $1') // make camelCase readable
        ?.toLowerCase()
        ?.split(' ')[0] // e.g. "agentOrderReports" → "agent"

      const baseColumns = [
        {
          accessorKey: 'serial',
          header: 'Sr. No',
          size: 80,
          enableSorting: false,
          cell: ({ row }) => row.index + 1 // shows 1,2,3...
        }
      ]

      const dynamicCols = Object.keys(data[0])
        .filter(key => key !== '_id')
        .map(key => ({
          accessorKey: key,
          header:
            columnNameMap[key] ||
            columnNameMap[key.toLowerCase()] ||
            columnNameMap[key.charAt(0).toUpperCase() + key.slice(1)] ||
            key,
          cell: ({ getValue }) => {
            const value = getValue()

            const isHighlight = activeReportKeyword && key.toLowerCase().includes(activeReportKeyword)

            // Handle null or undefined values
            if (value === null || value === undefined) return '—'

            // Highlighted column: use chip with color
            if (isHighlight) {
              return (
                <Chip
                  label={String(value)}
                  size='small'
                  color='primary'
                  className='text-white'
                  sx={{
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}
                />
              )
            }

            // Normal columns: plain readable text
            if (Array.isArray(value)) return value.join(', ')
            if (typeof value === 'object')
              return Object.entries(value)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')
            return String(value)
          }
        }))

      dynamicCols.sort((a, b) => a.header.localeCompare(b.header))

      setColumns([...baseColumns, ...dynamicCols])
    } else {
      setColumns([])
    }
  }, [data, selectedTab, selectedSubTab])

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
          CSR Team Reports
        </Typography>

        {/* Tabs */}
        <Box mb={3} display='flex' gap={2} px={4} flexWrap='wrap'>
          {csrReportsTabs.map(tab => (
            <Button
              key={tab.key}
              variant={selectedTab === tab.key ? 'contained' : 'outlined'}
              onClick={() => {
                setSelectedTab(tab.key)
                setSelectedSubTab('')
              }}
              className={`${selectedTab === tab.key ? 'bg-primary text-white' : 'bg-white text-primary'}`}
            >
              {tab.label}
            </Button>
          ))}
        </Box>

        {selectedTab && csrReportsTabs.find(t => t.key === selectedTab)?.subReports && (
          <Box mb={2} display='flex' gap={2} px={4} flexWrap='wrap'>
            {csrReportsTabs
              .find(t => t.key === selectedTab)
              ?.subReports.map(sub => (
                <Button
                  key={sub.key}
                  variant={selectedSubTab === sub.key ? 'contained' : 'outlined'}
                  onClick={() => setSelectedSubTab(sub.key)}
                  className={`${selectedTab === tab.key ? 'bg-primary text-white' : 'bg-white text-primary'}`}
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

            <Box className='flex gap-4 mb-4 flex-wrap'>
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
                  { label: 'Whatsapp', value: 'whatsapp' }
                ]}
                getOptionLabel={option => option.label}
                value={filters.platform || []}
                onChange={(e, newValue) => setFilters(prev => ({ ...prev, platform: newValue }))}
                renderInput={params => <TextField {...params} label='Platform' size='small' />}
              />

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
                renderInput={params => <TextField {...params} label='Brand' size='small' />}
              />

              {/* <Autocomplete
                multiple
                fullWidth
                className='flex flex-1'
                options={[
                  { label: 'TCS', value: 'tcs' },
                  { label: 'PostEx', value: 'postex' },
                  { label: 'Leopard', value: 'leopard' },
                  { label: 'M&P', value: 'mnp' },
                  { label: 'FedEx', value: 'fedex' }
                ]}
                getOptionLabel={option => option.label}
                value={filters.courier || []}
                onChange={(e, newValue) => setFilters(prev => ({ ...prev, courier: newValue }))}
                renderInput={params => <TextField {...params} label='Courier' size='small' />}
              /> */}
            </Box>

            <Box className='flex gap-4 w-full items-center justify-end'>
              <Button variant='outlined' color='error' onClick={() => setFilters({})}>
                Reset Filters
              </Button>
              <Button variant='contained' className='text-white' onClick={() => console.log('Apply Filters:', filters)}>
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
                    <tr key={hg.id} className='max-w-[250px]'>
                      {hg.headers.map(h => (
                        <th
                          key={h.id}
                          className={classNames(
                            'px-4 py-2 border-b text-left font-medium text-white bg-primary whitespace-nowrap',
                            { 'cursor-pointer select-none capitalize': h.column.getCanSort?.() }
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
                          <td key={cell.id} className='px-4 py-2 border-b border-x text-gray-800 '>
                            {/* serial number */}
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
            Please select a report tab above to view data. <i className='bx bx-arrow-to-top ' />
          </Typography>
        )}
      </Box>
      {selectedTab && data.length > 0 ? (
        <div className='p-4 flex justify-end'>
          <Button
            variant='contained'
            color='primary'
            className='text-white'
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
