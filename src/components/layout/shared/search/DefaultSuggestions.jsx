// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const defaultSuggestions = [
  {
    sectionLabel: 'Popular Searches',
    items: [
      {
        label: 'Dashbaords',
        href: '/dashboards/sales',
        icon: 'bx-bar-chart-alt-2'
      },
      {
        label: 'Reports',
        href: '/reports/adminReports',
        icon: 'bx-receipt'
      },
      {
        label: 'Orders',
        href: '/apps/ecommerce/orders/list',
        icon: 'bx-box'
      },
      {
        label: 'Customers',
        href: '/apps/ecommerce/customers/list',
        icon: 'bx-user'
      },
      {
        label: 'Logistics',
        href: '/apps/logistics/dashboard',
        icon: 'bx-car'
      }
    ]
  },
  {
    sectionLabel: 'Apps',
    items: [
      {
        label: 'Booking Order Team',
        href: '/bookingTeam',
        icon: 'bx-calendar'
      },
      {
        label: 'CSR HOD',
        href: '/CSR_HOD',
        icon: 'bx-user'
      },
      {
        label: 'Products',
        href: '/apps/ecommerce/products/list',
        icon: 'bx-box'
      },
      {
        label: 'Roles & Permissions',
        href: '/apps/roles',
        icon: 'bx-lock-alt'
      },
      {
        label: 'Fleets',
        href: '/apps/logistics/fleet',
        icon: 'bx-user'
      }
    ]
  },
  {
    sectionLabel: 'Pages',
    items: [
      {
        label: 'User Profile',
        href: '/pages/user-profile',
        icon: 'bx-user'
      },
      {
        label: 'Account Settings',
        href: '/pages/account-settings',
        icon: 'bx-cog'
      },
      {
        label: 'Courier',
        href: '/apps/ecommerce/courier',
        icon: 'bx-bus'
      },
      {
        label: 'Agents',
        href: '/apps/ecommerce/agents',
        icon: 'bx-user'
      }
    ]
  }

  // {
  //   sectionLabel: 'Pages',
  //   items: [
  //     {
  //       label: 'Form Layouts',
  //       href: '/forms/form-layouts',
  //       icon: 'bx-layout'
  //     },
  //     {
  //       label: 'Form Validation',
  //       href: '/forms/form-validation',
  //       icon: 'bx-task'
  //     },
  //     {
  //       label: 'Form Wizard',
  //       href: '/forms/form-wizard',
  //       icon: 'bx-git-merge'
  //     },
  //     {
  //       label: 'Apex Charts',
  //       href: '/charts/apex-charts',
  //       icon: 'bx-line-chart'
  //     }
  //   ]
  // }
]

const DefaultSuggestions = ({ setOpen }) => {
  // Hooks
  const { lang: locale } = useParams()

  return (
    <div className='flex grow flex-wrap gap-x-12 gap-y-8 plb-14 pli-16 overflow-y-auto overflow-x-hidden bs-full'>
      {defaultSuggestions.map((section, index) => (
        <div
          key={index}
          className='flex flex-col justify-center overflow-x-hidden gap-4 basis-full sm:basis-[calc((100%-3rem)/2)]'
        >
          <p className='text-xs leading-[1.16667] uppercase text-textDisabled tracking-[0.8px]'>
            {section.sectionLabel}
          </p>
          <ul className='flex flex-col gap-4'>
            {section.items.map((item, i) => (
              <li key={i} className='flex'>
                <Link
                  href={getLocalizedUrl(item.href, locale)}
                  className='flex items-center overflow-x-hidden cursor-pointer gap-2 hover:text-primary focus-visible:text-primary focus-visible:outline-0'
                  onClick={() => setOpen(false)}
                >
                  {item.icon && <i className={classnames(item.icon, 'flex text-xl')} />}
                  <p className='text-[15px] leading-[1.4667] truncate'>{item.label}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default DefaultSuggestions
