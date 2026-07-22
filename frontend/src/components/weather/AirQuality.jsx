import React from 'react'
import { Link } from 'react-router-dom'
import { useWeather } from '../../context/WeatherContext'

const AirQuality = () => {
  const { airQuality, loading } = useWeather()

  if (loading || !airQuality) return <div className="widget-card p-6">Loading air quality...</div>

  const aqi = airQuality.aqi || 0
  const offset = 264 - (264 * (aqi / 300))
  const category = aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : aqi <= 150 ? 'Unhealthy for Sensitive Groups' : 'Unhealthy'

  return (
    <div className="bg-white flex flex-col gap-4 rounded-2xl shadow-sm p-4 border border-black/5 widget-card">
      <h2 className="text-neutral-800 text-xl font-bold tracking-[-0.4px] leading-[23px] pb-2">Air Quality Index</h2>
      <div className="flex items-center gap-6">
        <div className="shrink-0">
          <div className="aqi-circle">
            <svg viewBox="0 0 120 120">
              <circle className="bg" cx="60" cy="60" r="42" />
              <circle className="progress" cx="60" cy="60" r="42" style={{ strokeDashoffset: offset }} />
            </svg>
            <span>{aqi}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <h2 className="text-neutral-800 font-semibold tracking-[-0.32px] leading-4">{category}</h2>
          <p className="text-stone-500 text-sm tracking-[-0.28px] leading-[16.1px]">
            {aqi <= 50 ? 'Air quality is satisfactory, and air pollution poses little or no risk.' : 'Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.'}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <button className="flex items-center gap-2 text-sm max-w-[140px] p-0">
          <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-stone-500 text-xs font-medium">Air Quality Index</p>
        </button>
        <Link to="/air-quality" className="flex items-center bg-slate-900 text-white h-10 justify-center px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-slate-800 transition">
          See details
        </Link>
      </div>
    </div>
  )
}

export default AirQuality