'use client'

import { useState, useEffect } from 'react'

import { Box, Typography, MenuItem, Select, Checkbox, CircularProgress, Paper } from '@mui/material'
import classnames from 'classnames'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender
} from '@tanstack/react-table'


const bookingReportsList = [
  { key: 'productWiseUnits', label: 'Product wise data' },
  { key: 'courierWiseData', label: 'Courier wise data' },
  { key: 'cityWiseData', label: 'City wise data' },
  { key: 'dispatchReport', label: 'Dispatch report' },
  { key: 'demandSheet', label: 'Demand Sheet Report' },
  { key: 'realTimeTracking', label: 'Real time tracking' },
  { key: 'specialInstructions', label: 'Special Instructions' },
  { key: 'cityPriority', label: 'Change city wise priorities in booking portal' },
  { key: 'requiredData', label: 'What data required in report' }
]

export default function BookingReportsPage() {
  const [selectedReport, setSelectedReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [rowSelection, setRowSelection] = useState({})

  useEffect(() => {
    if (!selectedReport) return
    setLoading(true)

    // ⏳ Simulate API call
    setTimeout(() => {
      let apiData = []

      if (selectedReport === 'productWiseUnits') {
        apiData = [
          { product: 'Shirts', units: 120, deliveryRatio: '85%' },
          { product: 'Shoes', units: 60, deliveryRatio: '78%' }
        ]
      } else if (selectedReport === 'courierWiseData') {
        apiData = [
          { courier: 'TCS', parcels: 200, deliveryRatio: '90%' },
          { courier: 'Leopard', parcels: 150, deliveryRatio: '82%' }
        ]
      }

      const dynamicCols = [
        {
          id: 'select',
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllRowsSelected()}
              indeterminate={table.getIsSomeRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              indeterminate={row.getIsSomeSelected()}
              onChange={row.getToggleSelectedHandler()}
            />
          )
        },
        ...Object.keys(apiData[0] || {}).map(key => ({
          accessorKey: key,
          header: key.charAt(0).toUpperCase() + key.slice(1)
        }))
      ]

      setData(apiData)
      setColumns(dynamicCols)
      setLoading(false)
    }, 1000)
  }, [selectedReport])

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true
  })

  return (
    <Box p={4}>
      <Typography variant='h4' gutterBottom>
        Booking Team Reports
      </Typography>

      {/* Dropdown */}
      <Select
        value={selectedReport}
        onChange={e => setSelectedReport(e.target.value)}
        displayEmpty
        sx={{ minWidth: 400, mb: 3 }}
      >
        <MenuItem value=''>Select a Report</MenuItem>
        {bookingReportsList.map(report => (
          <MenuItem key={report.key} value={report.key}>
            {report.label}
          </MenuItem>
        ))}
      </Select>

      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          backgroundColor: 'white',
          overflow: 'hidden'
        }}
      >
        {!selectedReport ? (
          <p className='text-gray-500 font-medium py-2 px-4'>Please select a report to view data.</p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full border-collapse'>
              <thead className='bg-gray-50'>
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(h => (
                      <th
                        key={h.id}
                        onClick={h.column.getToggleSortingHandler()}
                        className={classnames('px-4 py-2 border-b text-left font-medium text-gray-700', {
                          'cursor-pointer select-none': h.column.getCanSort()
                        })}
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {{
                          asc: <i className='bx-chevron-up text-xl' />,
                          desc: <i className='bx-chevron-down text-xl' />
                        }[h.column.getIsSorted()] ?? null}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-4'>
                      <CircularProgress size={24} />
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  table.getRowModel().rows.map(row => (
                    <tr
                      key={row.id}
                      className={classnames('hover:bg-gray-50', {
                        'bg-blue-50': row.getIsSelected()
                      })}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className='px-4 py-2 border-b text-gray-800'>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-4'>
                      {selectedReport ? 'No data available for this report.' : 'Please select a report from above.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Paper>
    </Box>
  )
}
