// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const CustomerStatsCard = props => {
  const {
    title = "Customer Stats",
    avatarIcon = "tabler-user", // fallback icon
    color = "primary",
    description = "Customer orders statistics",

    // API fields
    completedOrdersByCustomer, // ✅ delivered
    partiallyDelivered,        // ✅ from orderStatus
    notDelivered,              // ✅ from orderStatus

    fakeShopifyOrders,
    fakeManualOrders,

    platform,                  // ✅ shopify/manual check
    device,                    // ❌ not available → keep as is
    campaign,                  // ❌ not available → keep as is
    products                   // ✅ use for purchasedCategory
  } = props

  // Safely compute values
  const successfullyDelivered = completedOrdersByCustomer ?? 0
  const partialOrders = partiallyDelivered ?? 0
  const failedOrders = notDelivered ?? 0

  const totalFakeOrders = (fakeShopifyOrders ?? 0) + (fakeManualOrders ?? 0)

  const shopifyOrders = platform === "shopify" ? successfullyDelivered : 0
  const manualOrders = platform === "manual" ? successfullyDelivered : 0

  const purchasedCategory =
    products?.[0]?.category || "General Products"

  return (
    <Card>
      <CardContent className="flex flex-col gap-2">

        {/* Title */}
        <Typography variant="h5" className="capitalize flex items-center gap-2">
          <CustomAvatar variant="rounded" skin="light" color={color} size={25}>
            <i className={avatarIcon} />
          </CustomAvatar>
          {title}
        </Typography>

        <div className="flex flex-col items-start gap-1">
          {/* Case 1: Delivery stats */}
          <div className="flex flex-col gap-1">
            <Typography variant="body1">
              Total Orders: <strong>{successfullyDelivered + partialOrders + failedOrders}</strong>
            </Typography>
            <Grid container spacing={12}>
              <Typography variant="body2">
                Delivered: <strong>{successfullyDelivered}</strong>
              </Typography>
              <Typography variant="body2">
                Partial: <strong>{partialOrders}</strong>
              </Typography>
              <Typography variant="body2">
                Not Delivered: <strong>{failedOrders}</strong>
              </Typography>
            </Grid>
          </div>

          {/* Case 2: Fake orders */}
          {totalFakeOrders > 0 && (
            <div className="flex flex-col gap-1">
              <Typography variant="body1">
                Total Fake Orders: <strong>{totalFakeOrders}</strong>
              </Typography>
              <Grid container spacing={12}>
                <Typography variant="body2">
                  Shopify: <strong>{fakeShopifyOrders ?? 0}</strong>
                </Typography>
                <Typography variant="body2">
                  Manual: <strong>{fakeManualOrders ?? 0}</strong>
                </Typography>
              </Grid>
            </div>
          )}

          {/* Case 3: Channel orders */}
          {(shopifyOrders > 0 || manualOrders > 0) && (
            <Grid container spacing={12}>
              <Typography variant="body2">
                Shopify: <strong>{shopifyOrders}</strong>
              </Typography>
              <Typography variant="body2">
                Manual: <strong>{manualOrders}</strong>
              </Typography>
            </Grid>
          )}

          {/* Case 4: Acquisition */}
          {device || campaign ? (
            <Grid container spacing={12}>
              <Typography variant="body2">
                Device: <strong>{device || "N/A"}</strong>
              </Typography>
              <Typography variant="body2">
                Campaign: <strong>{campaign || "N/A"}</strong>
              </Typography>
            </Grid>
          ) : null}

          {/* Case 5: Purchased category */}
          <Grid container spacing={12}>
            <Typography variant="body2">
              Mostly Purchased Items: <strong>{purchasedCategory}</strong>
            </Typography>
          </Grid>

          {/* Always show description */}
          <Typography variant="body2">{description}</Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerStatsCard
