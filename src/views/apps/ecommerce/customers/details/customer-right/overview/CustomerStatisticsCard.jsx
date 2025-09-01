// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import CustomerStatsCard from '@/components/card-statistics/CustomerStats'

// Helper to safely compute stats (taken from earlier logic)
const computeStatsFromOrder = (props = {}) => {
  const {
    title = 'Order Stats',
    avatarIcon = 'bx-user',
    color = 'primary',
    description = 'Customer orders statistics',

    completedOrdersByCustomer,
    pendingOrdersByCustomer,
    cancelledOrdersByCustomer,

    fakeShopifyOrders,
    fakeManualOrders,

    platform,
    device,
    campaign,

    products,
    productData,
    line_items,
    customerData,
    totalOrdersByCustomer
  } = props

  // ✅ Correct mapping for Shopify vs Manual
  const shopifyOrders = platform === 'shopify' ? (totalOrdersByCustomer ?? 0) : 0
  const manualOrders = platform === 'manual' ? (totalOrdersByCustomer ?? 0) : 0

  const purchasedCategory =
    products?.[0]?.category ||
    productData?.[0]?.vendor ||
    productData?.[0]?.title ||
    line_items?.[0]?.name ||
    'General Products'


  const totalOrders = customerData?.orders_count ?? totalOrdersByCustomer ?? 0

  return {
    title,
    avatarIcon,
    color,
    description,
    completedOrdersByCustomer,
    pendingOrders: pendingOrdersByCustomer,
    notDelivered: cancelledOrdersByCustomer,
    fakeShopifyOrders,
    fakeManualOrders,
    platform,
    device,
    campaign,
    products,
    shopifyOrders,
    manualOrders,
    purchasedCategory,
    totalOrders
  }
}


const CustomerStatisticsCard = ({ order }) => {
  if (!order) return null

  const ordersArray = Array.isArray(order) ? order : [order]

  return (
    <Grid container spacing={6}>
      {ordersArray.map((o, idx) => {
        const stats = computeStatsFromOrder(o)

        return (
          <Grid size={{ xs: 12, md: 6 }} key={o?.id ?? idx}>
            <CustomerStatsCard {...stats} />
          </Grid>
        )
      })}
    </Grid>
  )
}

export default CustomerStatisticsCard
