import { Header, TripCard } from 'components'
import { parseTripData } from 'lib/utils';
import React, { useState } from 'react'
import type { Route } from './+types/trips';
import { useSearchParams, type LoaderFunctionArgs } from 'react-router';
import { PagerComponent } from '@syncfusion/ej2-react-grids';

export const loader = async ({ request }: LoaderFunctionArgs) => {

 const limit = 8;
  const url= new URL(request.url);
  const page=parseInt(url.searchParams.get('page') || '1', 10);

    const offset = (page - 1) * limit;
    
 
    const getAllTrips = async (limit = 10, offset = 0) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/posts/getAllTrips?limit=${limit}&offset=${offset}`,
      {
        credentials: 'include', // optional if you use cookies/auth
      }
    );

    if (!res.ok) throw new Error("Failed to fetch trips");

    const data = await res.json();
    console.log(data); 
    return data;
  } catch (error) {
    console.error("empty trip list",error);
    return { trips: [], total: 0 };
  }
};


    const {trips,total}= await getAllTrips(limit, offset)


return {
    
    trips: trips.map(
        ({ _id, tripDetail, imageUrls }: { _id: string; tripDetail: string | ""; imageUrls: string[] }) => ({
            id: _id,
            tripDetail: parseTripData(tripDetail),
            imageUrls: imageUrls || []
        })
    ),
    total
};
}
const trips = ({ loaderData }: Route.ComponentProps) => {

  const trips = loaderData.trips as Trip[] || [];
  
  const [searchRarams] =useSearchParams();
  const initialPage = Number(searchRarams.get('page') || '1');

const [currentPage, setCurrentPage] = useState(initialPage);

const handlePageChange = (page: number) => {setCurrentPage(page) 
  window.location.search = `?page=${page}`;
}

  return (
     <main className='all-users wrapper'>
    <Header title="Manage Users"
        description="Filter, sort and access detailed user profiles"
        ctaText="Create Trip"
        ctaUrl="/trips/create"
    />
    <section>
      <h1 className='p-24-semibold text-dark-100 m-4'>Manage Created Trip</h1>
      <div className='trip-grid mb-4'>
         {trips.map((trip) => (
                            <TripCard
                                key={trip.id}
                                id={trip.id.toString()}
                                name={trip.tripDetail.name}
                                location={trip.tripDetail.itinerary?.[0]?.location ?? ""}
                                imageUrl={trip.imageUrls[0]}
                                tags={[trip.tripDetail.interests, trip.tripDetail.travelStyle]}
                                price={trip.tripDetail.estimatedPrice}
                            />
                        ))} 
      </div>

      <PagerComponent
      totalRecordsCount={loaderData.total}
      pageSize={8}
      currentPage={currentPage}
      click={(args)=> handlePageChange(args.currentPage)}
      cssClass="!mb-4"
      />
    </section>
</main>
  )
}

export default trips