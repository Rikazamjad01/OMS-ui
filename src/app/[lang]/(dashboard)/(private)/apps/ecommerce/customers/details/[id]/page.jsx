// Component Imports
import CustomerDetails from '@/views/apps/ecommerce/customers/details'

// This is a server component, so async/await is allowed
export default async function CustomerDetailsPage({ params }) {
  // Await the params if they're a promise (Next.js 13+)
  const resolvedParams = await params
  const customerId = resolvedParams?.id ?? null

  return <CustomerDetails customerId={customerId} />
}
