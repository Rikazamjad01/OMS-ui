// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import CustomerRatings from '@views/pages/widget-examples/charts/CustomerRatings'
import SalesStats from '@views/pages/widget-examples/charts/SalesStats'
import SalesAnalytics from '@views/pages/widget-examples/charts/SalesAnalytics'
import OverviewSalesActivity from '@views/pages/widget-examples/charts/OverviewSalesActivity'
import TotalIncome from '@views/pages/widget-examples/charts/TotalIncome'
import FinancialStatsTabs from '@views/pages/widget-examples/charts/FinancialStatsTabs'
import Performance from '@views/pages/widget-examples/charts/Performance'
import TotalBalance from '@views/pages/widget-examples/charts/TotalBalance'
import Score from '@views/pages/widget-examples/charts/Score'
import TotalRevenueReport from '@views/pages/widget-examples/charts/TotalRevenueReport'
import VehicleOverview from '@views/pages/widget-examples/charts/VehicleOverview'
import ShipmentStatistics from '@views/pages/widget-examples/charts/ShipmentStatistics'
import InterestedTopics from '@views/pages/widget-examples/charts/InterestedTopics'
import DeliveryExceptions from '@views/pages/widget-examples/charts/DeliveryExceptions'
import SessionsOverview from '@views/pages/widget-examples/charts/SessionsOverview'

const Charts = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6, xl: 4 }}>
        <CustomerRatings />
      </Grid>
      <Grid size={{ xs: 12, md: 6, xl: 4 }}>
        <SalesStats />
      </Grid>
      <Grid size={{ xs: 12, md: 6, xl: 4 }}>
        <SalesAnalytics />
      </Grid>
      <Grid size={{ xs: 12, md: 6, xl: 4 }}>
        <OverviewSalesActivity />
      </Grid>
      <Grid size={{ xs: 12, xl: 8 }}>
        <TotalIncome />
      </Grid>
      <Grid size={{ xs: 12, md: 6, xl: 4 }}>
        <FinancialStatsTabs />
      </Grid>
      <Grid size={{ xs: 12, md: 6, xl: 4 }}>
        <Performance />
      </Grid>
      <Grid size={{ xs: 12, md: 6, xl: 4 }}>
        <TotalBalance />
      </Grid>
      <Grid size={{ xs: 12, md: 6, xl: 4 }}>
        <Score />
      </Grid>
      <Grid size={{ xs: 12, xl: 8 }}>
        <TotalRevenueReport />
      </Grid>
      <Grid size={{ xs: 12, xl: 6 }}>
        <VehicleOverview />
      </Grid>
      <Grid size={{ xs: 12, xl: 6 }}>
        <ShipmentStatistics />
      </Grid>
      <Grid size={{ xs: 12, xl: 8 }}>
        <InterestedTopics />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <DeliveryExceptions />
      </Grid>
      <Grid size={{ xs: 12, md: 8, xl: 6 }}>
        <SessionsOverview />
      </Grid>
    </Grid>
  )
}

export default Charts
