"use client"

// Component Imports
import { usePathname } from 'next/navigation'

import LayoutNavbar from '@layouts/components/vertical/Navbar'
import NavbarContent from './NavbarContent'

const Navbar = () => {
  const router = usePathname()
  const path = router.split('/')[2]

  if (path === 'reports') {
    return null
  }

  return (
    <LayoutNavbar>
      <NavbarContent />
    </LayoutNavbar>
  )
}

export default Navbar
