import React from 'react'
import { useWeather } from '../../context/WeatherContext'

const CurrentWeather = () => {
  const { currentWeather, loading, error, convertTemp } = useWeather()

  if (loading) return <div className="widget-card p-6">Loading current weather...</div>
  if (error) return <div className="widget-card p-6 text-red-500">{error}</div>
  if (!currentWeather) return null

  const getLocalTimeAndTz = () => {
    const offsetSeconds = currentWeather.utc_offset_seconds
    if (offsetSeconds === undefined || offsetSeconds === null) return { time: '', tz: '' }

    const now = new Date()
    const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000)
    const localDate = new Date(utcMs + (offsetSeconds * 1000))

    const timeStr = localDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      .replace('AM', 'am').replace('PM', 'pm')

    const offsetHours = offsetSeconds / 3600
    const tzStr = `GMT${offsetHours >= 0 ? '+' : ''}${offsetHours}`

    return { time: timeStr, tz: tzStr }
  }

  const getBackgroundCondition = (condition, description) => {
    const condStr = (condition || '').toLowerCase()
    const descStr = (description || '').toLowerCase()
    const checkStr = `${descStr} ${condStr}`

    const isNight = condStr.includes('night')

    if (checkStr.includes('partly cloudy')) return isNight ? 'partly-cloudy-night' : 'partly-cloudy-day'
    if (checkStr.includes('overcast') || checkStr.includes('cloudy')) return 'overcast'
    if (checkStr.includes('thunderstorm')) return 'thunderstorm'
    if (checkStr.includes('snow')) return 'snow'
    if (checkStr.includes('fog') || checkStr.includes('mist') || checkStr.includes('haze')) return 'fog'
    if (checkStr.includes('rain') || checkStr.includes('drizzle')) return 'rain'
    if (checkStr.includes('clear')) return isNight ? 'clear-night' : 'clear-day'

    return condition || ''
  }

  const { time: localTime, tz: tzString } = getLocalTimeAndTz()
  const bgCondition = getBackgroundCondition(currentWeather.condition, currentWeather.description)

  return (
    <div>
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="text-neutral-800 text-xl font-bold tracking-[-0.4px] leading-[23px] md:text-2xl md:font-extrabold md:tracking-[-0.48px] md:leading-[27.6px]">
          {currentWeather.location_name.split(',')[0].trim()} Weather
        </h2>

        <div className="flex flex-wrap items-center gap-1.5">
          <svg className="w-4 h-4 shrink-0 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>

          <p className="text-neutral-800 text-sm font-medium">
            {currentWeather.location_name}
          </p>

          <p className="text-stone-500 text-sm font-medium">·</p>

          <p className="text-stone-500 text-sm font-medium">
            As of {localTime} {tzString}
          </p>
        </div>
      </div>

      <a href="#" className="block rounded-2xl overflow-hidden widget-card">
        <section className="bg-gray-900 flex flex-col isolate relative overflow-hidden p-6 rounded-2xl min-h-[220px]">
          <div className="bg-weather-card absolute inset-0 z-0 pointer-events-none" data-condition={bgCondition}></div>
          <div className="bg-black/20 absolute inset-0 z-0 pointer-events-none mix-blend-multiply"></div>

          <div className="relative z-10 flex-1 flex flex-col justify-center md:justify-end md:pb-1">
            <div className="flex justify-between items-end gap-3">
              <div className="flex flex-col min-w-0">
                <div className="text-white text-[56px] sm:text-[72px] md:text-[120px] font-extrabold tracking-[-2px] md:tracking-[-4.8px] leading-none">
                  {convertTemp(currentWeather.temperature)}°
                </div>
                <div className="text-white text-sm font-medium mt-2 flex flex-wrap gap-x-1.5 gap-y-1">
                  <span className="whitespace-nowrap">Feels Like {convertTemp(currentWeather.feels_like)}°</span>
                  <span className="opacity-40">|</span>
                  <span className="whitespace-nowrap">High {convertTemp(currentWeather.temp_max)}°</span>
                  <span className="opacity-40">|</span>
                  <span className="whitespace-nowrap">Low {convertTemp(currentWeather.temp_min)}°</span>
                </div>
                <div className="text-white text-sm font-medium mt-1 flex flex-wrap gap-x-1.5 gap-y-1">
                  <span className="whitespace-nowrap">Chance of Rain {currentWeather.rain_chance}%</span>
                  <span className="opacity-40">|</span>
                  <span className="whitespace-nowrap">{currentWeather.precipitation || 0} in</span>
                </div>
              </div>

              <div className="flex flex-col items-center shrink-0">
                <div className="flex items-center justify-center h-16 w-16 md:h-[88px] md:w-[88px]">
                  <img src={`${import.meta.env.BASE_URL}assets/weather-icons/${bgCondition}.svg`} alt="Weather icon" className="w-16 h-16 md:w-[88px] md:h-[88px]" />
                </div>
                <div className="text-white text-[11px] md:text-base font-bold mt-2 tracking-wide text-center w-16 md:w-[88px] leading-tight break-words">{currentWeather.description}</div>
              </div>
            </div>
          </div>
        </section>
      </a>
    </div>
  )
}

export default CurrentWeather