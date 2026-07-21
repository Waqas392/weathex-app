import React from 'react'
import { Link } from 'react-router-dom'
import { useWeather } from '../context/WeatherContext'

const AirQualityPage = () => {
  const { airQuality, currentWeather, loading } = useWeather()

  if (loading || !airQuality) {
    return <div className="p-8 text-center text-gray-500">Loading air quality data...</div>
  }

  const aqi = airQuality.aqi || 0
  
  const getPollutantStatus = (pollutant, value) => {
    const thresholds = {
      pm2_5: [12, 35.4],
      pm10: [54, 154],
      ozone: [70, 125],
      no2: [100, 360],
      so2: [75, 185],
      co: [4400, 9400]
    }
    const [mod, unhealthy] = thresholds[pollutant] || [50, 100]
    if (value <= mod) return { label: 'Good', color: 'text-green-600' }
    if (value <= unhealthy) return { label: 'Moderate', color: 'text-yellow-600' }
    return { label: 'Unhealthy', color: 'text-red-600' }
  }

  const pollutants = [
    { key: 'pm2_5', name: 'PM2.5', value: airQuality.pm2_5, unit: 'µg/m³' },
    { key: 'pm10', name: 'PM10', value: airQuality.pm10, unit: 'µg/m³' },
    { key: 'ozone', name: 'Ozone', value: airQuality.ozone, unit: 'µg/m³' },
    { key: 'no2', name: 'NO₂', value: airQuality.no2, unit: 'µg/m³' },
    { key: 'so2', name: 'SO₂', value: airQuality.so2, unit: 'µg/m³' },
    { key: 'co', name: 'CO', value: airQuality.co, unit: 'µg/m³' },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 my-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Air Quality Details</h1>
        <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-8 mb-8 flex items-center gap-8">
        <div className="aqi-circle scale-150 origin-left">
          <svg viewBox="0 0 120 120">
            <circle className="bg" cx="60" cy="60" r="42" />
            <circle className="progress" cx="60" cy="60" r="42" style={{ strokeDashoffset: 264 - (264 * (aqi / 300)) }} />
          </svg>
          <span>{aqi}</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {currentWeather?.location_name || 'Current Location'}
          </h2>
          <p className="text-gray-500">US EPA Air Quality Index</p>
          <p className="mt-2 text-lg">
            Status:{' '}
            <span className={`font-semibold ${
              aqi <= 50 ? 'text-green-600' : aqi <= 100 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : 'Unhealthy'}
            </span>
          </p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-4">Pollutant Breakdown</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pollutants.map((p) => {
          const status = getPollutantStatus(p.key, p.value)
          return (
            <div key={p.key} className="bg-white shadow rounded-lg p-4 border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold text-gray-700">{p.name}</h4>
                <span className={`text-xs font-bold uppercase ${status.color}`}>{status.label}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {p.value ? p.value.toFixed(1) : '0.0'}
                <span className="text-sm font-medium text-gray-400 ml-1">{p.unit}</span>
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AirQualityPage