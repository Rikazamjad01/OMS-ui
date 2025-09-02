// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const safely = val => (val === undefined || val === null ? 'Not available' : val)

const CustomerStatsCard = props => {
  const {
    title,
    avatarIcon,
    color,
    description,

    // API fields
    totalOrders,
    completedOrdersByCustomer,
    confirmedOrders,
    pendingOrders,
    notDelivered,

    fakeShopifyOrders,
    fakeManualOrders,

    platform,
    device,
    campaign,
    products,
    purchasedCategory,
  } = props

  // Safely compute values
  const successfullyDelivered = completedOrdersByCustomer ?? 0
  const confirmed = confirmedOrders ?? 0
  const Pending = pendingOrders ?? 0
  const failedOrders = notDelivered ?? 0

  const totalFakeOrders = (Number(fakeShopifyOrders ?? 0) + Number(fakeManualOrders ?? 0))

  const shopifyOrders = platform === "shopify" ? 1 : 0
  const manualOrders = platform === "manual" ? 1 : 0
  const splitOrders = platform === "split" ? 1 : 0

  // const purchasedCategory = products?.[0]?.category

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 h-52">

        {/* Title */}
        <Typography variant="h5" className="capitalize flex items-center gap-2 mb-5">
          <CustomAvatar variant="rounded" skin="light" color={color} size={25} className="p-1">
            <i className={avatarIcon} />
          </CustomAvatar>
          {title}
        </Typography>

        <div className="flex flex-col items-start gap-1">
          {/* Case 1: Delivery stats */}
          {totalOrders !== undefined &&
            <div className="flex flex-col gap-4">
              <Typography variant="body1">
                Total Orders: <strong>{safely(totalOrders)}</strong>
              </Typography>
              <Grid container spacing={4}>
                <div className='grid grid-cols-2 space-x-5'>
                  <div className='flex flex-col gap-2'>
                    <Typography variant="body2">
                      Delivered: <strong>{safely(successfullyDelivered)}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Pending: <strong>{safely(Pending)}</strong>
                    </Typography>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <Typography variant="body2">
                      Confirmed: <strong>{safely(confirmed)}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Not Delivered: <strong>{safely(failedOrders)}</strong>
                    </Typography>
                  </div>
                </div>

              </Grid>
            </div>
          }

          {/* Case 2: Fake orders */}
          {(title === 'Fake Orders') && (
            <div className="flex flex-col gap-4">
              <Typography variant="body1">
                Total Fake Orders: <strong>{safely(totalFakeOrders)}</strong>
              </Typography>
              <Grid container spacing={12}>
                <div className='flex flex-col gap-5'>
                  <Typography variant="body2">
                    Shopify: <strong>{safely(fakeShopifyOrders ?? 0)}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Manual: <strong>{safely(fakeManualOrders ?? 0)}</strong>
                  </Typography>
                </div>
              </Grid>
            </div>
          )}

          {/* Case 3: Channel orders */}
          {(shopifyOrders > 0 || manualOrders > 0 || splitOrders > 0) && (
            <Grid container spacing={12}>
              <div className='flex flex-col gap-5'>
                <Typography variant="body2">
                  Shopify Orders: <strong>{safely(shopifyOrders)}</strong>
                </Typography>
                <Typography variant="body2">
                  Manual Orders: <strong>{safely(manualOrders)}</strong>
                </Typography>
                <Typography variant="body2">
                  Split Orders: <strong>{safely(splitOrders)}</strong>
                </Typography>
              </div>
            </Grid>
          )}

          {/* Case 4: Acquisition */}
          {device || campaign ? (
            <Grid container spacing={5}>
              <Typography variant="body2">
                Device: <strong>{safely(device)}</strong>
              </Typography>
              <Typography variant="body2">
                Campaign: <strong>{safely(campaign)}</strong>
              </Typography>
            </Grid>
          ) : null}

          {/* Case 5: Purchased category */}
          {purchasedCategory !== undefined && (
          <Grid container spacing={12}>
            <Typography variant="body2">
              Mostly Purchased Items: <strong>{safely(purchasedCategory)}</strong>
            </Typography>
          </Grid>
          )}

          {/* Always show description */}
          <Typography variant="body2" className='mt-4'>{description}</Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerStatsCard
