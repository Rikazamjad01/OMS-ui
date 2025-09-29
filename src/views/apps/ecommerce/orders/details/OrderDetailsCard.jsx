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
import { Alert, Snackbar } from '@mui/material'
import Link from '@components/Link'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { handleOrder, handleFindOrder, selectOrders, setSelectedProducts } from '@/redux-store/slices/order'
import EditOrderModal from './EditOrderModal'
import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'

import EditOrderDialog from '@components/dialogs/edit-order-dialog'

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
        meta: { width: '250px' },
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <img src={row.original.image?.src || '/images/placeholder.png'} alt={''} height={34} className='rounded' />
            <div className='flex flex-col items-start  overflow-x-auto no-scrollbar' style={{ maxWidth: '250px' }}>
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
        cell: ({ row }) => <Typography>{`${row.original.weight} ${row.original.weight_unit}`}</Typography>
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
      // dispatch(setSelectedProducts(selectedProductIds))
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
                <th key={header.id} style={{ maxWidth: header.column.columnDef.meta?.width }}>
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
                  <td key={cell.id} style={{ maxWidth: cell.column.columnDef.meta?.width }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  )
}

const OrderDetailsCard = ({ order: initialOrder }) => {
  const dispatch = useDispatch()

  // Use Redux state directly instead of local state
  const order = useSelector(state => state.orders.selectedOrders)
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false })


  // Handle selection changes
  const handleSelectionChange = (selectedIds, selectedProductsData) => {
    setSelectedProductIds(selectedIds)
    setSelectedProducts(selectedProductsData)
  }

  // Create a product map for quick lookups
  const productMap = useMemo(() => {
    if (!order?.products) return {}

    return order.products.reduce((map, product) => {
      map[product.id] = product

      return map
    }, {})
  }, [order])

  // Transform line items into table data
  const tableData = useMemo(() => {
    if (!order?.line_items) return []

    return order.line_items.map((lineItem, index) => {
      const product = productMap[lineItem.id] || {}

      const transformedItem = {
        id: product.id || lineItem.id || index,
        lineItemId: lineItem.id,
        productId: product.id,
        title: product.title || lineItem.title || 'Unknown Product',
        vendor: product.vendor || 'N/A',
        price: Number(product.price) || 0,
        quantity: lineItem.quantity || 0,
        discountedPrice: Number(order.current_total_discounts) || 0,
        barCode: product.barCode || 'N/A',
        weight: product?.selected_variant?.weight || 0,
        weight_unit: product?.selected_variant?.weight_unit ?? '',
        image: product.image
      }

      return transformedItem
    })
  }, [order, productMap])

  // 💰 Calculations
  const subtotal = tableData.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const discountedSubtotal = tableData.reduce((acc, item) => acc + item.discountedPrice * item.quantity, 0)
  const shippingFee = Number(order?.shipping_lines?.[0]?.price) || 0
  const taxRate = Number(order?.current_total_tax) || 0
  const tax = discountedSubtotal * (taxRate / 100)
  const total = subtotal + discountedSubtotal + shippingFee + tax

  if (!order) {
    return <div>Loading order details...</div>
  }

  const orderProducts = order.products

  console.log(orderProducts, 'orderData in OrderDetailsCard')

  const typographyProps = (children, color, className) => ({
    children,
    color,
    className
  })

  return (
    <Card>
      <CardHeader
        title='Order Details'
        action={
          <OpenDialogOnElementClick
            element={Typography}
            elementProps={typographyProps('Upsell & Edit', 'primary', 'cursor-pointer font-medium')}
            dialog={EditOrderDialog}
            dialogProps={{
              order,
              products: orderProducts, // Pass transformed products here
              onSuccess: (message, severity = 'success') => {
                setSnackbar({ open: true, message, severity })
              }
            }}
          />
        }
      />

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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant='filled' sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  )
}

export default OrderDetailsCard
