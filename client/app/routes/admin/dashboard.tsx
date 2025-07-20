import { Header, StatsCard, TripCard } from 'components'
import { dashboardStats, user, allTrips } from '~/constants'
import type { Route } from './+types/dashboard'

  const { totalUsers, usersJoined, totalTrips, tripsCreated, userRole } = dashboardStats
  
export async function clientLoader() {
  try{
    const res= await fetch('http://localhost:5000/api/auth/user',{credentials:"include"})
    const user= await res.json()
    return user?._id? user : null
  }catch(err){
    console.log("Error Fetching User",err)
     return null
  }
}
const dashboard = ({loaderData}:Route.ComponentProps) => {

  const user = loaderData as User | null
  
  return (
    <main className='dashboard wrapper'>
      <Header title={`Welcome ${user?.name ?? 'Guest'} 👋`}
        description="Track activity, trends and popular destinationsin real time "
      />

      <section className='flex flex-col gap-6'>
        <div className='grid grid-cols-1 md:grid-cols-3  gap-6 w-full'>
          <StatsCard headerTitle="Total users" total={totalUsers} lastMonthCount={usersJoined.lastMonth} currentMonthCount={usersJoined.currentMonth} />
          <StatsCard headerTitle="Total Trips" total={totalTrips} lastMonthCount={tripsCreated.lastMonth} currentMonthCount={tripsCreated.currentMonth} />
          <StatsCard headerTitle="Active users" total={userRole.total} lastMonthCount={userRole.lastMonth} currentMonthCount={userRole.currentMonth} />
        </div>
      </section>
    <section className='container' >
      <h1 className='text-xl font-semibold text-dark-100'>
    Created Trips
      </h1>
      <div className='trip-grid'>
{allTrips.slice(0, 4).map(({id,name,imageUrls,itinerary,tags,estimatedPrice}) => (
  <TripCard key={id} id={id.toString()} name={name} location={itinerary?.[0]?.location ?? ""} imageUrl={imageUrls[0]} tags={tags} price={estimatedPrice} />
))}
      </div>
     
    </section>

      

    </main>
  )
}

export default dashboard