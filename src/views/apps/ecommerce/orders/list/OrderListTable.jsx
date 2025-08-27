'use client'

import { useState, useMemo } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getSortedRowModel
} from '@tanstack/react-table'

// Components
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'
import FilterModal from '../filterModal/page'

// Utils
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Styles
import tableStyles from '@core/styles/table.module.css'

/* ---------------------------- helper maps --------------------------- */
export const paymentStatus = {
  1: { text: 'Paid', color: 'success', colorClassName: 'text-success' },
  2: { text: 'Pending', color: 'warning', colorClassName: 'text-warning' },
  3: { text: 'Cancelled', color: 'secondary', colorClassName: 'text-secondary' },
  4: { text: 'Failed', color: 'error', colorClassName: 'text-error' }
}

export const orderPlatform = {
  1: { text: 'Shopify', color: 'success', colorClassName: 'text-success' },
  2: { text: 'Whatsapp', color: 'secondary', colorClassName: 'text-secondary' },
  3: { text: 'Manually', color: 'primary', colorClassName: 'text-primary' }
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

const chipColors = ['primary', 'secondary', 'success', 'error', 'warning', 'info']

const getTagColor = tag => {
  if (!tag) return 'default'
  const hash = [...tag].reduce((acc, char) => acc + char.charCodeAt(0), 0)

  return chipColors[hash % chipColors.length]
}

export const normalizePaymentMethod = (names = []) => {
  const label = (names[0] || '').toLowerCase()

  if (label.includes('cod') || label.includes('cash on delivery')) return 'cod'
  if (label.includes('paypal')) return 'paypal'
  if (label.includes('mastercard') || label.includes('visa') || label.includes('card')) return 'card'
  if (label.includes('wallet')) return 'wallet'

  return 'other'
}

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

/* -------------------------- small components ------------------------ */
const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue ?? '')

  // keep controlled
  useMemo(() => setValue(initialValue ?? ''), [initialValue])

  // call parent after debounce
  useMemo(() => {
    const t = setTimeout(() => onChange(value), debounce)

    return () => clearTimeout(t)
  }, [value, debounce, onChange])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

/* --------------------------- main component ------------------------- */
const OrderListTable = ({
  orderData = [],
  loading = false,
  error = null,
  page = 1,
  limit = 25,
  total = 0,
  onPageChange,
  onLimitChange,
  onSearchChange,
  onFiltersChange
}) => {
  const { lang: locale } = useParams()

  // Local UI state
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [rawFilters, setRawFilters] = useState({})
  const [columnFilters, setColumnFilters] = useState([])
  const [openFilter, setOpenFilter] = useState(false)

  // Map backend orders -> table rows
  const data = useMemo(() => {
    return (orderData || []).map(order => {
      const names = Array.isArray(order.payment_gateway_names)
        ? order.payment_gateway_names
        : order.payment_gateway_names
          ? [order.payment_gateway_names]
          : []

      return {
        id: order.id,
        orderNumber: order.name?.replace('#', ''),
        date: order.created_at,
        time: new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        customer: `${order.customerData?.first_name || ''} ${order.customerData?.last_name || ''}`.trim(),
        customerId: order.customerData?.id,
        email: order.email,
        payment: order.financial_status === 'paid' ? 1 : 2,
        platform: order.platform === 'shopify' ? 1 : 2, // note: lowercase 'platform'
        status: order.orderStatus,
        method: normalizePaymentMethod(names),
        methodLabel: names[0] || 'Unknown',
        Amount: Number(order.current_total_price),
        city: order.customerData?.addresses?.[0]?.city || '',
        Tag: order.tags?.filter(Boolean) || []
      }
    })
  }, [orderData])

  const getAvatar = ({ avatar, customer }) => {
    const initials = getInitials(customer)

    if (avatar) return <CustomAvatar src={avatar} skin='light' size={34} />

    if (initials) {
      return (
        <CustomAvatar skin='light' size={34} className='bg-primary text-white'>
          {initials}
        </CustomAvatar>
      )
    }

    return (
      <CustomAvatar skin='light' size={34} className='bg-primary text-white'>
        <i className='bx-user' />
      </CustomAvatar>
    )
  }

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
      {
        accessorKey: 'orderNumber',
        header: 'Order',
        cell: ({ row }) => (
          <Typography
            component={Link}
            href={getLocalizedUrl(`/apps/ecommerce/orders/details/${row.original.id}`, locale)}
            color='primary.main'
          >
            #{row.original.orderNumber}
          </Typography>
        )
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => {
          const dateObj = new Date(row.original.date)
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' })

          const monthDateYear = dateObj.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })

          return (
            <Typography component='div'>
              <div>{monthDateYear}</div>
              <div>{`${dayName}, ${row.original.time}`}</div>
            </Typography>
          )
        }
      },
      {
        accessorKey: 'customer',
        header: 'Customers',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {getAvatar(row.original)}
            <div className='flex flex-col'>
              <Typography
                variant='h6'
                component={Link}
                href={getLocalizedUrl(`/apps/ecommerce/customers/details/${row.original.customerId}`, locale)}
                className='hover:text-primary'
              >
                {row.original.customer || '—'}
              </Typography>
              <Typography variant='body2'>{row.original.email}</Typography>
            </div>
          </div>
        )
      },
      {
        accessorKey: 'payment',
        header: 'Payment',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <i className={classnames('bx-bxs-circle bs-2 is-2', paymentStatus[row.original.payment].colorClassName)} />
            <Typography color={`${paymentStatus[row.original.payment]?.color || 'default'}.main`} className='font-medium'>
              {paymentStatus[row.original.payment]?.text || row.original.payment || 'Unknown'}
            </Typography>
          </div>
        )
      },
      {
        accessorKey: 'platform', // fixed: lowercase
        header: 'Platform',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <i className={classnames('bx-bxs-circle bs-2 is-2', orderPlatform[row.original.platform].colorClassName)} />
            <Typography color={`${orderPlatform[row.original.platform]?.color || 'default'}.main`} className='font-medium'>
              {orderPlatform[row.original.platform]?.text || row.original.platform || 'Unknown'}
            </Typography>
          </div>
        )
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.status}
            color={statusChipColor[row.original.status]?.color || 'primary'}
            variant='tonal'
            size='small'
          />
        )
      },
      {
        accessorKey: 'method',
        header: 'Method',
        cell: ({ row }) => {
          const m = row.original.method
          const label = row.original.methodLabel

          const iconClass =
            m === 'card'
              ? 'bx-credit-card'
              : m === 'paypal'
                ? 'bxl-paypal'
                : m === 'cod'
                  ? 'bx-money'
                  : m === 'wallet'
                    ? 'bx-wallet'
                    : 'bx-purchase-tag-alt'

          const rightText = m === 'card' ? row.original.methodNumber || label : label

          return (
            <div className='flex items-center gap-2'>
              <div className='flex justify-center items-center bg-[#F6F8FA] rounded-sm is-[29px] bs-[18px]'>
                <i className={`${iconClass} text-[18px]`} />
              </div>
              <Typography className='font-medium'>{rightText}</Typography>
            </div>
          )
        }
      },
      {
        accessorKey: 'Amount',
        header: 'Amount',
        cell: ({ row }) => (
          <Typography className='font-medium text-gray-800'>
            {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(row.original.Amount)}
          </Typography>
        )
      },
      {
        accessorKey: 'city',
        header: 'City',
        cell: ({ row }) => <Typography className='font-medium text-gray-800'>{row.original.city}</Typography>
      },
      {
        accessorKey: 'Tag',
        header: 'Tags',
        cell: ({ row }) => {
          const tags = Array.isArray(row.original.Tag) ? row.original.Tag : [row.original.Tag]
          const hasTags = tags && tags.length > 0 && tags.some(tag => !!tag)

          return (
            <div className='flex gap-2 w-48 flex-wrap'>
              {hasTags ? (
                tags.map((tag, i) => <Chip key={i} label={tag} color={getTagColor(tag)} variant='tonal' size='small' />)
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  -
                </Typography>
              )}
            </div>
          )
        }
      },
      {
        id: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <OptionMenu
              iconButtonProps={{ size: 'medium', className: 'text-textSecondary' }}
              options={[
                {
                  text: 'View',
                  icon: 'bx-show',
                  href: getLocalizedUrl(`/apps/ecommerce/orders/details/${row.original.id}`, locale),
                  linkProps: { className: 'flex items-center gap-2 is-full plb-2 pli-5' }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      }
    ],
    [locale]
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },

    // only selection & columnFilters are client-controlled; do not add globalFilter here
    state: { rowSelection, columnFilters },

    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,

    // server pagination
    manualPagination: true,
    pageCount: total > 0 && limit > 0 ? Math.ceil(total / limit) : -1,
    onPaginationChange: updater => {
      const current = { pageIndex: Math.max(0, (page || 1) - 1), pageSize: limit || 25 }
      const next = typeof updater === 'function' ? updater(current) : updater
      const nextPage = (next.pageIndex ?? current.pageIndex) + 1
      const nextSize = next.pageSize ?? current.pageSize

      if (nextPage !== page) onPageChange?.(nextPage)
      if (nextSize !== limit) onLimitChange?.(nextSize)
    },

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const selectedCount = useMemo(() => Object.keys(rowSelection).length, [rowSelection])
  const selectedIds = useMemo(() => table.getSelectedRowModel().flatRows.map(r => r.original.id), [table, rowSelection])

  if (error) {
    return (
      <Card>
        <CardContent className='flex items-center justify-between'>
          <Typography color='error'>Failed to fetch orders: {String(error)}</Typography>
          <Button variant='contained'>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
        <div className='flex gap-4'>
          <Button variant='outlined' startIcon={<i className='bx-filter' />} onClick={() => setOpenFilter(true)}>
            Filter
          </Button>

          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={val => {
              setGlobalFilter(val)

              // notify parent (server search)
              onSearchChange?.(val)

              // reset to first page on search
              onPageChange?.(1)
            }}
            placeholder='Search Order'
            className='sm:is-auto'
            debounce={500}
          />

          <FilterModal
            open={openFilter}
            onClose={() => setOpenFilter(false)}
            initialFilters={rawFilters}
            onApply={appliedFilters => {
              setRawFilters(appliedFilters)

              const newColumnFilters = Object.entries(appliedFilters)
                .filter(([_, value]) => value !== '')
                .map(([id, value]) => ({ id, value }))

              setColumnFilters(newColumnFilters)

              // notify parent to fetch with new filters
              onFiltersChange?.(appliedFilters)
              onPageChange?.(1)
              setOpenFilter(false)
            }}
          />
        </div>

        <div className='flex gap-4'>
          <div className='flex gap-4'>
            {selectedCount >= 2 ? (
              <OpenDialogOnElementClick
                element={Button}
                elementProps={{ children: 'Merge orders', color: 'secondary', variant: 'tonal' }}
                dialog={ConfirmationDialog}
                dialogProps={{ type: 'merge-orders', payload: { orderIds: selectedIds } }}
              />
            ) : (
              <Button color='secondary' variant='tonal' disabled>
                Merge orders
              </Button>
            )}

            {selectedCount >= 1 ? (
              <OpenDialogOnElementClick
                element={Button}
                elementProps={{ children: 'Duplicate Order', color: 'primary', variant: 'tonal' }}
                dialog={ConfirmationDialog}
                dialogProps={{ type: 'duplicate-order', payload: { orderIds: selectedIds } }}
              />
            ) : (
              <Button color='primary' variant='tonal' disabled>
                Duplicate Order
              </Button>
            )}
          </div>

          <div className='flex max-sm:flex-col sm:items-center gap-4'>
            <CustomTextField
              select
              value={limit}
              onChange={e => {
                const newLimit = Number(e.target.value)

                onLimitChange?.(newLimit)
                onPageChange?.(1)
              }}
              className='max-sm:is-full sm:is-[80px]'
            >
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </CustomTextField>

            <Button variant='tonal' color='secondary' startIcon={<i className='bx-export' />}>
              Export
            </Button>
          </div>
        </div>
      </CardContent>

      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className={classnames({ 'cursor-pointer select-none': h.column.getCanSort() })}
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
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  Loading orders...
                </td>
              </tr>
            ) : data.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        component='div'
        count={total || 0}
        page={(page || 1) - 1}
        onPageChange={(_e, newPage) => onPageChange?.(newPage + 1)}
        rowsPerPage={limit || 25}
        onRowsPerPageChange={e => {
          const newLimit = parseInt(e.target.value, 10)

          onLimitChange?.(newLimit)
          onPageChange?.(1)
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Card>
  )
}

export default OrderListTable
