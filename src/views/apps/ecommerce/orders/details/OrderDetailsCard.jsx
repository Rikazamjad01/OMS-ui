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
import { handleOrder, handleFindOrder, selectOrders, setSelectedProducts } from '@/redux-store/slices/order'

// 💰 Price formatter for PKR
const formatPrice = amount => {
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

const OrderTable = ({ data, onSelectionChange }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const dispatch = useDispatch()

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
    getRowId: row => row.id.toString(), // This uses the row's id field
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 25 } },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: newSelectionUpdater => {

      // Handle the updater function properly
      const newSelection =
        typeof newSelectionUpdater === 'function' ? newSelectionUpdater(rowSelection) : newSelectionUpdater

      setRowSelection(newSelection)

      // Get the selected row IDs (these are the keys in newSelection)
      const selectedRowIds = Object.keys(newSelection).filter(id => newSelection[id]) // Only get selected rows (true values)

      // Get the actual product data for the selected rows
      const selectedProducts = data.filter(item => {
        const itemIdString = item.id.toString()
        const isSelected = selectedRowIds.includes(itemIdString)

        return isSelected
      })

      // Extract the product IDs from selected products
      const selectedProductIds = selectedProducts.map(item => item.productId || item.id).filter(id => id != null)

      // Send to parent component
      if (onSelectionChange) {
        onSelectionChange(selectedProductIds, selectedProducts)
      }

      // Also dispatch to Redux
      dispatch(setSelectedProducts(selectedProductIds))
    },
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
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])

  // Handle selection changes - now receives both IDs and full product data
  const handleSelectionChange = (selectedIds, selectedProductsData) => {
    setSelectedProductIds(selectedIds)
    setSelectedProducts(selectedProductsData)
    console.log('Selected Product IDs:', selectedIds)
  }

  // Find the order in Redux store or dispatch action to find it
  useEffect(() => {
    if (orderId && !selectedOrder) {
      dispatch(handleFindOrder(orderId))
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
    if (!selectedOrder?.line_items) {
      return []
    }

    const transformedData = selectedOrder.line_items.map((lineItem, index) => {
      const product = productMap[lineItem.id] || {}
      const variant = product.variants?.[0] || {}

      const transformedItem = {
        // Use a combination of approaches for the ID
        id: product.id || lineItem.id || index, // Fallback to index if both IDs are missing
        lineItemId: lineItem.id, // Keep line item ID for reference
        productId: product.id, // Explicit product ID (might be undefined)
        title: product.title || lineItem.title || 'Unknown Product',
        vendor: product.vendor || 'N/A',
        price: Number(product.price) || Number(lineItem.price) || 0,
        quantity: lineItem.quantity || 0,
        discountedPrice: Number(selectedOrder?.current_total_discounts) || 0,
        barCode: variant.barCode || 'N/A',
        weight: variant.weight || 0,
        image: product.image || { src: '/images/placeholder.png' }
      }

      return transformedItem
    })

    return transformedData
  }, [selectedOrder, productMap])


  // 💰 Calculations
  const subtotal = tableData.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const discountedSubtotal = tableData.reduce((acc, item) => acc + item.discountedPrice * item.quantity, 0)
  const shippingFee = Number(selectedOrder?.shipping_lines?.[0]?.price) || 0
  const taxRate = Number(selectedOrder?.current_total_tax) || 0
  const tax = discountedSubtotal * (taxRate / 100)
  const total = subtotal + discountedSubtotal + shippingFee + tax

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

      {/* Debug info - remove in production */}
      <CardContent>
        <Typography variant='body2' color='text.secondary'>
          Selected Product IDs: {selectedProductIds.join(', ') || 'None'}
        </Typography>
      </CardContent>

      <OrderTable data={tableData} onSelectionChange={handleSelectionChange} />
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
