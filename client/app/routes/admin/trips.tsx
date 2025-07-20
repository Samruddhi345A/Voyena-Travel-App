import { Header } from 'components'
import React from 'react'

const trips = () => {
  return (
     <main className='all-users wrapper'>
    <Header title="Manage Users"
        description="Filter, sort and access detailed user profiles"
        ctaText="Create Trip"
        ctaUrl="/trips/create"
    />
</main>
  )
}

export default trips