'use client'

import { useState, useEffect, useMemo } from 'react'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import {
  Autocomplete,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Snackbar,
  TextField,
  Typography,
  Alert as MuiAlert
} from '@mui/material'
import { useSelector, useDispatch } from 'react-redux'
import { DatePicker } from 'antd'
import dayjs from 'dayjs'
import classNames from 'classnames'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'

import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import DownloadDialog from '@/app/[lang]/(dashboard)/(private)/reports/downloadDialogue/page'
import {
  selectCouriers,
  selectCouriersLoading,
  fetchCouriers,
  selectActiveCouriers
} from '@/redux-store/slices/couriers'

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

const exportToPDF = (sections, fileName) => {
  const doc = new jsPDF({ orientation: 'landscape' })

  doc.text('CSR Team Report', 14, 10)

  let startY = 25

  Object.entries(sections).forEach(([sectionName, { data, columns }]) => {
    doc.text(sectionName, 14, startY - 5)
    const headers = columns.map(col => col.header)

    const rows = data.map(row =>
      columns.map(col => {
        const value = row[col.accessorKey]

        return value === undefined || value === null ? '—' : String(value)
      })
    )

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { bottom: 10 }
    })

    startY = doc.lastAutoTable.finalY + 15
  })

  doc.save(`${fileName}.pdf`)
}

const LedgersPage = () => {
  const dispatch = useDispatch()
  const allCouriers = useSelector(selectCouriers)
  const loading = useSelector(selectCouriersLoading)

  const activeCouriers = useSelector(selectActiveCouriers)?.map(courier => ({
    label: courier.name,
    value: courier.id,
    id: courier.id
  }))

  const [tabValue, setTabValue] = useState(0)
  const [filters, setFilters] = useState({})
  const { RangePicker } = DatePicker
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const [hasChanges, setHasChanges] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    dispatch(fetchCouriers())
  }, [dispatch])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const courierLedgers = useMemo(
    () => ({
      Daewoo: {
        main: [
          {
            id: 1,
            totalShipments: 150,
            successfulDeliveries: 140,
            successfulDeliveriesAmount: 70000,
            damagedParcels: 2,
            damagedParcelsAmount: 1000,
            adjustmentsAmount: 1500,
            finalAmount: 85000,
            date: '2024-09-01'
          }
        ],
        parcelDetails: [
          { id: 1, totalParcels: 5, parcelName: 'Box A', status: 'Delivered', amount: 5000, charges: 200 },
          { id: 2, totalParcels: 3, parcelName: 'Box B', status: 'Pending', amount: 3000, charges: 150 }
        ],
        previousParcels: [{ id: 1, parcelName: 'PrevBox1', totalParcels: 2, status: 'Delivered', amount: 2000 }],
        damagedParcels: [{ id: 1, parcelName: 'DamagedBox1', totalParcels: 1, amount: 500 }]
      }
    }),
    []
  )

  const selectedCourier = useMemo(() => {
    if (allCouriers.length > 0 && allCouriers[tabValue]) return allCouriers[tabValue].name || allCouriers[tabValue]
    return ''
  }, [allCouriers, tabValue])

  const [editableData, setEditableData] = useState([])
  const [parcelDetails, setParcelDetails] = useState([])
  const [previousParcels, setPreviousParcels] = useState([])
  const [damagedParcels, setDamagedParcels] = useState([])

  useEffect(() => {
    const data = courierLedgers[selectedCourier] || {}

    setEditableData(structuredClone(data.main || []))
    setParcelDetails(structuredClone(data.parcelDetails || []))
    setPreviousParcels(structuredClone(data.previousParcels || []))
    setDamagedParcels(structuredClone(data.damagedParcels || []))
    setIsEditing(false)
  }, [selectedCourier, courierLedgers])

  const mainColumns = useMemo(
    () => [
      { header: 'Date', accessorKey: 'date' },
      { header: 'Total Shipments', accessorKey: 'totalShipments' },
      { header: 'Successful Deliveries', accessorKey: 'successfulDeliveries' },
      { header: 'COD Collected', accessorKey: 'successfulDeliveriesAmount' },
      {
        header: 'Damaged Parcels',
        accessorKey: 'damagedParcels',
        id: 'damagedParcels',
        cell: ({ row }) => {
          const editableRow = editableData.find(r => r.id === row.original.id)
          const value = editableRow?.damagedParcels ?? 0

          return isEditing ? (
            <TextField
              size='small'
              type='number'
              inputProps={{ min: 0 }}
              value={value === '' ? '' : value}
              onChange={e => {
                const raw = Number(e.target.value) || 0

                const updatedRows = editableData.map(r => {
                  if (r.id === row.original.id) {
                    return {
                      ...r,
                      damagedParcels: raw,
                      finalAmount:
                        (r.successfulDeliveriesAmount || 0) - (r.damagedParcelsAmount || 0) - (r.adjustmentsAmount || 0)
                    }
                  }

                  return r
                })

                setEditableData(updatedRows)
                setHasChanges(true)
              }}
            />
          ) : (
            <Typography color='text.primary'>{value.toLocaleString()}</Typography>
          )
        }
      },
      {
        header: 'Damaged Amount',
        accessorKey: 'damagedParcelsAmount',
        id: 'damagedParcelsAmount',
        cell: ({ row }) => {
          const editableRow = editableData.find(r => r.id === row.original.id)
          const value = editableRow?.damagedParcelsAmount ?? 0

          return isEditing ? (
            <TextField
              size='small'
              type='number'
              inputProps={{ min: 0 }}
              value={value === '' ? '' : value}
              onChange={e => {
                const raw = Number(e.target.value) || 0

                const updatedRows = editableData.map(r => {
                  if (r.id === row.original.id) {
                    return {
                      ...r,
                      damagedParcelsAmount: raw,
                      finalAmount: (r.successfulDeliveriesAmount || 0) - raw - (r.adjustmentsAmount || 0)
                    }
                  }

                  return r
                })

                setEditableData(updatedRows)
                setHasChanges(true)
              }}
            />
          ) : (
            <Typography color='text.primary'>{value.toLocaleString()}</Typography>
          )
        }
      },
      {
        header: 'Adjustments (Amount)',
        accessorKey: 'adjustmentsAmount',
        id: 'adjustmentsAmount',
        cell: ({ row }) => {
          const editableRow = editableData.find(r => r.id === row.original.id)
          const value = editableRow?.adjustmentsAmount ?? 0

          return isEditing ? (
            <TextField
              size='small'
              type='number'
              inputProps={{ min: 0 }}
              value={value === '' ? '' : value}
              onChange={e => {
                const raw = Number(e.target.value) || 0

                const updatedRows = editableData.map(r => {
                  if (r.id === row.original.id) {
                    return {
                      ...r,
                      adjustmentsAmount: raw,
                      finalAmount: (r.successfulDeliveriesAmount || 0) - (r.damagedParcelsAmount || 0) - raw
                    }
                  }

                  return r
                })

                setEditableData(updatedRows)
                setHasChanges(true)
              }}
            />
          ) : (
            <Typography color='text.primary'>{value.toLocaleString()}</Typography>
          )
        }
      },
      {
        header: 'Final Amount',
        accessorKey: 'finalAmount',
        id: 'finalAmount',
        cell: ({ row }) => {
          const r = row.original

          const final = (r.successfulDeliveriesAmount || 0) - (r.damagedParcelsAmount || 0) - (r.adjustmentsAmount || 0)

          return <Typography color='text.primary'>{final.toLocaleString()}</Typography>
        }
      }
    ],
    [isEditing, editableData]
  )

  const parcelColumns = [
    { header: 'Total Parcels', accessorKey: 'totalParcels' },
    { header: 'Parcel Name', accessorKey: 'parcelName' },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Amount', accessorKey: 'amount' },
    { header: 'Charges', accessorKey: 'charges' }
  ]

  const prevColumns = [
    { header: 'Total Parcels', accessorKey: 'totalParcels' },
    { header: 'Parcel Name', accessorKey: 'parcelName' },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Amount', accessorKey: 'amount' },
    { header: 'Charges', accessorKey: 'charges' }
  ]

  const dmgColumns = [
    { header: 'Total Parcels', accessorKey: 'totalParcels' },
    { header: 'Parcel Name', accessorKey: 'parcelName' },
    { header: 'Amount', accessorKey: 'amount' },
    { header: 'Charges', accessorKey: 'charges' }
  ]

  const table = useReactTable({ data: editableData, columns: mainColumns, getCoreRowModel: getCoreRowModel() })

  return (
    <Paper elevation={0} sx={{ width: '100%' }}>
      <Box sx={{ p: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant='scrollable' scrollButtons='auto'>
          {allCouriers.length > 0 ? (
            allCouriers.map((courier, index) => <Tab key={courier.id || index} label={courier.name || courier} />)
          ) : (
            <Tab disabled label='No couriers found' />
          )}
        </Tabs>
      </Box>

      <Box className='w-full'>
        <Box className='flex gap-4 mb-4 justify-between' sx={{ p: 4 }}>
          <RangePicker
            status='success'
            value={filters.startDate && filters.endDate ? [dayjs(filters.startDate), dayjs(filters.endDate)] : null}
            onChange={dates => {
              if (dates && dates.length === 2)
                setFilters(prev => ({
                  ...prev,
                  startDate: dates[0].format('YYYY-MM-DD'),
                  endDate: dates[1].format('YYYY-MM-DD')
                }))
              else setFilters(prev => ({ ...prev, startDate: '', endDate: '' }))
            }}
            className='w-1/4 py-2'
          />
          <div className='flex justify-end gap-5'>
            <Button variant='outlined' color='error' onClick={() => setFilters({})}>
              Reset Filters
            </Button>
            <Button variant='contained' className='text-white' onClick={() => console.log('Apply Filters:', filters)}>
              Apply Filters
            </Button>
            {selectedCourier && editableData.length > 0 && (
              <>
                <Button
                  variant='contained'
                  color='primary'
                  className='text-white'
                  onClick={() => setDownloadDialogOpen(true)}
                >
                  Download Report
                </Button>
                <Button
                  variant='outlined'
                  color={isEditing ? 'success' : 'primary'}
                  onClick={() => {
                    if (isEditing) {
                      // Save changes action
                      setSnackbarMessage('Changes saved successfully!')
                      setSnackbarSeverity('success')
                      setSnackbarOpen(true)
                      setHasChanges(false)
                      setIsEditing(false)
                    } else {
                      setIsEditing(true)
                    }
                  }}
                >
                  {isEditing ? 'Save Changes' : 'Edit'}
                </Button>
              </>
            )}
          </div>
        </Box>

        {mainColumns.length > 0 && (
          <div className='w-full overflow-x-scroll no-scrollbar'>
            <Typography variant='h6' className='mt-4 mb-2 px-4 font-bold'>
              Ledger Details
            </Typography>
            <table className='w-full mb-6 border-collapse'>
              <thead>
                <tr className='w-full'>
                  {mainColumns.map(col => (
                    <th key={col.header} className='p-4 font-medium text-start border-y uppercase text-nowrap'>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className='p-4 border-y text-nowrap'>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {parcelColumns.length > 0 && (
          <div className='w-full overflow-x-scroll no-scrollbar'>
            <Typography variant='h6' className='mt-4 mb-2 px-4 font-bold'>
              Details of Parcels
            </Typography>
            <table className='min-w-full mb-6 border-collapse'>
              <thead>
                <tr>
                  {parcelColumns.map(col => (
                    <th key={col.header} className='p-4 font-medium text-start border-y uppercase text-nowrap'>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parcelDetails.map((row, idx) => (
                  <tr key={idx}>
                    {parcelColumns.map(col => (
                      <td key={col.accessorKey} className='p-4 border-y text-nowrap'>
                        {row[col.accessorKey]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {prevColumns.length > 0 && (
          <div className='w-full overflow-x-scroll no-scrollbar'>
            <Typography variant='h6' className='mt-4 mb-2 px-4 font-bold'>
              Previous Parcels
            </Typography>
            <table className='min-w-full mb-6 border-collapse'>
              <thead>
                <tr>
                  {prevColumns.map(col => (
                    <th key={col.header} className='p-4 font-medium text-start border-y uppercase text-nowrap'>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previousParcels.map((row, idx) => (
                  <tr key={idx}>
                    {prevColumns.map(col => (
                      <td key={col.accessorKey} className='p-4 border-y text-nowrap'>
                        {row[col.accessorKey]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {dmgColumns.length > 0 && (
          <div className='w-full overflow-x-scroll no-scrollbar'>
            <Typography variant='h6' className='mt-4 mb-2 px-4 font-bold'>
              Damaged Parcels
            </Typography>
            <table className='min-w-full mb-6 border-collapse'>
              <thead>
                <tr>
                  {dmgColumns.map(col => (
                    <th key={col.header} className='p-4 font-medium text-start border-y uppercase text-nowrap'>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {damagedParcels.map((row, idx) => (
                  <tr key={idx}>
                    {dmgColumns.map(col => (
                      <td key={col.accessorKey} className='p-4 border-y text-nowrap'>
                        {row[col.accessorKey]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Box>

      <DownloadDialog
        open={downloadDialogOpen}
        onClose={() => setDownloadDialogOpen(false)}
        onConfirm={format => {
          const fileName = `${selectedCourier}_report_${dayjs().format('YYYYMMDD')}`

          const allSections = {
            'Main Ledger': { data: editableData, columns: mainColumns },
            'Details of Parcels': { data: parcelDetails, columns: parcelColumns },
            'Previous Parcels': { data: previousParcels, columns: prevColumns },
            'Damaged Parcels': { data: damagedParcels, columns: dmgColumns }
          }

          if (format === 'pdf') exportToPDF(allSections, fileName)
          else if (format === 'excel')
            exportToExcel([...editableData, ...parcelDetails, ...previousParcels, ...damagedParcels], fileName)
          else exportToCSV([...editableData, ...parcelDetails, ...previousParcels, ...damagedParcels], fileName)
          setSnackbarMessage(`Report downloaded successfully as ${format.toUpperCase()}`)
          setSnackbarSeverity('success')
          setSnackbarOpen(true)
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
    </Paper>
  )
}

export default LedgersPage
