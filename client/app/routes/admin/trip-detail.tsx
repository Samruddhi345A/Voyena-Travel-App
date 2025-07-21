import type { LoaderFunctionArgs } from "react-router";
import type { Route } from "./+types/trip-detail";
import { cn, getFirstWord, parseTripData } from "lib/utils";
import { Header, InfoPill } from "components";
import { ChipDirective, ChipListComponent, ChipsDirective } from "@syncfusion/ej2-react-buttons";
import { allTrips } from "~/constants";
import { TripCard } from "components";




export const loader = async ({ params }: LoaderFunctionArgs) => {
    const tripId = params.id;
    if (!tripId) {
        throw new Error("Trip ID is required");
    }
 
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

const thisTrip = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/getTrip/${tripId}`, {
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Failed to fetch trip details");
    }

    const trip = await response.json();
    return trip;
};

const [trip, allTripsResult] = await Promise.all([
    thisTrip(),
    getAllTrips(10, 0),
]);

return {
    trip,
    allTrips: allTripsResult.trips.map(
        ({ _id, tripDetails, imageUrls }: { _id: string; tripDetails: string | ""; imageUrls: string[] }) => ({
            id: _id,
            tripDetail: parseTripData(tripDetails),
            imageUrls: imageUrls || []
        })
    )
};
}
const tripDetail = ({ loaderData }: Route.ComponentProps) => {
    const tripData = parseTripData(loaderData?.trip?.tripDetail);
    const imageUrls = loaderData?.trip?.imageUrls || [];
   
    if (!tripData) {
        throw new Error("Trip data is missing");
    }
    const { name, duration, budget, travelStyle, interests, groupType, itinerary, estimatedPrice, description, bestTimeToVisit, weatherInfo, country } = tripData || {};

    const pillItems = [
        {
            text: travelStyle,
            bg: "!bg-pink-50 !text-pink-500"
        },
        {
            text: groupType,
            bg: "!bg-primary-50 !text-primary-500"
        },
        {
            text: budget,
            bg: "!bg-success-50 !text-success-700"
        },
        {
            text: interests,
            bg: "!bg-navy-50 !text-navy-500"
        },

    ]

    const visitTimeAndWeather = [
        { title: "Best Time ToVisit", items: bestTimeToVisit },
        { title: "weather Info", items: weatherInfo },
    ];



    return (
        <main className="travel-detail wrapper">
            <Header title="Trip Details" description="View and edit AI- Generated Travel Plans" />
            <section className=" container wrapper-md ">
                <header>
                    <h1 className="p-40-semibold text-dark-100">{name}</h1>
                    <div className="flex items-center gap-5">

                        <InfoPill text={`${duration} day plan`} image="/assets/icons/calendar.svg" />
                        <InfoPill text={`${itinerary?.slice(0, 4).map((place) => place.location).join(', ')} ` || ""} image="/assets/icons/location-mark.svg" />
                    </div>
                </header>
                <section className="gallery">
                    {
                        imageUrls.map((image: string, index: number) => (
                            <img key={index} src={image} alt={`Trip Image ${index + 1}`} className={cn("w-full rounded-xl object-cover", index === 0 ? "md:col-span-2 md:row-span-2 h-[330px]" : "md:row-span-1 h-[150px]")} />
                        ))
                    }
                </section>
                <section className="flex gap-3 md:gap-5 items-center flex-wrap">
                    <ChipListComponent id="travel-chip">
                        <ChipsDirective>
                            {pillItems.map((item, index) => (
                                <ChipDirective key={index} text={getFirstWord(item.text)} cssClass={`${item.bg} !text-base !font-medium !px-4`} />

                            ))
                            }

                        </ChipsDirective>
                    </ChipListComponent>
                    <ul className="flex gap-1 items-center">
                        {Array(5).fill(null).map((_, index) => (
                            <li key={index}>
                                <img src='/assets/icons/star.svg' alt='star' className="size-[18px]" />
                            </li>
                        ))}<li>
                            <ChipListComponent>
                                <ChipsDirective>
                                    <ChipDirective text="4.5/5" cssClass="!bg-yellow-50 " />
                                </ChipsDirective>
                            </ChipListComponent>
                        </li>

                    </ul>
                </section>

                <section className="title">
                    <article>
                        <h3>
                            {duration}-Day {country} {travelStyle}

                        </h3>
                        <p>{budget}, {groupType} and  {interests}</p>
                    </article>

                    <h2>
                        {estimatedPrice}
                    </h2>
                </section>
                <p className="text-sm md:text-lgfont-normaltext-dark-400">{description}</p>
                <ul className="itinerary">
                    {itinerary?.map((dayPlan: DayPlan, index: number) => (
                        <li key={index} className="itinerary-item"><h3>
                            Day {dayPlan.day}: {dayPlan.location}</h3>
                            <ul>
                                {dayPlan.activities.map((activity, i: number) => (
                                    <li key={i}>
                                        <span className="flex-shrink-0
                                        mt-1 p-18-semibold">{activity.time}</span>
                                        <p className="flex-grow">{activity.description}</p>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
                {visitTimeAndWeather.map((section) => (
                    <section key={section.title} className="visit">
                        <div>
                            <h3>
{section.title}
                            </h3>

                            <ul>
                                {section.items?.map((item)=>(
                                    <li key={item}><p className="flex-grow">
                                        {item}
                                        </p></li>
                                ))}
                            </ul>
                        </div>
                    </section>
                ))}
                 </section>
                <section className="flex flex-col gap-6">
                    <h2 className="p-24-semibold text-dark-100">Popular Trips</h2>
                    <div className="trip-grid">
                        {allTrips.map((trip) => (
                            <TripCard
                                key={trip.id}
                                id={trip.id.toString()}
                                name={trip.name}
                                location={trip.itinerary?.[0]?.location ?? ""}
                                imageUrl={trip.imageUrls[0]}
                                tags={trip.tags}
                                price={trip.estimatedPrice}
                            />
                        ))}
                    </div>
                </section>
           
        </main>
    );
}

export default tripDetail