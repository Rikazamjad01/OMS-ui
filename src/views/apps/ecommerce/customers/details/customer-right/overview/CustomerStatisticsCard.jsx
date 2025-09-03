import Grid from '@mui/material/Grid2'

import CustomerStatsCard from '@/components/card-statistics/CustomerStats'

const CustomerStatisticsCard = ({ order }) => {
  if (!order) return null

  const computeAggregatedStats = orders => {
    // Ensure we have an array
    const orderArray = Array.isArray(orders) ? orders : [orders]

    console.log(orderArray, 'orderArray in computeAggregatedStats')

    // Initialize counters
    let stats = {
      completedOrdersByCustomer: 0,
      confirmedOrders: 0,
      pendingOrders: 0,
      notDelivered: 0,
      fakeShopifyOrders: 0,
      fakeManualOrders: 0,
      shopifyOrders: 0,
      manualOrders: 0,
      splitOrders: 0,
      totalOrders: orderArray.length,

      // For single values, we'll take from the first order or customer data
      device: null,
      campaign: null,
      category: null,
      platform: null
    }

    // Aggregate data from all orders
    orderArray.forEach((orderItem, index) => {
      console.log(`Order ${index + 1} platform:`, orderItem.platform)
      console.log(`Order ${index + 1} status:`, orderItem.orderStatus, orderItem.financial_status)

      // Count by status
      if (orderItem.orderStatus === 'completed' || orderItem.financial_status === 'completed') {
        stats.completedOrdersByCustomer++
      }

      if (orderItem.orderStatus === 'confirmed' || orderItem.financial_status === 'confirmed') {
        stats.confirmedOrders++
      }

      if (orderItem.orderStatus === 'pending' || orderItem.financial_status === 'pending') {
        stats.pendingOrders++
      }

      if (orderItem.orderStatus === 'cancelled' || orderItem.financial_status === 'cancelled') {
        stats.notDelivered++
      }

      // Count by platform
      if (orderItem.platform === 'shopify') {
        stats.shopifyOrders++
      }

      if (orderItem.platform === 'manual') {
        stats.manualOrders++
      }

      if (orderItem.platform === 'split') {
        stats.splitOrders++
      }

      // Count fake orders (you'll need to define your logic for detecting fake orders)
      if (orderItem.is_fake_shopify) {
        stats.fakeShopifyOrders++
      }

      if (orderItem.is_fake_manual) {
        stats.fakeManualOrders++
      }

      // For single values, take from first order if not already set
      if (!stats.device && orderItem.device) {
        stats.device = orderItem.device
      }

      if (!stats.campaign && orderItem.campaign) {
        stats.campaign = orderItem.campaign
      }

      if (!stats.category && orderItem.category) {
        stats.category = orderItem.category
      }

      if (!stats.platform && orderItem.platform) {
        stats.platform = orderItem.platform
      }
    })

    // If we have customer data, use that for total orders count
    if (orderArray[0]?.customerData?.orders_count) {
      stats.totalOrders = orderArray[0].customerData.orders_count
    }

    return stats
  }

  // Compute aggregated stats from all orders
  const stats = computeAggregatedStats(order)

  // Build five cards — always show
  const cards = [
    {
      title: 'Order Overview',
      avatarIcon: 'bx-user',
      color: 'primary',
      totalOrders: stats.totalOrders ?? 'Not available',
      completedOrdersByCustomer: stats.completedOrdersByCustomer ?? '0',
      confirmedOrders: stats.confirmedOrders ?? '0',
      pendingOrders: stats.pendingOrders ?? '0',
      notDelivered: stats.notDelivered ?? '0'
    },
    {
      title: 'Fake Orders',
      avatarIcon: 'bx-error',
      color: 'error',
      fakeShopifyOrders: stats.fakeShopifyOrders ?? '0',
      fakeManualOrders: stats.fakeManualOrders ?? '0'
    },
    {
      title: 'Channel Orders',
      avatarIcon: 'bx-store',
      color: 'success',
      shopifyOrders: stats.shopifyOrders ?? '0',
      manualOrders: stats.manualOrders ?? '0',
      splitOrders: stats.splitOrders ?? '0',
      platform: stats.platform
    },
    {
      title: 'Acquisition Strategy',
      avatarIcon: 'bx-target-lock',
      color: 'warning',
      device: stats.device ?? 'Not found',
      campaign: stats.campaign ?? 'No campaign available'
    },
    {
      title: 'Purchased Category',
      avatarIcon: 'bx-package',
      color: 'info',
      purchasedCategory: stats.category ?? 'General Category'
    }
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
