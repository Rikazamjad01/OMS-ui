// Component Imports
import Fleet from '@/views/logistics/fleet'

const FleetPage = () => {
  return <Fleet mapboxAccessToken={process.env.MAPBOX_ACCESS_TOKEN} />
}

export default FleetPage
