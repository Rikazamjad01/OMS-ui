'use client'

// Next Imports
import { useEffect } from 'react'

import dynamic from 'next/dynamic'

import { useDispatch, useSelector } from 'react-redux'

// Component Imports
import UserProfile from '@views/pages/user-profile'

// Redux Thunk
import { fetchUser } from '@/redux-store/slices/user'

const ProfileTab = dynamic(() => import('@views/pages/user-profile/profile/index'))
const TeamsTab = dynamic(() => import('@views/pages/user-profile/teams/index'))
const ProjectsTab = dynamic(() => import('@views/pages/user-profile/projects/index'))
const ConnectionsTab = dynamic(() => import('@views/pages/user-profile/connections/index'))

// Vars
const tabContentList = data => ({
  profile: <ProfileTab data={data?.user} />,
  teams: <TeamsTab data={data?.user} />,
  projects: <ProjectsTab data={data?.user} />,
  connections: <ConnectionsTab data={data?.user} />
})

const ProfilePage = () => {
  const dispatch = useDispatch()
  const { data, loading, error } = useSelector(state => state.user)

  useEffect(() => {
    dispatch(fetchUser('68cac6d577b7c1e22585e7c2'))
  }, [dispatch])


  const userData = data?.user

  useEffect(() => {
    if (userData) {
      console.log('User profile response:', userData) // 👈 log the response
    }
  }, [userData])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  if (!data) return <p>No user data found</p>

  return <UserProfile data={userData} tabContentList={tabContentList(data)} />
}

export default ProfilePage
