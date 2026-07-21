import React from 'react'
import CurrentWeather from '../components/weather/CurrentWeather'
import TodayOutlook from '../components/weather/TodayOutlook'
import DailyForecast from '../components/weather/DailyForecast'
import AirQuality from '../components/weather/AirQuality'
import LocationMap from '../components/weather/LocationMap'

const TodayPage = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,340px)] gap-6 max-w-[1408px] w-full mx-auto p-4">
      <div className="flex flex-col gap-6">
        <CurrentWeather />
        <TodayOutlook />
        <DailyForecast />
        <LocationMap />
      </div>
      <div className="flex flex-col gap-6">
        <AirQuality />
      </div>
    </div>
  )
}

export default TodayPage