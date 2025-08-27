// MUI Imports
import Grid from '@mui/material/Grid2'

// Components Imports
import CustomerRatings from '@/views/dashboards/sales/CustomerRatings'
import OverviewSalesActivity from '@/views/dashboards/sales/OverviewSalesActivity'
import LineAreaSessionsChart from '@/views/dashboards/sales/LineAreaSessionsChart'
import Vertical from '@components/card-statistics/Vertical'
import DonutChartGeneratedLeads from '@/views/dashboards/sales/DonutChartGeneratedLeads'
import TopProducts from '@/views/dashboards/sales/TopProducts'
import EarningReports from '@/views/dashboards/sales/EarningReports'
import SalesAnalytics from '@/views/dashboards/sales/SalesAnalytics'
import SalesByCountries from '@/views/dashboards/sales/SalesByCountries'
import SalesStats from '@/views/dashboards/sales/SalesStats'
import TeamMembers from '@/views/dashboards/sales/TeamMembers'
import CustomersTable from '@/views/dashboards/sales/CustomersTable'

const DashboardSales = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6, xl: 4 }}>
        <CustomerRatings />
      </Grid>
      <Grid size={{ xs: 12, md: 6, xl: 4 }}>
        <OverviewSalesActivity />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 6 }}>
            <LineAreaSessionsChart />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 6 }}>
            <Vertical
              title='order'
              imageSrc='/images/cards/cube-secondary-bg.png'
              stats='$1,286'
              trendNumber={13.24}
              trend='negative'
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 12 }}>
            <DonutChartGeneratedLeads />
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, lg: 8 }}>
        <TopProducts />
      </Grid>
      <Grid size={{ xs: 12, md: 6, xl: 4 }}>
        <EarningReports />
      </Grid>
      <Grid size={{ xs: 12, md: 6, xl: 4 }}>
        <SalesAnalytics />
      </Grid>
      <Grid size={{ xs: 12, md: 6, xl: 4 }}>
        <SalesByCountries />
      </Grid>
      <Grid size={{ xs: 12, md: 6, xl: 4 }}>
        <SalesStats />
      </Grid>
      <Grid size={{ xs: 12, xl: 5 }}>
        <TeamMembers />
      </Grid>
      <Grid size={{ xs: 12, xl: 7 }}>
        <CustomersTable />
      </Grid>
    </Grid>
  )
}

export default DashboardSales
