'use client'
import { useState, useMemo, useEffect } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { useSelector, useDispatch } from 'react-redux'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'

import { DatePicker, Space } from 'antd'

const { RangePicker } = DatePicker

import classnames from 'classnames'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel
} from '@tanstack/react-table'
import { Alert, Autocomplete, DialogActions, InputAdornment, Snackbar, TextField, MenuItem, Menu } from '@mui/material'

import { rankItem } from '@tanstack/match-sorter-utils'

// import { DateRangePicker } from '@mui/lab'

import dayjs from 'dayjs'

import TagEditDialog from '@/components/tagEdit/TagEditDialog'

import { fetchOrders, updateOrderCommentsAndRemarks, selectPagination, updateOrdersStatusThunk } from '@/redux-store/slices/order'

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
import AmountRangePicker from '@/components/amountRangePicker/AmountRangePicker'
import StatusCell from '@/components/statusCell/StatusCell'

/* ---------------------------- helper maps --------------------------- */
export const paymentStatus = {
  paid: { text: 'Paid', color: 'success', colorClassName: 'text-success' },
  pending: { text: 'Pending', color: 'warning', colorClassName: 'text-warning' },
  cancelled: { text: 'Cancelled', color: 'secondary', colorClassName: 'text-secondary' },
  failed: { text: 'Failed', color: 'error', colorClassName: 'text-error' }
}

export const orderPlatform = {
  shopify: { text: 'Shopify', color: 'success', colorClassName: 'text-success' },
  whatsapp: { text: 'Whatsapp', color: 'secondary', colorClassName: 'text-secondary' },
  split: { text: 'Split', color: 'warning', colorClassName: 'text-warning' }
}

export const statusChipColor = {
  confirmed: { color: 'success', text: 'Confirmed' },
  completed: { color: 'primary', text: 'Completed' },
  processing: { color: 'info', text: 'Processing' },
  pending: { color: 'warning', text: 'Pending' },
  cancelled: { color: 'secondary', text: 'Cancelled' },
  delivered: { color: 'primary', text: 'Delivered' },
  onWay: { color: 'warning', text: 'On Way' },
  returned: { color: 'error', text: 'Returned' }
}

export const orderStatusArray = Object.keys(statusChipColor).map(key => ({
  value: key,
  label: statusChipColor[key].text
}))

export const pakistanCities = {
  karachi: { text: 'Karachi', color: 'primary', colorClassName: 'text-primary' },
  lahore: { text: 'Lahore', color: 'secondary', colorClassName: 'text-secondary' },
  islamabad: { text: 'Islamabad', color: 'success', colorClassName: 'text-success' },
  faisalabad: { text: 'Faisalabad', color: 'warning', colorClassName: 'text-warning' },
  rawalpindi: { text: 'Rawalpindi', color: 'info', colorClassName: 'text-info' },
  multan: { text: 'Multan', color: 'error', colorClassName: 'text-error' },
  peshawar: { text: 'Peshawar', color: 'primary', colorClassName: 'text-primary' },
  quetta: { text: 'Quetta', color: 'secondary', colorClassName: 'text-secondary' },
  sialkot: { text: 'Sialkot', color: 'success', colorClassName: 'text-success' },
  gujranwala: { text: 'Gujranwala', color: 'warning', colorClassName: 'text-warning' },
  hyderabad: { text: 'Hyderabad', color: 'info', colorClassName: 'text-info' },
  sukkur: { text: 'Sukkur', color: 'error', colorClassName: 'text-error' },
  bahawalpur: { text: 'Bahawalpur', color: 'primary', colorClassName: 'text-primary' },
  abbottabad: { text: 'Abbottabad', color: 'secondary', colorClassName: 'text-secondary' },
  mianwali: { text: 'Mianwali', color: 'success', colorClassName: 'text-success' },
  jhang: { text: 'Jhang', color: 'warning', colorClassName: 'text-warning' },
  deraGhaziKhan: { text: 'Dera Ghazi Khan', color: 'info', colorClassName: 'text-info' },
  larkana: { text: 'Larkana', color: 'error', colorClassName: 'text-error' },
  swat: { text: 'Swat', color: 'primary', colorClassName: 'text-primary' },
  gilgit: { text: 'Gilgit', color: 'secondary', colorClassName: 'text-secondary' },
  kasur: { text: 'Kasur', color: 'success', colorClassName: 'text-success' },
  sheikhupura: { text: 'Sheikhupura', color: 'warning', colorClassName: 'text-warning' },
  okara: { text: 'Okara', color: 'info', colorClassName: 'text-info' },
  hafizabad: { text: 'Hafizabad', color: 'error', colorClassName: 'text-error' },
  narowal: { text: 'Narowal', color: 'primary', colorClassName: 'text-primary' },
  khushab: { text: 'Khushab', color: 'secondary', colorClassName: 'text-secondary' },
  vehari: { text: 'Vehari', color: 'success', colorClassName: 'text-success' },
  sargodha: { text: 'Sargodha', color: 'warning', colorClassName: 'text-warning' },
  chiniot: { text: 'Chiniot', color: 'info', colorClassName: 'text-info' },
  khairpur: { text: 'Khairpur', color: 'error', colorClassName: 'text-error' },
  nawabshah: { text: 'Nawabshah', color: 'primary', colorClassName: 'text-primary' },
  mirpurkhas: { text: 'Mirpurkhas', color: 'secondary', colorClassName: 'text-secondary' },
  gwadar: { text: 'Gwadar', color: 'success', colorClassName: 'text-success' },
  khuzdar: { text: 'Khuzdar', color: 'warning', colorClassName: 'text-warning' },
  deraIsmailKhan: { text: 'Dera Ismail Khan', color: 'info', colorClassName: 'text-info' },
  mardan: { text: 'Mardan', color: 'error', colorClassName: 'text-error' },
  charsadda: { text: 'Charsadda', color: 'primary', colorClassName: 'text-primary' },
  kohat: { text: 'Kohat', color: 'secondary', colorClassName: 'text-secondary' },
  muzaffarabad: { text: 'Muzaffarabad', color: 'success', colorClassName: 'text-success' },
  skardu: { text: 'Skardu', color: 'warning', colorClassName: 'text-warning' },
  bannu: { text: 'Bannu', color: 'info', colorClassName: 'text-info' },
  Nowshera: { text: 'Nowshera', color: 'error', colorClassName: 'text-error' },
  kandhkot: { text: 'Kandhkot', color: 'primary', colorClassName: 'text-primary' },
  khanewal: { text: 'Khanewal', color: 'secondary', colorClassName: 'text-secondary' },
  chitral: { text: 'Chitral', color: 'success', colorClassName: 'text-success' },
  kotli: { text: 'Kotli', color: 'warning', colorClassName: 'text-warning' },
  hayderabad: { text: 'Hayderabad', color: 'info', colorClassName: 'text-info' },
  Rkniwal: { text: 'Rkniwal', color: 'error', colorClassName: 'text-error' },
  Pattoki: { text: 'Pattoki', color: 'primary', colorClassName: 'text-primary' }
}

const chipColors = ['primary', 'secondary', 'success', 'error', 'warning', 'info']

const getTagColor = tag => {
  if (!tag) return 'default'
  const hash = [...tag].reduce((acc, char) => acc + char.charCodeAt(0), 0)

  return chipColors[hash % chipColors.length]
}

const mapFiltersToApiFormat = localFilters => {
  const apiFilters = {}

  // Amount filters
  if (localFilters.minAmount) apiFilters.amountMin = localFilters.minAmount
  if (localFilters.maxAmount) apiFilters.amountMax = localFilters.maxAmount

  if (localFilters.paymentMethods && localFilters.paymentMethods.length > 0) {
    apiFilters.paymentMethod = localFilters.paymentMethods[0].value
  }

  if (localFilters.paymentStatus && localFilters.paymentStatus.length > 0) {
    apiFilters.paymentStatus = localFilters.paymentStatus[0].value
  }

  // Date filters (you need to add startDate/endDate to your filters state)
  if (localFilters.startDate) apiFilters.dateFrom = localFilters.startDate
  if (localFilters.endDate) apiFilters.dateTo = localFilters.endDate

  // Status filters - you need to decide which one to use
  if (localFilters.orderStatus && localFilters.orderStatus.length > 0) {
    apiFilters.status = localFilters.orderStatus[0].value
  }

  // Platform filters
  if (localFilters.orderPlatform?.length > 0) {
    apiFilters.platform = localFilters.orderPlatform[0].value // or join them
  }

  if (localFilters.pakistanCities && localFilters.pakistanCities.length > 0) {
    apiFilters.city = localFilters.pakistanCities[0].value
  }

  return apiFilters
}

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta?.({ itemRank })

  return itemRank.passed
}

export const paymentMethodsMap = {
  cod: { text: 'COD' },
  wallet: { text: 'Wallet' }
}

export const normalizePaymentMethod = (names = []) => {
  const label = (names[0] || '').toLowerCase()

  if (label.includes('cod') || label.includes('cash on delivery')) return 'cod'
  if (label.includes('paypal')) return 'paypal'
  if (label.includes('mastercard') || label.includes('visa') || label.includes('card')) return 'card'
  if (label.includes('wallet')) return 'wallet'

  return 'other'
}

// const fuzzyFilter = (row, columnId, value, addMeta) => {
//   const itemRank = rankItem(row.getValue(columnId), value)

//   addMeta({ itemRank })

//   return itemRank.passed
// }

/* -------------------------- small components ------------------------ */
const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, onEnter, ...props }) => {
  const [value, setValue] = useState(initialValue ?? '')

  useEffect(() => {
    setValue(initialValue ?? '')
  }, [initialValue])

  useEffect(() => {
    const t = setTimeout(() => onChange(value), debounce)

    return () => clearTimeout(t)
  }, [value, debounce, onChange])

  return (
    <CustomTextField
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          onEnter?.(value)
        }
      }}
    />
  )
}

/* --------------------------- main component ------------------------- */
const OrderListTable = ({
  orderData = [],
  loading = false,
  error = null,
  page = (initialPage = 1),
  limit = 25,
  total = 0,
  onPageChange,
  onLimitChange,
  onSearchChange,
  onFiltersChange
}) => {
  const { lang: locale } = useParams()
  const dispatch = useDispatch()
  const pagination = useSelector(selectPagination)

  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' })
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null)
  const statusMenuOpen = Boolean(statusMenuAnchor)

  const [tagsMap, setTagsMap] = useState({})

  // Local UI state
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState([])
  const [loadings, setLoadings] = useState(false)

  const [tagModal, setTagModal] = useState({
    open: false,
    orderId: null,
    tags: []
  })

  const openTagEditor = (orderId, currentTags = []) => {
    const tag = Array.isArray(currentTags) ? (currentTags[0] ?? '') : (currentTags ?? '')

    setTagModal({ open: true, orderId, tags: [tag].filter(Boolean) })
  }

  const closeTagEditor = () => setTagModal({ open: false, orderId: null, tags: [] })

  const updateOrdersStatus = async (orderIds, newStatus) => {
    try {
      // Ensure orderIds is always an array
      const idsArray = Array.isArray(orderIds) ? orderIds : [orderIds]

      const result = await dispatch(
        updateOrdersStatusThunk({
          orderIds: idsArray,
          status: newStatus
        })
      ).unwrap()

      // Success message
      const count = idsArray.length

      const message =
        result.message ||
        `Status updated to "${statusChipColor[newStatus]?.text}" for ${count} order${count > 1 ? 's' : ''}`

      setAlert({
        open: true,
        message,
        severity: 'success'
      })

      // Clean up UI state only if it was a bulk operation
      if (selectedIds.length > 0) {
        setStatusMenuAnchor(null)
        setRowSelection({})
      }

      // Refresh data
      dispatch(fetchOrders({ page, limit, force: true }))
    } catch (error) {
      // Clean up UI state only if it was a bulk operation
      if (selectedIds.length > 0) {
        setStatusMenuAnchor(null)
        setRowSelection({})
      }

      setAlert({
        open: true,
        message: error.message || error || 'Failed to update order status',
        severity: 'error'
      })
    }
  }

  const handleSingleStatusChange = (orderId, newStatus) => updateOrdersStatus(orderId, newStatus)
  const handleBulkStatusChange = (newStatus) => updateOrdersStatus(selectedIds, newStatus)


  const dateRangeFilterFn = (row, columnId, filterValue) => {
    const rowDate = new Date(row.getValue(columnId))
    const from = filterValue.from ? new Date(filterValue.from) : null
    const to = filterValue.to ? new Date(filterValue.to) : null

    if (from && rowDate < from) return false
    if (to && rowDate > to) return false

    return true
  }

  const amountRangeFilterFn = (row, columnId, filterValue) => {
    const amount = Number(row.getValue(columnId))
    const min = filterValue.min !== '' ? Number(filterValue.min) : null
    const max = filterValue.max !== '' ? Number(filterValue.max) : null

    if (min !== null && amount < min) return false
    if (max !== null && amount > max) return false

    return true
  }

  // Map backend orders -> table rows
  const data = useMemo(() => {
    return (orderData || []).map(order => {
      const names = Array.isArray(order.payment_gateway_names)
        ? order.payment_gateway_names
        : order.payment_gateway_names
          ? [order.payment_gateway_names]
          : []

      const parsedTags =
        typeof order.tags === 'string'
          ? order.tags
              .split(',')
              .map(t => t.trim())
              .filter(Boolean) // "a,b" → ["a","b"]
          : Array.isArray(order.tags)
            ? order.tags.filter(Boolean)
            : []

      return {
        id: order.id,
        orderNumber: order?.name?.replace('#', ''),
        date: order.created_at,
        time: new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        customer: `${order?.first_name || ''} ${order?.last_name || ''}`.trim(),
        customerId: order?.customer,
        email: order.email,
        payment: order.financial_status?.toLowerCase() || 'pending',
        platform: order.platform?.toLowerCase() || 'manual', // note: lowercase 'platform'
        status: order.orderStatus,
        method: normalizePaymentMethod(names),
        remarks: order.remarks,
        methodLabel: names[0] || 'Unknown',
        Amount: Number(order.current_total_price),
        city: order?.city || '',
        tags: parsedTags
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

  const handleSaveTags = async newTag => {
    const tagPayload = String(newTag || '').trim()

    if (!tagPayload || !tagPayload.trim()) {
      setAlert({ open: true, message: 'Tag cannot be empty.', severity: 'error' })

      return
    }

    const orderId = tagModal.orderId

    if (!orderId) return

    if (!tagPayload) {
      console.warn('No tag to update, skipping request.')

      return
    }

    try {
      setLoadings(true)

      const result = await dispatch(
        updateOrderCommentsAndRemarks({
          orderId,
          tags: tagPayload
        })
      ).unwrap()

      setAlert({
        open: true,
        message: result?.message || 'Tag updated successfully.',
        severity: 'success'
      })

      // Normalize to array for UI display, but it's still just one tag
      const normalizedTags =
        typeof result.tags === 'string'
          ? result.tags
              .split(/[,|\n]+/)
              .map(t => t.trim())
              .filter(Boolean)
          : [tagPayload]

      setTagsMap(prev => {
        const previousTags = prev[orderId] ?? []
        const merged = Array.from(new Set([...previousTags, ...normalizedTags]))

        return {
          ...prev,
          [orderId]: merged
        }
      })

      if (result.status) {
        closeTagEditor()
      }
    } catch (err) {
      setAlert({
        open: true,
        message: err?.message || 'Failed to update tag.',
        severity: 'error'
      })
      console.error('Failed to update tag:', err)
    } finally {
      setLoadings(false)
    }
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
        id: 'order',
        header: 'Order #',
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
        filterFn: dateRangeFilterFn,
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
        header: 'Customer Name',
        meta: { width: '250px' },
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
        header: 'Payment Status',
        meta: { width: '200px' },
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <i className={classnames('bx-bxs-circle bs-2 is-2', paymentStatus[row.original.payment].colorClassName)} />
            <Typography
              color={`${paymentStatus[row.original.payment]?.color || 'default'}.main`}
              className='font-medium'
            >
              {paymentStatus[row.original.payment]?.text || row.original.payment || 'Unknown'}
            </Typography>
          </div>
        )
      },
      {
        accessorKey: 'platform', // fixed: lowercase
        header: 'Platform',
        cell: ({ row }) => {
          const platformInfo = orderPlatform[row.original.platform] ?? {
            text: row.original.platform || 'Unknown',
            color: 'default',
            colorClassName: 'text-secondary'
          }

          return (
            <div className='flex items-center gap-1'>
              <i className={classnames('bx-bxs-circle bs-2 is-2', platformInfo.colorClassName)} />
              <Typography
                color={`${orderPlatform[row.original.platform]?.color || 'default'}.main`}
                className='font-medium'
              >
                {orderPlatform[row.original.platform]?.text || row.original.platform || 'Unknown'}
              </Typography>
            </div>
          )
        }
      },
      {
        accessorKey: 'status',
        header: 'Order Status',
        cell: props => <StatusCell {...props} onStatusChange={handleSingleStatusChange} />
      },
      {
        accessorKey: 'method',
        header: 'Method',
        meta: { width: '250px' },
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

      // column of remarks
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        cell: ({ row }) => <Typography className='font-medium text-gray-800'>{row.original.remarks}</Typography>
      },
      {
        accessorKey: 'Amount',
        header: 'Amount',
        filterFn: amountRangeFilterFn,
        cell: ({ row }) => (
          <Typography className='font-medium text-gray-800'>
            {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(row.original.Amount)}
          </Typography>
        )
      },
      {
        accessorKey: 'city',
        header: 'City',
        meta: { width: '180px' },
        cell: ({ row }) => <Typography className='font-medium text-gray-800'>{row.original.city}</Typography>
      },
      {
        accessorKey: 'tags',
        header: 'Tags',
        meta: { width: '250px' },
        cell: ({ row }) => {
          const originalTags = Array.isArray(row.original.tags)
            ? row.original.tags
            : row.original.tags
              ? [row.original.tags]
              : []

          const displayedTags = tagsMap[row.original.id] ?? originalTags
          const hasTags = displayedTags && displayedTags.length > 0

          return (
            <div className='flex flex-col gap-1'>
              {/* First row: Tags */}
              <div
                className='flex gap-2 cursor-pointer overflow-scroll no-scrollbar'
                onClick={() => openTagEditor(row.original.id, displayedTags)}
                role='button'
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter') openTagEditor(row.original.id, displayedTags)
                }}
              >
                {hasTags ? (
                  displayedTags.map((tag, i) => (
                    <Chip key={i} label={tag} color={getTagColor(tag)} variant='tonal' size='small' />
                  ))
                ) : (
                  <> </>
                )}
              </div>

              {/* Second row: "+" button */}
              <div>
                <Chip
                  label='+ Add Tag'
                  variant='outlined'
                  size='small'
                  onClick={() => openTagEditor(row.original.id, displayedTags)}
                />
              </div>
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
    [locale, tagsMap]
  )

  const [filters, setFilters] = useState({
    paymentMethods: [],
    paymentStatus: [],
    orderPlatform: [],
    orderStatus: [],
    city: [],
    tags: [],
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  })

  const paymentMethodsArray = Object.keys(paymentMethodsMap).map(key => ({
    value: key,
    label: paymentMethodsMap[key].text
  }))

  const orderPlatformArray = Object.keys(orderPlatform).map(key => ({
    value: key,
    label: orderPlatform[key].text
  }))

  const paymentStatusArray = Object.keys(paymentStatus).map(key => ({
    value: key,
    label: paymentStatus[key].text
  }))

  const citiesArray = Object.keys(pakistanCities).map(key => ({
    value: key,
    label: pakistanCities[key].text
  }))

  const tagsArray = Object.keys(tagsMap).map(key => ({
    value: key,
    label: tagsMap[key].text
  }))

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection, globalFilter, columnFilters },
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    filterFns: {
      dateRange: dateRangeFilterFn,
      amountRange: amountRangeFilterFn
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: fuzzyFilter,
    manualPagination: true,
    pageCount: total > 0 && limit > 0 ? Math.ceil(total / limit) : -1,
    onPaginationChange: updater => {
      const current = { pageIndex: Math.max(0, page - 1), pageSize: limit || 25 }
      const next = typeof updater === 'function' ? updater(current) : updater
      const nextPage = (next.pageIndex ?? current.pageIndex) + 1
      const nextSize = next.pageSize ?? current.pageSize

      if (nextPage !== page) {
        onPageChange?.(nextPage)
      }

      if (nextSize !== limit) {
        onLimitChange?.(nextSize)
      }
    }
  })

  const selectedCount = useMemo(() => Object.keys(rowSelection).length, [rowSelection])
  const selectedIds = table.getSelectedRowModel().flatRows.map(r => r.original.id)

  const emptyFilters = {
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    paymentMethods: [],
    orderPlatform: [],
    statusChipColor: [],
    paymentStatus: [],
    tagsMap: [],
    pakistanCities: []
  }

  if (error) {
    return (
      <Card>
        <CardContent className='flex items-center justify-between'>
          <Typography color='error'>Failed to fetch orders: {error?.message || String(error)}</Typography>
          <Button variant='contained'>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className='flex flex-wrap justify-between gap-4'>
        <div className='flex flex-wrap gap-4'>
          {/* <Button variant='outlined' startIcon={<i className='bx-filter' />} onClick={() => setOpenFilter(true)}>
            Filter
          </Button> */}

          <RangePicker
            status='success'
            value={filters.startDate && filters.endDate ? [dayjs(filters.startDate), dayjs(filters.endDate)] : null}
            onChange={dates => {
              if (dates && dates.length === 2) {
                setFilters(prev => ({
                  ...prev,
                  startDate: dates[0].format('YYYY-MM-DD'),
                  endDate: dates[1].format('YYYY-MM-DD')
                }))
              } else {
                setFilters(prev => ({
                  ...prev,
                  startDate: '',
                  endDate: ''
                }))
              }
            }}
          />

          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={val => {
              setGlobalFilter(String(val))
              onSearchChange?.(val) // Add this line
            }}
            onEnter={val => {
              setGlobalFilter(val)
              onSearchChange?.(val)
            }}
            placeholder='Search Order'
          />

          {/* <FilterModal
            open={openFilter}
            onClose={() => setOpenFilter(false)}
            initialFilters={rawFilters}
            onApply={appliedFilters => {
              setRawFilters(appliedFilters)

              dispatch(fetchOrders({ page: 1, limit: 25, filters: appliedFilters }))

              // setColumnFilters(newColumnFilters)

              // notify parent to fetch with new filters
              onFiltersChange?.(appliedFilters)
              onPageChange?.(1)
              setOpenFilter(false)
            }}
          /> */}
          {/* <DateRangePicker /> */}
        </div>

        <div className='flex gap-4 flex-wrap'>
          <div className='flex gap-4'>
            {/* Add the Change Status button - only shows when orders are selected */}
            {selectedCount >= 1 && (
              <>
                <Button
                  color='info'
                  variant='tonal'
                  startIcon={<i className='bx-edit' />}
                  onClick={event => setStatusMenuAnchor(event.currentTarget)}
                >
                  Change Status ({selectedCount})
                </Button>

                {/* Status Change Menu */}
                <Menu anchorEl={statusMenuAnchor} open={statusMenuOpen} onClose={() => setStatusMenuAnchor(null)}>
                  {orderStatusArray.map(status => (
                    <MenuItem key={status.value} onClick={() => handleBulkStatusChange(status.value)}>
                      <Chip
                        label={status.label}
                        color={statusChipColor[status.value].color}
                        variant='tonal'
                        size='small'
                      />
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}

            {selectedCount >= 2 ? (
              <OpenDialogOnElementClick
                element={Button}
                elementProps={{ children: 'Merge orders', color: 'secondary', variant: 'tonal' }}
                dialog={ConfirmationDialog}
                dialogProps={{
                  type: 'merge-orders',
                  payload: (() => {
                    console.log('Merge Payload:', { orderIds: selectedIds })

                    return { orderIds: selectedIds }
                  })(),
                  onSuccess: async () => {
                    const result = await dispatch(fetchOrders({ page: 1, limit, force: true }))

                    setRowSelection({})
                    console.log('Merge Orders Success', result)
                  }
                }}
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
                dialogProps={{ type: 'duplicate-order', payload: { orderIds: selectedIds.slice(0, 1) } }}
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
              onChange={async e => {
                const newLimit = Number(e.target.value)

                console.log('newLimit', newLimit)
                onLimitChange?.(newLimit)
                await dispatch(fetchOrders({ limit: newLimit, force: true }))
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

      <CardContent className='flex items-center justify-between gap-3 '>
        <Autocomplete
          multiple
          fullWidth
          options={paymentMethodsArray}
          getOptionLabel={option => option.label}
          value={filters.paymentMethods || []}
          onChange={(e, newValue) => setFilters(prev => ({ ...prev, paymentMethods: newValue }))}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip key={option.value} variant='outlined' label={option.label} {...getTagProps({ index })} />
            ))
          }
          renderInput={params => (
            <TextField {...params} fullWidth placeholder='Payment Method' label='Payment Method' size='medium' />
          )}
        />
        <Autocomplete
          multiple
          fullWidth
          options={orderPlatformArray}
          getOptionLabel={option => option.label}
          value={filters.orderPlatform || []}
          onChange={(e, newValue) => setFilters(prev => ({ ...prev, orderPlatform: newValue }))}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip key={option.value} variant='outlined' label={option.label} {...getTagProps({ index })} />
            ))
          }
          renderInput={params => (
            <TextField {...params} fullWidth placeholder='Order Platform' label='Order Platform' size='medium' />
          )}
        />
        <Autocomplete
          multiple
          fullWidth
          options={orderStatusArray}
          getOptionLabel={option => option.label}
          value={filters.orderStatus || []}
          onChange={(e, newValue) => setFilters(prev => ({ ...prev, orderStatus: newValue }))}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip key={option.value} variant='outlined' label={option.label} {...getTagProps({ index })} />
            ))
          }
          renderInput={params => (
            <TextField {...params} fullWidth placeholder='Order Status' label='Order Status' size='medium' />
          )}
        />
        <Autocomplete
          multiple
          fullWidth
          options={paymentStatusArray}
          getOptionLabel={option => option.label}
          value={filters.paymentStatus || []}
          onChange={(e, newValue) => setFilters(prev => ({ ...prev, paymentStatus: newValue }))}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip key={option.value} variant='outlined' label={option.label} {...getTagProps({ index })} />
            ))
          }
          renderInput={params => (
            <TextField {...params} fullWidth placeholder='Payment Status' label='Payment Status' size='medium' />
          )}
        />
      </CardContent>

      <CardContent className='flex items-center justify-between gap-3'>
        <AmountRangePicker
          min={filters.minAmount}
          max={filters.maxAmount}
          onChange={([min, max]) =>
            setFilters(prev => ({
              ...prev,
              minAmount: min || '',
              maxAmount: max || ''
            }))
          }
        />
        <Autocomplete
          multiple
          fullWidth
          options={tagsArray}
          getOptionLabel={option => option.label}
          value={filters.tagsMap || []}
          onChange={(e, newValue) => setFilters(prev => ({ ...prev, tagsMap: newValue }))}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip key={option.value || index} {...getTagProps({ index })} variant='outlined' label={option.label} />
            ))
          }
          renderInput={params => <TextField {...params} fullWidth placeholder='Tags' label='Tags' size='medium' />}
        />
        <Autocomplete
          multiple
          fullWidth
          options={citiesArray}
          getOptionLabel={option => option.label}
          value={filters.pakistanCities || []}
          onChange={(e, newValue) => setFilters(prev => ({ ...prev, pakistanCities: newValue }))}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip key={option.value} variant='outlined' label={option.label} {...getTagProps({ index })} />
            ))
          }
          renderInput={params => <TextField {...params} fullWidth placeholder='City' label='City' size='medium' />}
        />
        <DialogActions className='justify-between px-1 py-0'>
          <div className='flex'>
            <Button
              onClick={() => {
                setFilters(emptyFilters)
                dispatch(fetchOrders({ page: 1, limit, filters: emptyFilters }))
                onFiltersChange?.(emptyFilters)

                // onPageChange?.(1)
              }}
              color='error'
              variant='tonal'
            >
              Reset Filters
            </Button>
            <Button
              onClick={() => {
                const apiFilters = mapFiltersToApiFormat(filters)

                dispatch(fetchOrders({ page: 1, limit, filters: apiFilters }))
                onFiltersChange?.(apiFilters)

                onPageChange?.(1)
              }}
              variant='contained'
            >
              Apply Filters
            </Button>
          </div>
        </DialogActions>
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
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  Loading orders...
                </td>
              </tr>
            ) : data.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className='no-scrollbar'
                      style={{
                        width: cell.column.columnDef.meta?.width || 'auto',
                        maxWidth: cell.column.columnDef.meta?.width || 'none',
                        overflow: 'scroll',
                        textOverflow: 'text-wrap',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
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
        count={total} // Use the total prop from parent, not pagination.total
        page={page - 1} // Use the page prop directly, not activePage
        onPageChange={(_e, newPage) => {
          const nextPage = newPage + 1

          console.log('Pagination click - newPage:', nextPage)
          onPageChange?.(nextPage) // This will call parent's setPage
        }}
        rowsPerPage={limit}
        onRowsPerPageChange={e => {
          const newLimit = Number(e.target.value)

          onLimitChange?.(newLimit) // Parent resets page to 1 and updates limit
        }}
        rowsPerPageOptions={[25, 50, 100]}
      />

      <TagEditDialog
        open={tagModal.open}
        initialTags={tagModal.tags}
        onClose={closeTagEditor}
        onSave={handleSaveTags}
        loading={loadings}
      />
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          variant="filled"
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Card>
  )
}

export default OrderListTable
