'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useDispatch, useSelector } from 'react-redux'
import Cookies from 'js-cookie'

// Redux Thunk
import { fetchUser } from '@/redux-store/slices/user'

// Component Imports
import UserProfile from '@views/pages/user-profile'

// Dynamic Tabs
const ProfileTab = dynamic(() => import('@views/pages/user-profile/profile'))
const TeamsTab = dynamic(() => import('@views/pages/user-profile/teams'))
const ProjectsTab = dynamic(() => import('@views/pages/user-profile/projects'))
const ConnectionsTab = dynamic(() => import('@views/pages/user-profile/connections'))

// Tabs content
const tabContentList = data => ({
  profile: <ProfileTab data={data?.user} />,
  teams: <TeamsTab data={data?.user} />,
  projects: <ProjectsTab data={data?.user} />,
  connections: <ConnectionsTab data={data?.user} />
})

const ProfilePage = () => {
  const dispatch = useDispatch()
  const { data, loading, error } = useSelector(state => state.user)
  const [cookieUser, setCookieUser] = useState(null)

  useEffect(() => {
    const raw = Cookies.get('user')

    if (raw) {
      try {
        const parsed = JSON.parse(decodeURIComponent(raw))

        setCookieUser(parsed)

        // optional: fetch fresh data from API using ID
        dispatch(fetchUser(parsed._id))
      } catch (err) {
        console.error('Error parsing cookie:', err)
      }
    }
  }, [dispatch])

  const userData = cookieUser || data?.user

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  if (!userData) return <p>No user data found</p>

  return <UserProfile data={userData} tabContentList={tabContentList({ user: userData })} />
}

export default ProfilePage
