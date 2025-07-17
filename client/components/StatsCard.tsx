import { calculateTrendPercentage, cn } from "lib/utils"


const StatsCard = ({headerTitle, total, lastMonthCount, currentMonthCount }: StatsCard) => {

    const {trend,percentage} = calculateTrendPercentage(currentMonthCount, lastMonthCount)
    const isDecrement = trend === "decrement"
  return (
    <article className="stats-card">
        <h3 className="text-base font-medium">
            {headerTitle}
        </h3>
        <div className="content">
            <div className="flex flex-col gap-4">
                <h2 className="text-4xl font-semibold">
                    {total}
                </h2>
                <div className="flex items-center gap-2">
                    <figure className="flex items-center gap-1">
                        <img src={isDecrement ? "/assets/icons/arrow-down-red.svg" : "/assets/icons/arrow-up-green.svg"} alt="arrow" className="size-5" />
                         <figcaption className={cn("text-sm font-medium", isDecrement ? "text-red-500" : "text-green-700")}>
                        {Math.round(percentage)}% 
                    </figcaption>
                      <p>vs last month</p>
                   
                    </figure>
                  
                </div>
            </div>
             <img src={`/assets/icons/${isDecrement ? "decrement.svg" : "increment.svg"}`}alt="chart" className="xl:w-32 w-40 h-full md:h-32 xl:h-full" />   
        </div>
    </article>
  )
}

export default StatsCard