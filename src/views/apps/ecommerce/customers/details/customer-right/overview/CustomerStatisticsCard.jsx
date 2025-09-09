import Grid from '@mui/material/Grid2'

import CustomerStatsCard from '@/components/card-statistics/CustomerStats'

export const parseDeviceName = (userAgent = '') => {
  const ua = userAgent.toLowerCase()

  if (ua.includes('android')) return 'Android'
  if (ua.includes('iphone')) return 'iPhone'
  if (ua.includes('ipad')) return 'iPad'
  if (ua.includes('macintosh') || ua.includes('mac os')) return 'Macintosh'
  if (ua.includes('windows')) return 'Windows'
  if (ua.includes('linux')) return 'Linux'

  return 'Unknown Device'
}

const CustomerStatisticsCard = ({ customerData }) => {
  if (!customerData) return null

  // Extract customer and stats safely
  const customer = customerData.customer || {}
  const stats = customerData.stats || {}

  // Build cards directly from API-provided stats
  const cards = [
    {
      title: 'Order Overview',
      avatarIcon: 'bx-user',
      color: 'primary',
      totalOrders: stats.total_orders ?? customer.orders_count ?? 0,
      completedOrdersByCustomer: stats.completed_orders ?? 0,
      confirmedOrders: stats.processing_orders ?? 0, // or however you define confirmed
      pendingOrders: stats.pending_orders ?? 0,
      notDelivered: stats.cancelled_orders ?? 0
    },
    {
      title: 'Defaulter Status',
      avatarIcon: 'bx-error',
      color: 'error',
      fakeShopifyOrders: stats.fake_shopify_orders ?? 0, // if backend provides
      fakeManualOrders: stats.fake_manual_orders ?? 0 // if backend provides
    },
    {
      title: 'Channel Wise Orders',
      avatarIcon: 'bx-store',
      color: 'success',
      shopifyOrders: stats.shopify_orders ?? 0,
      manualOrders: stats.whatsapp_orders ?? 0, // guess: manual = whatsapp?
      splitOrders: stats.split_orders ?? 0,
      platform: customer.previousOrders?.[0]?.platform ?? 'N/A'
    },
    {
      title: 'Acquisition Strategy',
      avatarIcon: 'bx-target-lock',
      color: 'warning',
      device: parseDeviceName(stats.device) ?? 'Not found',
      campaign: customer.previousOrders?.[0]?.campaign ?? 'No campaign available'
    },
    {
      title: 'Purchased Category',
      avatarIcon: 'bx-package',
      color: 'info',
      purchasedCategory: customer.previousOrders?.[0]?.category ?? 'General Category'
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
