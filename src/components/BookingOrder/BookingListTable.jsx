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

import { DatePicker, Space } from 'antd'

const { RangePicker } = DatePicker

import classnames from 'classnames'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues
} from '@tanstack/react-table'
import {
  Alert,
  Autocomplete,
  DialogActions,
  InputAdornment,
  Snackbar,
  TextField,
  MenuItem,
  Drawer,
  Box,
  IconButton
} from '@mui/material'

import { rankItem } from '@tanstack/match-sorter-utils'

// import { DateRangePicker } from '@mui/lab'

import dayjs from 'dayjs'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

import TagEditDialog from '@/components/tagEdit/TagEditDialog'

import {
  cancelAwb,
  courierAssignment,
  downloadLoadSheet,
  fetchBookingOrder,
  fetchBookingOrders,

  // updateOrderCommentsAndRemarks,
  selectBookingOrdersPagination

  // updateOrdersStatusThunk
} from '@/redux-store/slices/bookingSlice'

// Components
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import EditCourierInfo from '@components/dialogs/edit-courier-info'

// import FilterModal from '../filterModal/page'

// Utils
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Styles
import tableStyles from '@core/styles/table.module.css'
import AmountRangePicker from '@/components/amountRangePicker/AmountRangePicker'
import StatusCell from '@/components/statusCell/StatusCell'
import TablePaginationComponent from '@/components/TablePaginationComponent'
import OrderDetails from '@/views/apps/ecommerce/orders/details'
import { postRequest } from '@/utils/api'
import ConfirmationDialog from '../dialogs/confirmation-dialog'
import { updateOrdersStatusThunk } from '@/redux-store/slices/order'

/* ---------------------------- helper maps --------------------------- */
export const paymentStatus = {
  paid: { text: 'Paid', color: 'success', colorClassName: 'text-success' },
  pending: { text: 'Pending', color: 'warning', colorClassName: 'text-warning' },
  cancelled: { text: 'Cancelled', color: 'secondary', colorClassName: 'text-secondary' },
  failed: { text: 'Failed', color: 'error', colorClassName: 'text-error' }
}

// export const orderPlatform = {
//   shopify: { text: 'Shopify', color: 'success', colorClassName: 'text-success' },
//   whatsapp: { text: 'Whatsapp', color: 'secondary', colorClassName: 'text-secondary' },
//   split: { text: 'Split', color: 'warning', colorClassName: 'text-warning' }
// }

export const courierPlatforms = {
  none: { text: 'None', color: 'default', colorClassName: 'text-default' },
  leopard: { text: 'Leopards', color: 'success', colorClassName: 'text-success' },
  daewoo: { text: 'Daewoo', color: 'secondary', colorClassName: 'text-secondary' },
  postEx: { text: 'PostEx', color: 'warning', colorClassName: 'text-warning' },
  mp: { text: 'M&P', color: 'error', colorClassName: 'text-error' },
  tcs: { text: 'TCS', color: 'primary', colorClassName: 'text-primary' }
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
  if (localFilters.courierPlatforms?.length > 0) {
    apiFilters.courierPlatforms = localFilters.courierPlatforms.map(item => item.value) // or join them
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

  if (label.includes('cod') || label.includes('cash on delivery (cod)') || label.includes('cash on delivery'))
    return 'cod'
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
const BookingListTable = ({
  orderData = [],
  loading = false,
  error = null,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onSearchChange,
  onFiltersChange
}) => {
  const { lang: locale } = useParams()
  const dispatch = useDispatch()
  const pagination = useSelector(selectBookingOrdersPagination)

  console.log(pagination, 'pagination')

  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' })
  const [editCourierData, setEditCourierData] = useState({ open: false, courier: null, remarks: '' })

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

  // Right-side details drawer state
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsOrderId, setDetailsOrderId] = useState(null)

  const openDetails = id => {
    setDetailsOrderId(id)
    setDetailsOpen(true)
  }

  const openTagEditor = (orderId, currentTags = []) => {
    const tag = Array.isArray(currentTags) ? (currentTags[0] ?? '') : (currentTags ?? '')

    setTagModal({ open: true, orderId, tags: [tag].filter(Boolean) })
  }
  console.log(orderData, 'orders in booking list table. here. ')
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
      dispatch(fetchBookingOrders({ page: pagination.currentPage, limit, force: true }))

      // dispatch(updateOrdersStatus({ id: idsArray, status: newStatus}))
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
  const handleBulkStatusChange = newStatus => updateOrdersStatus(selectedIds, newStatus)

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

      let shortFormNames = names.map(name => {
        if (name === 'Cash on Delivery (COD)') {
          return 'cod'
        }

        return name
      })

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

        // dispatchStatus: order.courier?.dispatchStatus,
        email: order.email,
        payment: order.financial_status?.toLowerCase() || 'pending',
        platform: order.courier?.name || 'none', // note: lowercase 'platform'
        status: order.orderStatus,

        // status: order?.courier?.dispatchStatus === 'cancelled' ? 'cancelled' : order.orderStatus,
        awb: order.courier?.awbLink || '',
        method: normalizePaymentMethod(shortFormNames),
        remarks: order.remarks,
        methodLabel: names[0] || 'Unknown',
        trackNumber: order.courier?.trackNumber || '',
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
      // console.warn('No tag to update, skipping request.')

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

      // console.error('Failed to update tag:', err)
    } finally {
      setLoadings(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => {
          return (
            <Checkbox
              checked={table.getIsAllRowsSelected()}
              indeterminate={table.getIsSomeRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
            />
          )
        },
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
            component='button'
            onClick={() => openDetails(row.original.id)}
            color='primary.main'
            className='cursor-pointer bg-transparent border-0 p-0'
          >
            #{row.original.orderNumber || '—'}
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
              <div>{`${dayName}, ${row.original.time || '—'}`}</div>
            </Typography>
          )
        }
      },

      // {
      //   accessorKey: 'customer',
      //   header: 'Customer Name',
      //   meta: { width: '250px' },
      //   cell: ({ row }) => (
      //     <div className='flex items-center gap-3'>
      //       {getAvatar(row.original)}
      //       <div className='flex flex-col'>
      //         <Typography
      //           variant='h6'
      //           component={Link}
      //           href={getLocalizedUrl(`/apps/ecommerce/customers/details/${row.original.customerId}`, locale)}
      //           className='hover:text-primary'
      //         >
      //           {row.original.customer || '—'}
      //         </Typography>
      //         <Typography variant='body2'>{row.original.email || '—'}</Typography>
      //       </div>
      //     </div>
      //   )
      // },
      {
        accessorKey: 'payment',
        header: 'Payment Status',
        meta: { width: '200px' },
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            {/* <i className={classnames('bx-bxs-circle bs-2 is-2', paymentStatus[row.original.payment].colorClassName)} /> */}
            <Typography
              // color={`${paymentStatus[row.original.payment]?.color || 'default'}.main`}
              className='font-medium '
            >
              {paymentStatus[row.original.payment]?.text || row.original.payment || 'Unknown'}
            </Typography>
          </div>
        )
      },
      {
        accessorKey: 'courier', // fixed: lowercase
        header: 'Courier',
        cell: ({ row }) => {
          const platformInfo = courierPlatforms[row.original.platform] ?? {
            text: row.original.platform || 'Unknown',
            color: 'default',
            colorClassName: 'text-secondary'
          }

          return (
            <OpenDialogOnElementClick
              element={Chip}
              elementProps={{
                label: courierPlatforms[row.original.platform]?.text || row.original.platform || 'Unknown',
                variant: 'outlined',
                size: 'small',
                className: 'cursor-pointer'
              }}
              dialog={EditCourierInfo}
              dialogProps={{
                data: (() => {
                  const inferCourierKey = name => {
                    if (!name) return 'none'
                    const n = String(name).toLowerCase()

                    if (n.includes('leopard')) return 'leopard'
                    if (n.includes('daewoo')) return 'daewoo'
                    if (n.includes('post')) return 'postEx'
                    if (n.includes('m&p') || n.includes('mp')) return 'mp'
                    if (n.includes('tcs')) return 'tcs'
                    return 'none'
                  }

                  const defaultCourier = inferCourierKey(row.original.platform)

                  return {
                    orderIds: [row.original.id],
                    courier: defaultCourier,
                    reason: ''
                  }
                })(),
                onSubmit: async (payload, controls) => {
                  try {
                    const courierApiMap = {
                      none: 'None',
                      leopard: 'Leopard',
                      daewoo: 'Daewoo',
                      postEx: 'PostEx',
                      mp: 'M&P',
                      tcs: 'TCS'
                    }

                    const body = {
                      orderId: [String(row.original.id)],
                      courier: courierApiMap[payload.courier] || payload.courier,
                      reason: payload.reason
                    }

                    const res = await dispatch(courierAssignment(body)).unwrap()

                    setAlert({ open: true, message: res?.message || 'Courier updated', severity: 'success' })
                    controls?.close()
                    controls?.reset()
                    await dispatch(fetchBookingOrders({ page, limit, force: true }))
                  } catch (err) {
                    setAlert({ open: true, message: err?.message || 'Failed to assign courier', severity: 'error' })
                  } finally {
                    controls?.done?.()
                  }
                }
              }}
            />
          )
        }
      },
      {
        accessorKey: 'status',
        header: 'Order Status',
        cell: props => {
          return <StatusCell {...props} onStatusChange={handleSingleStatusChange} />
        }
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

          // const rightText = m === 'card' ? row.original.methodNumber || label : label

          return (
            <div className='flex items-center gap-2'>
              <div className='flex justify-center items-center bg-[#F6F8FA] rounded-sm is-[29px] bs-[18px]'>
                <i className={`${iconClass} text-[18px]`} />
              </div>
              <Typography className='font-medium'>{m.toUpperCase()}</Typography>
            </div>
          )
        }
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        meta: { width: '250px' },
        cell: ({ row }) => {
          const remarks = row.original.remarks

          // normalize remarks (string → array of strings)
          const remarkList =
            typeof remarks === 'string'
              ? remarks
                  .split(',')
                  .map(r => r.trim())
                  .filter(Boolean)
              : Array.isArray(remarks)
                ? remarks.filter(Boolean)
                : []

          const hasRemarks = remarkList.length > 0

          return (
            <div className='flex flex-col gap-1'>
              {/* First row: Remarks */}
              <div className='flex gap-2 overflow-scroll no-scrollbar cursor-pointer'>
                {hasRemarks
                  ? remarkList.map((remark, i) => (
                      // <Chip key={i} label={remark} variant='tonal' size='small' color={getTagColor(remark)} />
                      <p key={i} className='text-gray-500'>
                        {remark}
                      </p>
                    ))
                  : '--'}
              </div>
            </div>
          )
        }
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
        accessorKey: 'Amount',
        header: 'Amount',
        filterFn: amountRangeFilterFn,
        cell: ({ row }) => (
          <Typography className='font-medium text-gray-800'>
            {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(row.original.Amount || '—')}
          </Typography>
        )
      },
      {
        accessorKey: 'city',
        header: 'City',
        meta: { width: '180px' },
        cell: ({ row }) => <Typography className='font-medium text-gray-800'>{row.original.city || '—'}</Typography>
      },
      {
        accessorKey: 'awb',
        header: 'Airway Bill',
        meta: { width: '250px' },
        cell: ({ row }) => {
          // if (row.original?.status === 'cancelled') {
          //   return <Chip label='Cancelled' variant='outlined' size='small' />
          // }

          if (row.original.platform === 'none') {
            return (
              <OpenDialogOnElementClick
                element={Chip}
                elementProps={{
                  label: 'Assign',
                  variant: 'outlined',
                  size: 'small',
                  className: 'cursor-pointer w-full'
                }}
                dialog={EditCourierInfo}
                dialogProps={{
                  data: (() => {
                    const firstSelected = table.getSelectedRowModel().flatRows[0]?.original

                    const inferCourierKey = name => {
                      if (!name) return 'none'
                      const n = String(name).toLowerCase()

                      if (n.includes('leopard')) return 'leopard'
                      if (n.includes('daewoo')) return 'daewoo'
                      if (n.includes('post')) return 'postEx'
                      if (n.includes('m&p') || n.includes('mp')) return 'mp'
                      if (n.includes('tcs')) return 'tcs'
                      return 'none'
                    }

                    const defaultCourier = inferCourierKey(firstSelected?.platform)

                    return {
                      orderIds: selectedIds.length > 0 ? selectedIds : [row.original.id],
                      courier: defaultCourier,
                      reason: ''
                    }
                  })(),
                  onSubmit: async (payload, controls) => {
                    try {
                      const courierApiMap = {
                        none: 'None',
                        leopard: 'Leopard',
                        daewoo: 'Daewoo',
                        postEx: 'PostEx',
                        mp: 'M&P',
                        tcs: 'TCS'
                      }

                      const freshSelectedIds = (() => {
                        const ids = table.getSelectedRowModel().flatRows.map(r => r.original.id)

                        return ids.length > 0 ? ids : [row.original.id]
                      })()

                      const body = {
                        orderId: freshSelectedIds.map(id => String(id)),
                        courier: courierApiMap[payload.courier] || payload.courier,
                        reason: payload.reason
                      }

                      const res = await dispatch(courierAssignment(body)).unwrap()

                      setAlert({ open: true, message: res?.message || 'Courier updated', severity: 'success' })
                      controls?.close()
                      controls?.reset()
                      setRowSelection({})
                      await dispatch(fetchBookingOrders({ page, limit, force: true }))
                    } catch (err) {
                      setAlert({ open: true, message: err?.message || 'Failed to assign courier', severity: 'error' })
                    } finally {
                      controls?.done?.()
                    }
                  }
                }}
              />
            )
          }

          if (row.original.awb) {
            return (
              <div className='flex flex-col gap-1'>
                <OpenDialogOnElementClick
                  element={Chip}
                  elementProps={{ label: 'Cancel', variant: 'outlined', size: 'small', className: 'cursor-pointer' }}
                  dialog={ConfirmationDialog}
                  dialogProps={{
                    type: 'cancel-awb',
                    payload: { trackNumbers: [row.original.trackNumber] },
                    onSuccess: async ({ trackNumbers }) => {
                      try {
                        const res = await dispatch(cancelAwb({ trackNumber: trackNumbers })).unwrap()

                        setAlert({ open: true, message: res?.message || 'AWB cancelled', severity: 'success' })
                        await dispatch(fetchBookingOrders({ page, limit, force: true }))
                      } catch (e) {
                        setAlert({ open: true, message: e?.message || 'Failed to cancel AWB', severity: 'error' })
                      }
                    }
                  }}
                />
                <Chip
                  label='View'
                  variant='outlined'
                  size='small'
                  onClick={() => window.open(row.original.awb, '_blank')}
                />
              </div>
            )
          }

          return (
            <div className='flex flex-col gap-1'>
              <OpenDialogOnElementClick
                element={Chip}
                elementProps={{ label: 'Create', variant: 'outlined', size: 'small', className: 'cursor-pointer' }}
                dialog={ConfirmationDialog}
                dialogProps={{ type: 'generate-airway-bill', payload: { orderIds: [row.original.id] } }}
              />
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
                  menuItemProps: {
                    onClick: () => openDetails(row.original.id),
                    className: 'flex items-center gap-2 is-full plb-2 pli-5'
                  }
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
    courierPlatforms: [],
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

  const courierPlatformsArray = Object.keys(courierPlatforms).map(key => ({
    value: key,
    label: courierPlatforms[key].text
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
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true

    // pageCount: total > 0 && limit > 0 ? Math.ceil(total / limit) : -1,
    // onPaginationChange: updater => {
    //   const current = { pageIndex: Math.max(0, page - 1), pageSize: limit || 25 }
    //   const next = typeof updater === 'function' ? updater(current) : updater
    //   const nextPage = (next.pageIndex ?? current.pageIndex) + 1
    //   const nextSize = next.pageSize ?? current.pageSize

    //   if (nextPage !== page) {
    //     onPageChange?.(nextPage)
    //   }

    //   if (nextSize !== limit) {
    //     onLimitChange?.(nextSize)
    //   }
    // }
  })

  const selectedCount = useMemo(() => Object.keys(rowSelection).length, [rowSelection])
  const selectedIds = table.getSelectedRowModel().flatRows.map(r => r.original.id)

  const emptyFilters = {
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    paymentMethods: [],
    courierPlatforms: [],
    statusChipColor: [],
    paymentStatus: [],
    tagsMap: [],
    pakistanCities: []
  }

  // if (error) {
  //   return (
  //     <Card>
  //       <CardContent className='flex items-center justify-between'>
  //         <Typography color='error'>Failed to fetch orders: {error?.message || String(error)}</Typography>
  //         <Button variant='contained'>Retry</Button>
  //       </CardContent>
  //     </Card>
  //   )
  // }
  console.log('selectedIds', rowSelection)
  return (
    <Card>
      <CardContent className='w-full flex items-center justify-between'>
        <div className='flex items-center gap-4 w-full'>
          {/* <Button variant='outlined' startIcon={<i className='bx-filter' />} onClick={() => setOpenFilter(true)}>
            Filter
          </Button> */}

          {/* <RangePicker
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
          /> */}

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
            placeholder='Search in booking order'
            delay={1000}
          />

          {/* <FilterModal
            open={openFilter}
            onClose={() => setOpenFilter(false)}
            initialFilters={rawFilters}
            onApply={appliedFilters => {
              setRawFilters(appliedFilters)

              dispatch(fetchBookingOrder({ page: 1, limit: 25, filters: appliedFilters }))

              // setColumnFilters(newColumnFilters)

              // notify parent to fetch with new filters
              onFiltersChange?.(appliedFilters)
              onPageChange?.(1)
              setOpenFilter(false)
            }}
          /> */}
          {/* <DateRangePicker /> */}

          {/* Add the Change Status button - only shows when orders are selected */}
          {selectedCount >= 1 && (
            <OpenDialogOnElementClick
              element={Button}
              elementProps={{ children: 'Change Courier', color: 'info', variant: 'tonal' }}
              dialog={EditCourierInfo}
              size='small'
              dialogProps={{
                data: (() => {
                  const firstSelected = table.getSelectedRowModel().flatRows[0]?.original

                  const inferCourierKey = name => {
                    if (!name) return 'none'
                    const n = String(name).toLowerCase()

                    if (n.includes('leopard')) return 'leopard'
                    if (n.includes('daewoo')) return 'daewoo'
                    if (n.includes('post')) return 'postEx'
                    if (n.includes('m&p') || n.includes('mp')) return 'mp'
                    if (n.includes('tcs')) return 'tcs'
                    return 'none'
                  }

                  const defaultCourier = inferCourierKey(firstSelected?.platform)

                  return {
                    orderIds: selectedIds,
                    courier: defaultCourier,
                    reason: ''
                  }
                })(),
                onSubmit: async (payload, controls) => {
                  try {
                    const courierApiMap = {
                      none: 'None',
                      leopard: 'Leopard',
                      daewoo: 'Daewoo',
                      postEx: 'PostEx',
                      mp: 'M&P',
                      tcs: 'TCS'
                    }

                    const freshSelectedIds = table.getSelectedRowModel().flatRows.map(r => r.original.id)

                    const body = {
                      orderId: freshSelectedIds.map(id => String(id)),
                      courier: courierApiMap[payload.courier] || payload.courier,
                      reason: payload.reason
                    }

                    const res = await dispatch(courierAssignment(body)).unwrap()

                    setAlert({ open: true, message: res?.message || 'Courier updated', severity: 'success' })
                    controls?.close()
                    controls?.reset()
                    setRowSelection({})
                    await dispatch(fetchBookingOrders({ page, limit, force: true }))
                  } catch (err) {
                    setAlert({ open: true, message: err?.message || 'Failed to assign courier', severity: 'error' })
                  } finally {
                    controls?.done?.()
                  }
                }
              }}
            />
          )}

          {selectedCount >= 1 && (
            <OpenDialogOnElementClick
              element={Button}
              elementProps={{ children: 'Download Load Sheet', color: 'primary', variant: 'tonal' }}
              dialog={ConfirmationDialog}
              size='small'
              dialogProps={{
                type: 'download-load-sheet',
                payload: { orderIds: selectedIds },
                onSuccess: async ({ orderIds }) => {
                  try {
                    const res = await dispatch(downloadLoadSheet({ orderIds })).unwrap()
                    const data = res?.data || res
                    const base64 = data?.base64
                    const filename = data?.filename || 'loadsheet.pdf'
                    const mimeType = data?.mimeType || 'application/pdf'

                    if (base64) {
                      const link = document.createElement('a')

                      link.href = `data:${mimeType};base64,${base64}`
                      link.download = filename
                      document.body.appendChild(link)
                      link.click()
                      link.remove()
                    }
                  } catch (e) {
                    console.error('Failed to download load sheet', e)
                  }
                }
              }}
            />
          )}
          {/* {selectedCount >= 2 ? (
          <OpenDialogOnElementClick
            element={Button}
            elementProps={{ children: 'Merge orders', color: 'secondary', variant: 'tonal' }}
            dialog={ConfirmationDialog}
            dialogProps={{
              type: 'merge-orders',
              payload: (() => {
                // console.log('Merge Payload:', { orderIds: selectedIds })

                return { orderIds: selectedIds }
              })(),
              onSuccess: async () => {
                const result = await dispatch(fetchBookingOrder({ page: 1, limit, force: true }))

                setRowSelection({})

                // console.log('Merge Orders Success', result)
              }
            }}
          />
        ) : (
          <Button color='secondary' variant='tonal' disabled size='small'>
            Merge orders
          </Button>
        )} */}

          {selectedCount >= 1 && (
            <OpenDialogOnElementClick
              element={Button}
              elementProps={{ children: 'Generate Airway Bill', color: 'primary', variant: 'tonal' }}
              dialog={ConfirmationDialog}
              dialogProps={{ type: 'generate-airway-bill', payload: { orderIds: selectedIds } }}
              size='small'
            />
          )}
        </div>

        <div className='flex max-sm:flex-col sm:items-center gap-4'>
          <CustomTextField
            select
            value={limit}
            onChange={async e => {
              const newLimit = Number(e.target.value)

              // console.log('newLimit', newLimit)
              onLimitChange?.(newLimit)
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
      </CardContent>

      <CardContent className='grid grid-cols-4 gap-3 '>
        <Autocomplete
          multiple
          fullWidth
          options={paymentMethodsArray}
          getOptionLabel={option => option.label}
          value={filters.paymentMethods || []}
          onChange={(e, newValue) => setFilters(prev => ({ ...prev, paymentMethods: newValue }))}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const props = getTagProps({ index })

              return (
                <Chip
                  {...props}
                  key={option.value || index} // override key
                  variant='outlined'
                  label={option.label}
                />
              )
            })
          }
          renderInput={params => (
            <TextField {...params} fullWidth placeholder='Payment Method' label='Payment Method' size='medium' />
          )}
        />
        <Autocomplete
          multiple
          fullWidth
          options={courierPlatformsArray}
          getOptionLabel={option => option.label}
          value={filters.courierPlatforms || []}
          onChange={(e, newValue) => setFilters(prev => ({ ...prev, courierPlatforms: newValue }))}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const props = getTagProps({ index })

              return (
                <Chip
                  {...props}
                  key={option.value || index} // override key
                  variant='outlined'
                  label={option.label}
                />
              )
            })
          }
          renderInput={params => (
            <TextField {...params} fullWidth placeholder='Courier' label='Courier' size='medium' />
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
            value.map((option, index) => {
              const props = getTagProps({ index })

              return (
                <Chip
                  {...props}
                  key={option.value || index} // override key
                  variant='outlined'
                  label={option.label}
                />
              )
            })
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
            value.map((option, index) => {
              const props = getTagProps({ index })

              return (
                <Chip
                  {...props}
                  key={option.value || index} // override key
                  variant='outlined'
                  label={option.label}
                />
              )
            })
          }
          renderInput={params => (
            <TextField {...params} fullWidth placeholder='Payment Status' label='Payment Status' size='medium' />
          )}
        />
      </CardContent>

      <CardContent className='grid grid-cols-4 gap-3'>
        <AmountRangePicker
          style={{ border: '1px solid #00000' }}
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
            value.map((option, index) => {
              const props = getTagProps({ index })

              return (
                <Chip
                  {...props}
                  key={option.value || index} // override key
                  variant='outlined'
                  label={option.label}
                />
              )
            })
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
            value.map((option, index) => {
              const props = getTagProps({ index })

              return (
                <Chip
                  {...props}
                  key={option.value || index} // override key
                  variant='outlined'
                  label={option.label}
                />
              )
            })
          }
          renderInput={params => <TextField {...params} fullWidth placeholder='City' label='City' size='medium' />}
        />
        <DialogActions className='justify-between px-1 py-0'>
          <div className='flex'>
            <Button
              onClick={() => {
                setFilters(emptyFilters)
                dispatch(fetchBookingOrder({ page: 1, limit, filters: emptyFilters }))
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

                dispatch(fetchBookingOrder({ page: 1, limit, filters: apiFilters }))
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
      <TablePaginationComponent
        table={table}
        count={pagination.total || 0} // Use the total prop from parent, not pagination.total
        page={pagination?.currentPage - 1 || 0} // Use the page prop directly, not activePage
        onPageChange={(_e, newPage) => {
          onPageChange?.(newPage + 1) // This will call parent's setPage
        }}
        rowsPerPage={pagination.itemsPerPage || limit} // Use the limit prop directly, not pagination.itemsPerPage
        onRowsPerPageChange={e => onLimitChange(Number(e.target.value))}
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
        <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity} variant='filled'>
          {alert.message}
        </Alert>
      </Snackbar>
      {/* Right-side Drawer for order details */}
      <Drawer
        anchor='right'
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: '80vw' } } }}
      >
        <Box className='p-4 overflow-auto' sx={{ height: '100%' }}>
          <div className='flex justify-end'>
            <IconButton onClick={() => setDetailsOpen(false)} aria-label='Close'>
              <i className='bx-x text-2xl' />
            </IconButton>
          </div>
          {detailsOrderId ? <OrderDetails id={detailsOrderId} /> : null}
        </Box>
      </Drawer>
    </Card>
  )
}

export default BookingListTable
