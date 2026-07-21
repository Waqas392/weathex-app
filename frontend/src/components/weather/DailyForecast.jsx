import React from 'react'
import { useWeather } from '../../context/WeatherContext'

const DailyForecast = () => {
  const { forecast, loading, convertTemp } = useWeather()

  if (loading || !forecast || !forecast.daily) return <div className="widget-card p-6">Loading daily forecast...</div>

  return (
    <section aria-label="Daily Forecast" className="bg-[lab(100_0_0)] flex flex-col widget-card p-4 rounded-2xl">
      <h1 className="text-neutral-800 text-xl font-bold tracking-[-0.4px] leading-[23px] mb-4">Daily Forecast</h1>
      <div className="flex-1">
        {forecast.daily.slice(0, 7).map((day, i) => (
          <div key={i} className="border-b border-[lab(90.952_0_-0.0000119209)] overflow-hidden md:border-b-0">
            <a href="#" className="flex items-center gap-1 md:gap-2 w-full p-3 rounded-none md:rounded-2xl">
              <span className="text-neutral-800 block shrink-0 text-xs md:text-sm font-bold leading-[18.2px] w-12 md:w-[76px]">
                {i === 0 ? 'Today' : new Date(day.time).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
              </span>
              <div className="flex items-center gap-1 shrink-0 w-14 md:w-[72px]">
                <img src={`${import.meta.env.BASE_URL}assets/weather-icons/${day.condition}.svg`} alt="" className="w-6 h-6 md:w-8 md:h-8 shrink-0" />
                <span className="text-sky-700 block text-xs md:text-sm font-medium">{day.rain_chance}%</span>
              </div>
              <span className="text-neutral-800 truncate font-medium tracking-[-0.32px] leading-[20.8px] flex-1 min-w-0 hidden md:hidden">{day.description}</span>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-stone-500 block shrink-0 font-medium tracking-[-0.32px] leading-[20.8px] text-right text-xs md:text-base w-7 md:w-8">{convertTemp(day.temp_min)}°</span>
                <div className="bg-black/10 flex-1 h-2 relative rounded">
                  <div className="temp-bar absolute inset-0 rounded" style={{ width: `${(day.temp_max - day.temp_min) * 2}%` }}></div>
                </div>
                <span className="text-neutral-800 block shrink-0 font-bold tracking-[-0.32px] leading-[20.8px] text-left text-xs md:text-base w-7 md:w-8">{convertTemp(day.temp_max)}°</span>
              </div>
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}

export default DailyForecast