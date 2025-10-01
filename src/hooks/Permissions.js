import Cookies from 'js-cookie'

export const checkPermission = permission => {
  const user = Cookies.get('user')
  const userPermissions = JSON.parse(user || {})?.role?.permissions.map(p => p?.name?.toLowerCase()) || []
  console.log(userPermissions, 'userPermissions')
  return userPermissions?.includes(permission?.toLowerCase())
}
