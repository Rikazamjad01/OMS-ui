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

// 🔹 CSR Reports List
const csrReportsList = [
  { key: 'agentOrderReport', label: 'Agent Order Report' },
  { key: 'productUnitReport', label: 'Product Unit Report' },
  { key: 'bookingUnitReport', label: 'Booking Unit Report' },
  { key: 'courierFocReport', label: 'Courier FOC Report' },
  { key: 'agentChannelReport', label: 'Agent Channel Report' },
  { key: 'channelOrderReport', label: 'Channel Order Report' },
  { key: 'agentIncentiveReport', label: 'Agent Incentive Unit Report' },
  { key: 'courierDeliveryReport', label: 'Courier Delivery Report' },
  { key: 'dispatchReport', label: 'Dispatch Report' }
]

export default function CSRReportsPage() {
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

      if (selectedReport === 'agentOrderReport') {
        apiData = [
          { agent: 'Ali', orders: 50, confirmed: 40, returned: 5 },
          { agent: 'Sara', orders: 70, confirmed: 60, returned: 7 }
        ]
      } else if (selectedReport === 'productUnitReport') {
        apiData = [
          { product: 'Shirts', units: 120, confirmed: 100 },
          { product: 'Shoes', units: 80, confirmed: 65 }
        ]
      } else if (selectedReport === 'courierDeliveryReport') {
        apiData = [
          { courier: 'TCS', parcels: 200, delivered: 180, ratio: '90%' },
          { courier: 'Leopard', parcels: 150, delivered: 123, ratio: '82%' }
        ]
      } else if (selectedReport === 'dispatchReport') {
        apiData = [
          { courier: 'TCS', dispatched: 300, charges: 5000 },
          { courier: 'Leopard', dispatched: 220, charges: 3700 }
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
        CSR Team Reports
      </Typography>

      {/* Dropdown */}
      <Select
        value={selectedReport}
        onChange={e => setSelectedReport(e.target.value)}
        displayEmpty
        sx={{ minWidth: 400, mb: 3 }}
      >
        <MenuItem value=''>Select a Report</MenuItem>
        {csrReportsList.map(report => (
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
                        {h.column.getIsSorted() === 'asc' && <i className='bx-chevron-up text-xl' />}
                        {h.column.getIsSorted() === 'desc' && <i className='bx-chevron-down text-xl' />}
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
                      No data available for this report.
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
