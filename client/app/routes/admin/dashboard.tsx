import { Header, StatsCard, TripCard } from 'components'
import { dashboardStats, user, allTrips } from '~/constants'
import type { Route } from './+types/dashboard'
import { parseTripData } from 'lib/utils';
import {
    Category,
    ChartComponent,
    ColumnSeries,
    DataLabel, SeriesCollectionDirective, SeriesDirective,
    SplineAreaSeries,
    Tooltip
} from "@syncfusion/ej2-react-charts";
import {ColumnDirective, ColumnsDirective, GridComponent, Inject} from "@syncfusion/ej2-react-grids";
import {tripXAxis, tripyAxis, userXAxis, useryAxis} from "~/constants";


  
export async function clientLoader() {
  try {
    const [userRes, statsRes, tripsRes, userGrowthRes, travelStylesRes, usersRes] = await Promise.all([
      fetch('http://localhost:5000/api/auth/user', {credentials: "include"}),
      fetch('http://localhost:5000/api/dashboard/stats', {credentials: "include"}),
      fetch('http://localhost:5000/api/posts/getAllTrips?limit=4', {credentials: "include"}),
      fetch('http://localhost:5000/api/dashboard/user-growth', {credentials: "include"}),
      fetch('http://localhost:5000/api/dashboard/travel-styles', {credentials: "include"}),
      fetch('http://localhost:5000/api/users/allusers?limit=4', {credentials: "include"})
    ]);
    const user = await userRes.json();
    const dashboardStats = await statsRes.json();
    const allTrips = await tripsRes.json();
    const userGrowth = await userGrowthRes.json();
    const tripsByTravelStyle = await travelStylesRes.json();
    const allUsers = await usersRes.json();
    
        const mappedUsers: UsersItineraryCount[] = allUsers.users.map((user: any) => ({
        imageUrl: user.imageUrl,
        name: user.name,
        count: user.itineraryCount ?? Math.floor(Math.random() * 10),
    }))
    allUsers.users = mappedUsers;

    return {
      user:  user || null,
      dashboardStats,
      allTrips,
      userGrowth,
      tripsByTravelStyle,
      allUsers
    };
  } catch(err) {
    console.log("Error in clientLoader", err)
    return {
      user: null, dashboardStats: {}, allTrips: [],
      userGrowth: [], tripsByTravelStyle: [], allUsers: []
    }
  }
}

const dashboard = ({loaderData}:Route.ComponentProps) => {

   const {
    user,
    dashboardStats,
    allTrips,
    userGrowth,
    tripsByTravelStyle,
    allUsers
  } = loaderData || {};
  if (!dashboardStats) return <div>Loading dashboard...</div>;

   type Trip = {
    id: string | number;
    name: string;
    imageUrl?: string[];
    itinerary?: { location?: string }[];
    tags?: string[];
    estimatedPrice?: number;
  };


 const trips: Trip[] = allTrips.trips.map((trip: any) => {
  const parsedDetail = parseTripData(trip.tripDetail);

  return {
     id: trip._id,
    name: parsedDetail?.name ?? "",
    imageUrl: trip.imageUrls,
    itinerary: parsedDetail?.itinerary ?? [],
    interest: parsedDetail?.interests ?? "", // this field is required for Grid table!
    tags: [parsedDetail?.interests, parsedDetail?.travelStyle].filter(Boolean),
    estimatedPrice: parsedDetail?.estimatedPrice,
  };
});

    const usersAndTrips = [
        {
            title: 'Latest user signups',
            dataSource: allUsers.users,
            field: 'count',
            headerText: 'Trips created'
        },
        {
            title: 'Trips based on interests',
            dataSource: trips,
            field: 'interest',
            headerText: 'Interests'
        }
    ]
  return (
    <main className='dashboard wrapper'>
      <Header
        title={`Welcome ${user?.name ?? 'Guest'} 👋`}
        description="Track activity, trends and popular destinations in real time"
      />

      <section className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <StatsCard
            headerTitle="Total users"
            total={dashboardStats.totalUsers}
            lastMonthCount={dashboardStats.usersJoined?.lastMonth}
            currentMonthCount={dashboardStats.usersJoined?.currentMonth}
          />
          <StatsCard
            headerTitle="Total Trips"
            total={dashboardStats.totalTrips}
            lastMonthCount={dashboardStats.tripsCreated?.lastMonth}
            currentMonthCount={dashboardStats.tripsCreated?.currentMonth}
          />
          <StatsCard
            headerTitle="Active users"
            total={dashboardStats.userRole?.total}
            lastMonthCount={dashboardStats.userRole?.lastMonth}
            currentMonthCount={dashboardStats.userRole?.currentMonth}
          />
        </div>
      </section>

      <section className='container'>
        <h1 className='text-xl font-semibold text-dark-100'>Created Trips</h1>
        <div className='trip-grid'>
          {trips.map(({id, name, imageUrl, itinerary, tags, estimatedPrice}: Trip) => (
            <TripCard
              key={id}
              id={id.toString()}
              name={name}
              location={itinerary?.[0]?.location ?? ""}
              imageUrl={imageUrl?.[0] ?? ""}
              tags={tags ?? []}
              price={estimatedPrice !== undefined ? estimatedPrice.toString() : ""}
            />
          ))}
        </div>
      </section>
       <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ChartComponent
                    id="chart-1"
                    primaryXAxis={userXAxis}
                    primaryYAxis={useryAxis}
                    title="User Growth"
                    tooltip={{ enable: true}}
                >
                    <Inject services={[ColumnSeries, SplineAreaSeries, Category, DataLabel, Tooltip]} />

                    <SeriesCollectionDirective>
                        <SeriesDirective
                            dataSource={userGrowth}
                            xName="day"
                            yName="count"
                            type="Column"
                            name="Column"
                            columnWidth={0.3}
                            cornerRadius={{topLeft: 10, topRight: 10}}
                        />

                        <SeriesDirective
                            dataSource={userGrowth}
                            xName="day"
                            yName="count"
                            type="SplineArea"
                            name="Wave"
                            fill="rgba(71, 132, 238, 0.3)"
                            border={{ width: 2, color: '#4784EE'}}
                        />
                    </SeriesCollectionDirective>
                </ChartComponent>

                <ChartComponent
                    id="chart-2"
                    primaryXAxis={tripXAxis}
                    primaryYAxis={tripyAxis}
                    title="Trip Trends"
                    tooltip={{ enable: true}}
                >
                    <Inject services={[ColumnSeries, SplineAreaSeries, Category, DataLabel, Tooltip]} />

                    <SeriesCollectionDirective>
                        <SeriesDirective
                            dataSource={tripsByTravelStyle}
                            xName="travelStyle"
                            yName="count"
                            type="Column"
                            name="day"
                            columnWidth={0.3}
                            cornerRadius={{topLeft: 10, topRight: 10}}
                        />
                    </SeriesCollectionDirective>
                </ChartComponent>
            </section>

            <section className="user-trip wrapper">
                {usersAndTrips.map(({ title, dataSource, field, headerText}, i) => (
                    <div key={i} className="flex flex-col gap-5">
                        <h3 className="p-20-semibold text-dark-100">{title}</h3>

                        <GridComponent dataSource={dataSource} gridLines="None">
                            <ColumnsDirective>
                                <ColumnDirective
                                    field="name"
                                    headerText="Name"
                                    width="200"
                                    textAlign="Left"
                                    template={(props: UserData) => (
                                        <div className="flex items-center gap-1.5 px-4">
                                            <img src={props.imageUrl} alt="user" className="rounded-full size-8 aspect-square" referrerPolicy="no-referrer" />
                                            <span>{props.name}</span>
                                        </div>
                                    )}
                                />

                                <ColumnDirective
                                    field={field}
                                    headerText={headerText}
                                    width="150"
                                    textAlign="Left"
                                />
                            </ColumnsDirective>
                        </GridComponent>
                    </div>
                ))}
            </section>
    </main>
  );
}

export default dashboard

function arseTripData(tripDetail: any) {
  throw new Error('Function not implemented.');
}
