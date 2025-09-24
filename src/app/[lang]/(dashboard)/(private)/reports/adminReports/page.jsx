'use client'

import { useState, useEffect, useMemo } from 'react'

import { Box, Typography, MenuItem, Select, Checkbox, CircularProgress, Paper } from '@mui/material'
import classnames from 'classnames'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender
} from '@tanstack/react-table'

const reportsList = [
  { key: 'agentWiseSale', label: 'Agent wise sale' },
  { key: 'unitWiseSale', label: 'Unit wise sale' },
  { key: 'cityWiseSales', label: 'City wise sales' },
  { key: 'productWiseSales', label: 'Product wise sales' },
  { key: 'agentWiseIncentives', label: 'Agent wise incentives' },
  { key: 'productWiseIncentive', label: 'Product wise incentive' },
  { key: 'dayToDayComparison', label: 'Day to day comparison' },
  { key: 'weekToWeekComparison', label: 'Week to week comparison' },
  { key: 'unitWiseReport', label: 'Unit wise report' },
  { key: 'valueWiseReport', label: 'Value wise report' },
  { key: 'courierWiseBooking', label: 'Courier wise booking report' },
  { key: 'courierWiseDelivery', label: 'Courier wise delivery report' },
  { key: 'courierWisePerformance', label: 'Courier wise performance report' },
  { key: 'courierCityComparison', label: 'Courier’s city comparison report' },
  { key: 'returnParcelsLedger', label: 'Return Parcels Ledger' },
  { key: 'dailySales', label: 'Daily sales report' },
  { key: 'monthlyClosing', label: 'Monthly Closing report' },
  { key: 'realTimeSales', label: 'Real Time Sales Report' },
  { key: 'returningCustomers', label: 'Returning Customers Percentage' },
  { key: 'discountsGiven', label: 'Discounts Given' },
  { key: 'channelWiseSales', label: 'Channel wise Sales Report' },

  // { key: 'fakeCancelledOrders', label: 'Fake/Cancelled Orders Product/Region/Channel wise' },
];

export default function AdminReportsPage() {
  const [selectedReport, setSelectedReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [rowSelection, setRowSelection] = useState({})

  useEffect(() => {
    if (!selectedReport) return
    setLoading(true)

    setTimeout(() => {
      let apiData = []

      if (selectedReport === 'agentWiseSale') {
        apiData = [
          { agent: 'Ali', deliveries: 15, returns: 2, confirmations: 10 },
          { agent: 'Sara', deliveries: 20, returns: 1, confirmations: 18 }
        ]
      } else if (selectedReport === 'cityWiseSales') {
        apiData = [
          { city: 'Lahore', products: 50, deliveries: 30, returns: 5 },
          { city: 'Karachi', products: 40, deliveries: 25, returns: 7 }
        ]
      }

      // ✅ Dynamic columns (with selection checkbox as first column)
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
    <Box p={4} className='h-[1000px]'>
      <Typography variant='h4' gutterBottom>
        Admin Reports
      </Typography>

      {/* Dropdown */}
      <Select
        value={selectedReport}
        onChange={e => setSelectedReport(e.target.value)}
        displayEmpty
        sx={{ minWidth: 400, mb: 3 }}
      >
        <MenuItem value=''>Select a Report</MenuItem>
        {reportsList.map(report => (
          <MenuItem key={report.key} value={report.key}>
            {report.label}
          </MenuItem>
        ))}
      </Select>

      {/* Table wrapper with white background + rounded corners */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          backgroundColor: 'white',
          overflow: 'hidden'
        }}
      >
      {!selectedReport ? (
          <p className="text-gray-500 font-medium py-2 px-4">
            Please select a report to view data.
          </p>
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
                      style={{
                        width: h.column.columnDef.meta?.width || 'auto',
                        maxWidth: h.column.columnDef.meta?.width || 'none'
                      }}
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
