'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { useSelector } from 'react-redux'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

import { selectOrderById } from '@/redux-store/slices/order'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

export const paymentStatus = {
  paid: { text: 'Paid', color: 'success' },
  pending: { text: 'Pending', color: 'warning' },
  cancelled: { text: 'Cancelled', color: 'secondary' },
  failed: { text: 'Failed', color: 'error' }
}

export const statusChipColor = {
  confirmed: { color: 'success' },
  completed: { color: 'primary' },
  processing: { color: 'info' },
  pending: { color: 'warning' },
  cancelled: { color: 'secondary' },
  delivered: { color: 'primary' },
  onWay: { color: 'warning' },
  returned: { color: 'error' }
}

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Column Definitions
const columnHelper = createColumnHelper()

const OrderListTable = ({order, customerData }) => {

  const customerId = customerData?.id || null

  // Get last order ID from customer data
  const lastOrderId = customerData?.last_order_id

  // Lookup last order in Redux store
  const lastOrder = useSelector(state => selectOrderById(state, lastOrderId))

  // States
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  // Hooks
  const { lang: locale } = useParams()

  // Filter orders by customer ID if provided
  const filteredOrders = useMemo(() => {
    if (!order) return []

    if (customerId) {
      return order.filter(order => order.customer == customerId)
    }

    return order
  }, [order, customerId])


  // Transform orders data to match table format
  const tableData = useMemo(() => {
    let baseData = []

    if (!filteredOrders) return baseData

    if (Array.isArray(filteredOrders)) {
      baseData = filteredOrders.map(order => ({
        id: order.id,
        order: order.name,
        date: order.created_at,
        status: order.orderStatus || order.financial_status,
        spent: order.current_total_price || '0.00',
        customer: order.customer
      }))
    } else {
      baseData = [{
        id: filteredOrders?.id,
        order: filteredOrders?.name,
        date: filteredOrders?.created_at,
        status: filteredOrders?.orderStatus || filteredOrders?.financial_status,
        spent: filteredOrders?.current_total_price || '0.00',
        customer: filteredOrders?.customer
      }]
    }

    // If lastOrder is found, add it
    if (lastOrder && !baseData.some(o => o.id === lastOrder.id)) {
      baseData.splice(1, 0, {
        id: lastOrder.id,
        order: lastOrder.name,
        date: lastOrder.created_at,
        status: lastOrder.orderStatus || lastOrder.financial_status,
        spent: lastOrder.current_total_price || '0.00',
        customer: lastOrder.customer
      })
    }

    return baseData
  }, [filteredOrders, lastOrder])




  const columns = useMemo(
    () => [
      columnHelper.accessor('order', {
        header: 'Order',
        cell: ({ row }) => (
          <Typography
            component={Link}
            href={getLocalizedUrl(`/apps/ecommerce/orders/details/${row.original.id}`, locale)}
            color='primary.main'
          >{`${row.original.id}`}</Typography>
        )
      }),
      columnHelper.accessor('date', {
        header: 'Date',
        cell: ({ row }) => (
          <Typography>{row.original.date ? new Date(row.original.date).toLocaleDateString() : 'N/A'}</Typography>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.status || 'Unknown'}
            color={statusChipColor[row.original.status]?.color || 'default'}
            variant='tonal'
            size='small'
          />
        )
      }),
      columnHelper.accessor('spent', {
        header: 'Spent',
        cell: ({ row }) => <Typography>PKR {row.original.spent}</Typography>
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary text-[22px]'
              options={[
                {
                  text: 'View',
                  icon: 'bx-show',
                  href: getLocalizedUrl(`/apps/ecommerce/orders/details/${row.original.id}`, locale),
                  linkProps: { className: 'flex items-center gap-2 is-full plb-2 pli-5' }
                },
                {
                  text: 'Delete',
                  icon: 'bx-trash',
                  menuItemProps: {
                    onClick: () => console.log('Delete order:', row.original.id),
                    className: 'flex items-center'
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    [locale]
  )

  const table = useReactTable({
    data: tableData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 6
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <Card>
      <CardContent className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4'>
        <Typography variant='h5'>Orders Placed</Typography>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search Order'
          className='max-sm:is-full'
          size='small'
        />
      </CardContent>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={classnames({
                          'flex items-center': header.column.getIsSorted(),
                          'cursor-pointer select-none': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <i className='bx-chevron-up text-xl' />,
                          desc: <i className='bx-chevron-down text-xl' />
                        }[header.column.getIsSorted()] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  No orders found
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })}
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
      />
    </Card>
  )
}

export default OrderListTable
