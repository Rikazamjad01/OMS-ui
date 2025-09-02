import Grid from '@mui/material/Grid2'

import CustomerStatsCard from "@/components/card-statistics/CustomerStats"

const CustomerStatisticsCard = ({ order }) => {
  if (!order) return null

  console.log(order, 'order in CustomerStatisticsCard')

  const computeStatsFromOrder = (props = {}) => {
    const {
      // some defaults
      title,
      avatarIcon,
      color,
      description,

      // fields you expect in an order
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
      totalOrdersByCustomer,
      orderStatus,
      category,
    } = props

    const confirmedOrdersByCustomer = orderStatus === 'confirmed' ? 1 : 0
    const shopifyOrders = platform === 'shopify' ? 1 : 0
    const manualOrders = platform === 'manual' ? 1 : 0
    const splitOrders = platform === 'split' ? 1 : 0

    const totalOrders = customerData?.orders_count ?? totalOrdersByCustomer ?? 0


    // return a clean “stats” object
    return {
      title,
      avatarIcon,
      color,
      description,
      completedOrdersByCustomer,
      confirmedOrders: confirmedOrdersByCustomer,
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
      splitOrders,
      totalOrders,
      category,
    }
  }


  // normalize single vs multiple
  const o = Array.isArray(order) ? order[0] : order
  const stats = computeStatsFromOrder(o)

  // Build five cards — always show
  const cards = [
    {
      title: 'Order Overview',
      avatarIcon: 'bx-user',
      color: 'primary',

      // description: 'Customer orders statistics',
      totalOrders: stats.totalOrders ?? 'Not available',
      completedOrdersByCustomer: stats.completedOrdersByCustomer ?? '0',
      confirmedOrders: stats.confirmedOrders ?? '0',
      pendingOrders: stats.pendingOrders ?? '0',
      notDelivered: stats.notDelivered ?? '0',
    },
    {
      title: 'Fake Orders',
      avatarIcon: 'bx-error',
      color: 'error',

      // description: 'Potential fake orders detected',
      fakeShopifyOrders: stats.fakeShopifyOrders ?? '0',
      fakeManualOrders: stats.fakeManualOrders ?? '0',
    },
    {
      title: 'Channel Orders',
      avatarIcon: 'bx-store',
      color: 'success',

      // description: 'Channel wise orders',
      shopifyOrders: stats.shopifyOrders ?? '0',
      manualOrders: stats.manualOrders ?? '0',
      splitOrders: stats.splitOrders ?? '0',
      platform: stats.platform,
    },
    {
      title: 'Acquisition Strategy',
      avatarIcon: 'bx-target-lock',
      color: 'warning',

      // description: 'Acquisition strategy for customer',
      device: stats.device ?? 'Not found',
      campaign: stats.campaign ?? 'No campaign available',
    },
    {
      title: 'Purchased Category',
      avatarIcon: 'bx-package',
      color: 'info',
      purchasedCategory: stats.category ?? 'General Category',
    },
  ]

  return (
    <div className='flex flex-wrap gap-5 justify-between'>
      {cards.map((card, idx) => (
        <Grid size={{ xs: 6 }} key={idx}>
          <CustomerStatsCard {...card} />
        </Grid>
      ))}
    </div>
  )
}

export default CustomerStatisticsCard
