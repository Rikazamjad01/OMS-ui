// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const CustomerStatsCard = ({ statsData }) => {
  if (!statsData || !Array.isArray(statsData)) return null

  return (
    <Grid container spacing={6}>
      {statsData.map((item, index) => (
        <Grid key={index} size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent className="flex flex-col gap-2">

              <Typography variant="h5" className="capitalize flex items-center gap-2">
                <CustomAvatar variant="rounded" skin="light" color={item.color} size={25}>
                  <i className={item.avatarIcon} />
                </CustomAvatar>
                {item.title}
              </Typography>

              <div className="flex flex-col items-start gap-1">
                {/* Case 1: show order delivery stats */}
                {item.orders_count !== undefined ? (
                  <div className="flex flex-col gap-1">
                    <Typography variant="body1">
                      Total Orders:{' '}
                      <strong>
                        {item.orders_count + item.partiallyDelivered + item.notDelivered}
                      </strong>
                    </Typography>
                    <Grid container spacing={12}>
                      <Typography variant="body2">
                        Delivered: <strong>{item.successfullyDelivered}</strong>
                      </Typography>
                      <Typography variant="body2">
                        Partial: <strong>{item.partiallyDelivered}</strong>
                      </Typography>
                      <Typography variant="body2">
                        Not Delivered: <strong>{item.notDelivered}</strong>
                      </Typography>
                    </Grid>
                  </div>
                ) : null}

                {/* Case 2: fake orders */}
                {item.fakeShopifyOrders !== undefined ? (
                  <div className="flex flex-col gap-1">
                    <Typography variant="body1">
                      Total Fake Orders:{' '}
                      <strong>{item.fakeShopifyOrders + item.fakeManualOrders}</strong>
                    </Typography>
                    <Grid container spacing={12}>
                      <Typography variant="body2">
                        Shopify: <strong>{item.fakeShopifyOrders}</strong>
                      </Typography>
                      <Typography variant="body2">
                        Manual: <strong>{item.fakeManualOrders}</strong>
                      </Typography>
                    </Grid>
                  </div>
                ) : null}

                {/* Case 3: channel orders */}
                {item.shopifyOrders !== undefined && item.manualOrders !== undefined ? (
                  <Grid container spacing={12}>
                    <Typography variant="body2">
                      Shopify: <strong>{item.shopifyOrders}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Manual: <strong>{item.manualOrders}</strong>
                    </Typography>
                  </Grid>
                ) : null}

                {/* Case 4: acquisition strategy */}
                {item.device && item.campaign ? (
                  <Grid container spacing={12}>
                    <Typography variant="body2">
                      Device: <strong>{item.device}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Campaign: <strong>{item.campaign}</strong>
                    </Typography>
                  </Grid>
                ) : null}

                {/* Case 5: Purchased products Category */}
                {item.purchasedCategory !== undefined ? (
                  <Grid container spacing={12}>
                    <Typography variant="body2">
                      Mostly Purchased items: <strong>{item.purchasedCategory}</strong>
                    </Typography>
                  </Grid>
                ) : null}

                {/* Always show description */}
                <Typography variant="body2">{item.description}</Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default CustomerStatsCard
