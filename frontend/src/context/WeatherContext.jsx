import React, { createContext, useState, useContext, useEffect } from 'react'
import { searchWeather, getForecast, getAirQuality, getCurrentLocationWeather } from '../services/api'

const WeatherContext = createContext()

export const WeatherProvider = ({ children }) => {
  const [currentWeather, setCurrentWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('Islamabad')
  const [unit, setUnit] = useState('celsius')

  const convertTemp = (celsius) => {
    if (celsius === undefined || celsius === null) return celsius
    if (unit === 'fahrenheit') return Math.round((celsius * 9 / 5) + 32)
    return Math.round(celsius)
  }

  const fetchWeatherData = async (query) => {
    setLoading(true)
    setError(null)
    try {
      const current = await searchWeather(query)
      setCurrentWeather(current)

      const forecastData = await getForecast(current.latitude, current.longitude)
      setForecast(forecastData)

      const aqiData = await getAirQuality(current.latitude, current.longitude)
      setAirQuality(aqiData)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  const fetchByCoords = async (lat, lon) => {
    setLoading(true)
    setError(null)
    try {
      const current = await getCurrentLocationWeather(lat, lon)
      setCurrentWeather(current)

      const forecastData = await getForecast(current.latitude, current.longitude)
      setForecast(forecastData)

      const aqiData = await getAirQuality(current.latitude, current.longitude)
      setAirQuality(aqiData)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchByCoords(position.coords.latitude, position.coords.longitude)
        },
        (err) => {
          setError('Geolocation error: ' + err.message)
        }
      )
    } else {
      setError('Geolocation is not supported by this browser.')
    }
  }

  useEffect(() => {
    fetchWeatherData(searchQuery)
  }, [searchQuery])

  return (
    <WeatherContext.Provider
      value={{
        currentWeather,
        forecast,
        airQuality,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        useCurrentLocation,
        unit,
        setUnit,
        convertTemp
      }}
    >
      {children}
    </WeatherContext.Provider>
  )
}

export const useWeather = () => useContext(WeatherContext)