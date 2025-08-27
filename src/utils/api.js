import axios from 'axios'

const baseUrl = 'https://oms-production-a5c7.up.railway.app/api/v1'

export const getRequest = async endpoint => {
  try {
    const response = await axios.get(`${baseUrl}/${endpoint}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = response.data

    return data
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    throw error
  }
}
