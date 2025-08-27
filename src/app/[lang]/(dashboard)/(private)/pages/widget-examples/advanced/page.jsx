// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import EmployeeList from '@views/pages/widget-examples/advanced/EmployeeList'
import Transactions from '@views/pages/widget-examples/advanced/Transactions'
import SharedEvent from '@views/pages/widget-examples/advanced/SharedEvent'
import PaymentData from '@views/pages/widget-examples/advanced/PaymentData'
import BusinessSharks from '@views/pages/widget-examples/advanced/BusinessSharks'
import UpgradePlan from '@views/pages/widget-examples/advanced/UpgradePlan'
import SalesByCountries from '@views/pages/widget-examples/advanced/SalesByCountries'
import OrderStatistics from '@views/pages/widget-examples/advanced/OrderStatistics'
import EarningReports from '@views/pages/widget-examples/advanced/EarningReports'
import TopCourses from '@views/pages/widget-examples/advanced/TopCourses'
import UpcomingWebinar from '@views/pages/widget-examples/advanced/UpcomingWebinar'
import AssignmentProgress from '@views/pages/widget-examples/advanced/AssignmentProgress'
import DeliveryPerformance from '@views/pages/widget-examples/advanced/DeliveryPerformance'
import OrdersByCountries from '@views/pages/widget-examples/advanced/OrdersByCountries'
import PopularInstructors from '@views/pages/widget-examples/advanced/PopularInstructors'
import ConversionRate from '@views/pages/widget-examples/advanced/ConversionRate'
import TopProducts from '@views/pages/widget-examples/advanced/TopProducts'
import TeamMembers from '@views/pages/widget-examples/advanced/TeamMembers'
import TableWithTabs from '@views/pages/widget-examples/advanced/TableWithTabs'
import ActivityTimeline from '@views/pages/widget-examples/advanced/ActivityTimeline'
import FinanceSummary from '@views/pages/widget-examples/advanced/FinanceSummary'

const Advanced = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <EmployeeList />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Transactions />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <SharedEvent />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <PaymentData />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <BusinessSharks />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <UpgradePlan />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <SalesByCountries />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <OrderStatistics />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <EarningReports />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <TopCourses />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <UpcomingWebinar />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <AssignmentProgress />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <DeliveryPerformance />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <OrdersByCountries />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <PopularInstructors />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <ConversionRate />
      </Grid>
      <Grid size={{ xs: 12, lg: 8 }}>
        <TopProducts />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TeamMembers />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TableWithTabs />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ActivityTimeline />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FinanceSummary />
      </Grid>
    </Grid>
  )
}

export default Advanced
