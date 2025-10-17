import Cookies from 'js-cookie'

// Centralized permission keys
export const PERMISSIONS = {
  'user.create': 'user.create',
  'user.view': 'user.view',
  'user.update': 'user.update',
  'user.delete': 'user.delete',
  'role.create': 'role.create',
  'role.view': 'role.view',
  'role.update': 'role.update',
  'role.delete': 'role.delete',
  'department.create': 'department.create',
  'department.view': 'department.view',
  'department.update': 'department.update',
  'department.delete': 'department.delete',
  'order.create': 'order.create',
  'order.view': 'order.view',
  'order.update': 'order.update',
  'courier.view': 'courier.view',
  'courier.update': 'courier.update',
  'awb.create': 'awb.create',
  'awb.cancel': 'awb.cancel',
  'loadsheet.create': 'loadsheet.create',
  'zonesetup.create': 'zonesetup.create',
  'zonesetup.view': 'zonesetup.view',
  'zonesetup.update': 'zonesetup.update'
}

const toLower = v => (typeof v === 'string' ? v.toLowerCase() : '')

const getUserFromCookie = () => {
  const raw = Cookies.get('user')

  if (!raw) return null

  // Already JSON string? Try to parse safely
  try {
    return JSON.parse(raw)
  } catch (e) {
    // If cookie was set incorrectly (e.g., "[object Object]"), return null instead of throwing
    return null
  }
}

const extractPermissionNames = userObj => {
  if (!userObj || typeof userObj !== 'object') return []

  // Prefer role.permissions, else direct permissions
  const perms = Array.isArray(userObj?.role?.permissions)
    ? userObj.role.permissions
    : Array.isArray(userObj?.permissions)
      ? userObj.permissions
      : []

  return perms
    .map(p => (typeof p === 'string' ? p : p?.name))
    .filter(Boolean)
    .map(toLower)
}

export const getUserPermissions = () => {
  const userObj = getUserFromCookie()

  return extractPermissionNames(userObj)
}

// Flexible checker:
// - accepts a string (single permission) or an array of permissions
// - mode: 'any' (default) → true if user has at least one
//         'all'           → true only if user has all of them
export const checkPermission = (permissionOrList, mode = 'any') => {
  const userPermissions = getUserPermissions()

  if (!permissionOrList) return false

  const baseRequested = Array.isArray(permissionOrList) ? permissionOrList.map(toLower) : [toLower(permissionOrList)]

  // Generate simple alias variants (e.g., orders.view -> order.view)
  const requested = baseRequested.flatMap(p => {
    const [maybePlural, ...rest] = p.split('.')

    if (maybePlural && maybePlural.endsWith('s')) {
      const singular = `${maybePlural.slice(0, -1)}${rest.length ? `.${rest.join('.')}` : ''}`

      return [p, singular]
    }

    return [p]
  })

  if (mode === 'all') {
    return requested.every(p => userPermissions.includes(p))
  }

  // default: any
  return requested.some(p => userPermissions.includes(p))
}
