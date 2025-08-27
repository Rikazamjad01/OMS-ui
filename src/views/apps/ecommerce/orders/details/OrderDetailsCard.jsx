'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'

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

import { useDispatch, useSelector } from 'react-redux'

// Component Imports
import Link from '@components/Link'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { handleOrder, handleFindOrder, selectOrders } from '@/redux-store/slices/order'

// 💰 Price formatter for PKR
const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0
  }).format(amount)
}

// Fuzzy filter
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const columnHelper = createColumnHelper()

const OrderTable = ({ data }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo(
    () => [
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
      columnHelper.accessor('productName', {
        header: 'Product',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <img
              src={row.original.image?.src || '/images/placeholder.png'}
              alt={row.original.title}
              height={34}
              className='rounded'
            />
            <div className='flex flex-col items-start'>
              <Typography variant='h6'>{row.original.title}</Typography>
              <Typography variant='body2'>{row.original.vendor}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('price', {
        header: 'Price',
        cell: ({ row }) => <Typography>{formatPrice(row.original.price)}</Typography>
      }),
      columnHelper.accessor('quantity', {
        header: 'Qty',
        cell: ({ row }) => <Typography>{row.original.quantity}</Typography>
      }),
      columnHelper.accessor('discountedPrice', {
        header: 'Discounted Price',
        cell: ({ row }) => <Typography>{formatPrice(row.original.discountedPrice)}</Typography>
      }),
      columnHelper.accessor('barCode', {
        header: 'Bar code',
        cell: ({ row }) => <Typography>{row.original.barCode || 'N/A'}</Typography>
      }),
      columnHelper.accessor('weight', {
        header: 'Weight',
        cell: ({ row }) => <Typography>{`${row.original.weight} grams`}</Typography>
      })
    ],
    []
  )

  const table = useReactTable({
    data: data || [],
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 25 } },
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
                No data available
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody className='border-be'>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  )
}

const OrderDetailsCard = ({ orderId }) => {
  const dispatch = useDispatch()
  const selectedOrder = useSelector(state => state.orders.selectedOrders)
  const orders = useSelector(selectOrders)

  // Find the order in Redux store or dispatch action to find it
  useEffect(() => {
    if (orderId && !selectedOrder) {
      dispatch(handleFindOrder(order))
    }
  }, [orderId, selectedOrder, dispatch])

  // Create a map of product data for easy lookup
  const productMap = useMemo(() => {
    if (!selectedOrder?.productData) return {}

    return selectedOrder.productData.reduce((map, product) => {
      map[product.id] = product

      return map
    }, {})
  }, [selectedOrder])

  // Transform line items with product data for the table
  const tableData = useMemo(() => {
    if (!selectedOrder?.line_items) return []

    return selectedOrder.line_items.map(lineItem => {
      const product = productMap[lineItem.id] || {}
      const variant = product.variants?.[0] || {}

      return {
        id: lineItem.name,
        title: product.title || 'Unknown Product',
        vendor: product.vendor || 'N/A',
        price: Number(product.price) || 0,
        quantity: lineItem.quantity || 0,
        discountedPrice: (Number(product.price) || 0) * 0.9, // 10% discount for example
        barCode: variant.barCode || 'N/A',
        weight: variant.weight || 0,
        image: product.image || { src: '/images/placeholder.png' }
      }
    })
  }, [selectedOrder, productMap])

  // 💰 Calculations
  const subtotal = tableData.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  const discountedSubtotal = tableData.reduce((acc, item) => acc + (item.discountedPrice * item.quantity), 0)
  const discount = subtotal - discountedSubtotal
  const shippingFee = Number(selectedOrder?.shipping_lines?.[0]?.price) || 0
  const taxRate = Number(selectedOrder?.current_total_tax)
  const tax = discountedSubtotal * taxRate
  const total = discountedSubtotal + shippingFee + tax

  if (!selectedOrder) {
    return <div>Loading order details...</div>
  }

  return (
    <Card>
      <CardHeader
        title='Order Details'
        action={
          <Typography component={Link} color='primary.main' className='font-medium'>
            Edit
          </Typography>
        }
      />
      <OrderTable data={tableData} />
      <CardContent className='flex justify-end'>
        <div>
          <div className='flex items-center gap-12'>
            <Typography color='text.primary' className='min-is-[150px]'>
              Subtotal :
            </Typography>
            <Typography variant='h6'>{formatPrice(subtotal)}</Typography>
          </div>
          <div className='flex items-center gap-12'>
            <Typography color='text.primary' className='min-is-[150px]'>
              Discounted Subtotal:
            </Typography>
            <Typography variant='h6'>{formatPrice(discountedSubtotal)}</Typography>
          </div>
          <div className='flex items-center gap-12'>
            <Typography color='text.primary' className='min-is-[150px]'>
              Shipping Fee:
            </Typography>
            <Typography variant='h6'>{formatPrice(shippingFee)}</Typography>
          </div>
          <div className='flex items-center gap-12'>
            <Typography color='text.primary' className='min-is-[150px]'>
              Tax:
            </Typography>
            <Typography variant='h6'>{formatPrice(tax)}</Typography>
          </div>
          <div className='flex items-center gap-12'>
            <Typography variant='h6' className='min-is-[150px]'>
              Total:
            </Typography>
            <Typography variant='h6'>{formatPrice(total)}</Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default OrderDetailsCard
