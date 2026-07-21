import React from 'react'
import { useWeather } from '../../context/WeatherContext'

const LocationMap = () => {
  const { currentWeather, loading } = useWeather()

  if (loading || !currentWeather)
    return <div className="widget-card p-6">Loading map...</div>

  const { latitude: lat, longitude: lon, location_name } = currentWeather
  if (lat === undefined || lon === undefined) return null

  const pad = 0.15
  const bbox = [lon - pad, lat - pad, lon + pad, lat + pad].join('%2C')
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`
  const largeMapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=11/${lat}/${lon}`

  return (
    <div className="bg-white flex flex-col gap-3 rounded-2xl shadow-sm p-4 border border-black/5 widget-card">
      <div className="flex items-center justify-between">
        <h2 className="text-neutral-800 text-xl font-bold tracking-[-0.4px] leading-[23px]">
          {location_name.split(',')[0].trim()} on the Map
        </h2>

        <a
          href={largeMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-blue-700 hover:underline whitespace-nowrap"
        >
          View larger map →
        </a>
      </div>

      <div className="rounded-xl overflow-hidden border border-black/5 w-full h-[280px] md:h-[420px]">
        <iframe
          title={`Map of ${location_name}`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          src={embedUrl}
          loading="lazy"
        />
      </div>
    </div>
  )
}

export default LocationMap