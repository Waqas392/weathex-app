import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { useWeather } from '../../context/WeatherContext'
import './TodayOutlook.css'

const ICONS = {
  sunrise: `<svg viewBox="0 0 48 48" stroke="#E07B39" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="19 11.5 24 6.5 29 11.5"/><line x1="24" y1="6.5" x2="24" y2="17"/>
      <line x1="10.5" y1="21" x2="13.5" y2="24"/><line x1="37.5" y1="21" x2="34.5" y2="24"/>
      <line x1="7" y1="29.5" x2="10.8" y2="29.9"/><line x1="41" y1="29.5" x2="37.2" y2="29.9"/>
      <path d="M15.5 30.5 a8.5 8.5 0 0 1 17 0" fill="#E07B39" stroke="none"/>
      <line x1="8" y1="35.5" x2="40" y2="35.5"/><line x1="13" y1="41" x2="35" y2="41"/>
    </svg>`,
  sunset: `<svg viewBox="0 0 48 48" stroke="#A56A8C" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="19 12 24 17 29 12"/><line x1="24" y1="17" x2="24" y2="6.5"/>
      <line x1="10.5" y1="21" x2="13.5" y2="24"/><line x1="37.5" y1="21" x2="34.5" y2="24"/>
      <line x1="7" y1="29.5" x2="10.8" y2="29.9"/><line x1="41" y1="29.5" x2="37.2" y2="29.9"/>
      <path d="M15.5 30.5 a8.5 8.5 0 0 1 17 0" fill="#A56A8C" stroke="none"/>
      <line x1="8" y1="35.5" x2="40" y2="35.5"/><line x1="13" y1="41" x2="35" y2="41"/>
    </svg>`
}

const COND_NAMES = {
  'clear-day': 'Sunny',
  'clear-night': 'Clear',
  'partly-cloudy-day': 'Partly cloudy',
  'partly-cloudy-night': 'Partly cloudy',
  overcast: 'Overcast',
  rain: 'Light rain',
  thunderstorm: 'Thunderstorm',
  'thunderstorm-hail': 'Thunderstorm with hail',
  snow: 'Snow',
  fog: 'Foggy'
}

const parseNaiveLocal = (str) => {
  if (!str) return new Date(NaN)
  const [datePart, timePart = '00:00'] = str.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const [hh, mm, ss = 0] = timePart.split(':').map(Number)
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, ss || 0))
}

const getNowAtLocation = (offsetSeconds) => {
  return new Date(Date.now() + (offsetSeconds || 0) * 1000)
}

const sameDay = (a, b) =>
  a.getUTCFullYear() === b.getUTCFullYear() &&
  a.getUTCMonth() === b.getUTCMonth() &&
  a.getUTCDate() === b.getUTCDate()

const fmtTime = (d) =>
  d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).replace(' ', '')

const COL_W = 76

const TodayOutlook = () => {
  const { forecast, loading, currentWeather, unit, convertTemp } = useWeather()
  const scrollerRef = useRef(null)
  const cardRef = useRef(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const [detailHtml, setDetailHtml] = useState('')
  const [detailShow, setDetailShow] = useState(false)
  const detailTimer = useRef(null)

  const dragging = useRef(false)
  const dragX = useRef(0)
  const dragSL = useRef(0)
  const moved = useRef(0)
  const didInitialScroll = useRef(false)

  const timelineData = useMemo(() => {
    if (!forecast || !forecast.hourly || forecast.hourly.length === 0) return []

    const now = getNowAtLocation(currentWeather?.utc_offset_seconds)
    let nowSourceIdx = 0
    let minDiff = Infinity
    forecast.hourly.forEach((h, i) => {
      const diff = Math.abs(parseNaiveLocal(h.time) - now)
      if (diff < minDiff) { minDiff = diff; nowSourceIdx = i }
    })

    const HOURS_BEFORE = 6
    const HOURS_AFTER = 42
    const windowStart = Math.max(0, nowSourceIdx - HOURS_BEFORE)
    const windowEnd = Math.min(forecast.hourly.length, nowSourceIdx + HOURS_AFTER)
    const source = forecast.hourly.slice(windowStart, windowEnd)
    const nowIdxInSource = nowSourceIdx - windowStart

    const hours = source.map((h, i) => {
      const date = parseNaiveLocal(h.time)
      return {
        kind: 'hour',
        date,
        t: i === nowIdxInSource ? 'Now' : fmtTime(date),
        temp: convertTemp(h.temperature),
        icon: h.condition,
        rawCondition: h.condition,
        now: i === nowIdxInSource,
        dayBreak: i > 0 && !sameDay(date, parseNaiveLocal(source[i - 1].time)),
        precip: h.precipitation || 0
      }
    })

    const rangeStart = hours[0].date
    const rangeEnd = hours[hours.length - 1].date
    const events = []

    const pushEvent = (iso, kind) => {
      if (!iso) return
      const d = parseNaiveLocal(iso)
      if (isNaN(d) || d < rangeStart || d > rangeEnd) return
      events.push({ kind: 'event', event: kind, date: d, t: fmtTime(d) })
    }
    pushEvent(forecast.sunrise, 'sunrise')
    pushEvent(forecast.sunset, 'sunset')

    return [...hours, ...events].sort((a, b) => a.date - b.date)
  }, [forecast, currentWeather, unit])

  const nowIdx = useMemo(
    () => timelineData.findIndex((d) => d.kind === 'hour' && d.now),
    [timelineData]
  )

  const chartConfig = useMemo(() => {
    const hourPts = timelineData
      .map((d, i) => ({ ...d, i }))
      .filter((d) => d.kind === 'hour')

    if (hourPts.length === 0) return null

    const temps = hourPts.map((d) => d.temp)
    const T_MIN = Math.min(...temps) - 2
    const T_MAX = Math.max(...temps) + 2
    const CHART_H = 132, PAD_TOP = 36, PAD_BOT = 14
    const W = timelineData.length * COL_W

    const tempColor = (t) => {
      const f = Math.max(0, Math.min(1, (t - T_MIN) / (T_MAX - T_MIN)))
      const h = 26 - f * 22
      const s = 86 - f * 10, l = 57 - f * 4
      return `hsl(${h},${s}%,${l}%)`
    }
    const yOf = (t) => PAD_TOP + ((T_MAX - t) / (T_MAX - T_MIN)) * (CHART_H - PAD_TOP - PAD_BOT)
    const xOf = (i) => i * COL_W + COL_W / 2

    const pts = hourPts.map((d) => ({ i: d.i, x: xOf(d.i), y: yOf(d.temp), t: d.temp }))

    const nowPos = hourPts.findIndex((d) => d.now)
    const pastPts = nowPos >= 0 ? pts.slice(0, nowPos + 1) : []
    const futPts = nowPos >= 0 ? pts.slice(nowPos) : pts

    const smoothPath = (p) => {
      if (p.length < 2) return ''
      let d = `M ${p[0].x} ${p[0].y}`
      for (let i = 0; i < p.length - 1; i++) {
        const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)]
        const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6
        const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6
        d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
      }
      return d
    }

    let stops = ''
    if (futPts.length > 0) {
      const x0 = futPts[0].x, x1 = futPts[futPts.length - 1].x
      futPts.forEach((p) => {
        const off = (((p.x - x0) / Math.max(1, x1 - x0)) * 100).toFixed(2)
        stops += `<stop offset="${off}%" stop-color="${tempColor(p.t)}"/>`
      })
    }

    return { CHART_H, W, pastPts, futPts, smoothPath, tempColor, stops, pts }
  }, [timelineData])

  const updateNav = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setAtStart(el.scrollLeft <= 8)
    setAtEnd(el.scrollLeft >= max - 8)
  }, [])

  useEffect(() => {
    if (!didInitialScroll.current && timelineData.length > 0 && scrollerRef.current && nowIdx >= 0) {
      const nowX = nowIdx * COL_W
      scrollerRef.current.scrollLeft = Math.max(0, nowX - scrollerRef.current.clientWidth * 0.36)
      updateNav()
      didInitialScroll.current = true
    }
  }, [timelineData, nowIdx, updateNav])

  const scrollByAmount = (dir) => {
    scrollerRef.current?.scrollBy({ left: dir === 'left' ? -COL_W * 4 : COL_W * 4, behavior: 'smooth' })
  }

  const handlePointerMove = useCallback((e) => {
    if (!dragging.current || !scrollerRef.current) return
    const dx = e.clientX - dragX.current
    moved.current = Math.max(moved.current, Math.abs(dx))
    scrollerRef.current.scrollLeft = dragSL.current - dx
  }, [])

  const handlePointerUp = useCallback(() => {
    dragging.current = false
    scrollerRef.current?.classList.remove('dragging')
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
  }, [handlePointerMove])

  const handlePointerDown = (e) => {
    if (!scrollerRef.current) return
    dragging.current = true
    moved.current = 0
    dragX.current = e.clientX
    dragSL.current = scrollerRef.current.scrollLeft
    scrollerRef.current.classList.add('dragging')
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const showDetail = (html) => {
    setDetailHtml(html)
    setDetailShow(true)
    clearTimeout(detailTimer.current)
    detailTimer.current = setTimeout(() => setDetailShow(false), 3200)
  }

  const handleColClick = (d) => {
    if (moved.current > 6) return
    if (d.kind === 'event') {
      showDetail(`<b>${d.t}</b> \u00b7 ${d.event === 'sunrise' ? 'Sunrise' : 'Sunset'}`)
    } else {
      const pr = d.precip ? ` \u00b7 Rain ${d.precip}%` : ''
      showDetail(`<b>${d.t}</b> \u00b7 ${COND_NAMES[d.rawCondition] || 'Weather'} \u00b7 <b>${d.temp}\u00b0</b>${pr}`)
    }
  }

  useEffect(() => () => clearTimeout(detailTimer.current), [])

  if (loading || !forecast || !chartConfig) {
    return <div className="widget-card p-6">Loading outlook...</div>
  }

  const today = forecast.daily && forecast.daily[0]
  const todaySummary = today
    ? `Today's high will be ${convertTemp(today.temp_max)}°, with a low of ${convertTemp(today.temp_min)}°.`
    : ''

  const pillW = 92

  return (
    <section className="outlook-wrap">
      <div className="outlook-headline">Hourly forecast</div>
      <div className="outlook-subline">{todaySummary}</div>

      <div className="outlook-card" ref={cardRef}>
        <div
          className="outlook-scroller"
          ref={scrollerRef}
          onScroll={updateNav}
          onPointerDown={handlePointerDown}
        >
          <div className="outlook-track" style={{ width: chartConfig.W }}>
            {nowIdx >= 0 && (
              <div
                className="outlook-now-pill"
                style={{ left: nowIdx * COL_W + (COL_W - pillW) / 2, width: pillW }}
              />
            )}

            {timelineData.map(
              (d, i) =>
                d.kind === 'hour' &&
                d.dayBreak && <div key={`div-${i}`} className="outlook-divider" style={{ left: i * COL_W }} />
            )}

            <div className="outlook-columns">
              {timelineData.map((d, i) => {
                if (d.kind === 'event') {
                  return (
                    <div key={i} className={`outlook-col event ${d.event}`} style={{ width: COL_W }} onClick={() => handleColClick(d)}>
                      <div className="outlook-time">{d.t}</div>
                      <div className="outlook-iconbox" dangerouslySetInnerHTML={{ __html: ICONS[d.event] }} />
                      <div className="outlook-label">{d.event === 'sunrise' ? 'Sunrise' : 'Sunset'}</div>
                    </div>
                  )
                }
                return (
                  <div
                    key={i}
                    className={`outlook-col ${i < nowIdx ? 'past' : ''} ${d.now ? 'now' : ''}`}
                    style={{ width: COL_W }}
                    onClick={() => handleColClick(d)}
                  >
                    <div className="outlook-time">{d.t}</div>
                    <div className="outlook-iconbox">
                      <img src={`${import.meta.env.BASE_URL}assets/weather-icons/${d.icon}.svg`} alt={d.icon} />
                    </div>
                    <div className="outlook-precip">{d.precip ? d.precip + '%' : ''}</div>
                  </div>
                )
              })}
            </div>

            <div className="outlook-chart">
              <svg width={chartConfig.W} height={chartConfig.CHART_H} viewBox={`0 0 ${chartConfig.W} ${chartConfig.CHART_H}`}>
                <defs>
                  {chartConfig.futPts.length > 0 && (
                    <linearGradient
                      id="outlook-tg"
                      gradientUnits="userSpaceOnUse"
                      x1={chartConfig.futPts[0].x}
                      y1="0"
                      x2={chartConfig.futPts[chartConfig.futPts.length - 1].x}
                      y2="0"
                      dangerouslySetInnerHTML={{ __html: chartConfig.stops }}
                    />
                  )}
                </defs>

                {chartConfig.pastPts.length > 1 && (
                  <path
                    d={chartConfig.smoothPath(chartConfig.pastPts)}
                    fill="none"
                    stroke="#F0A672"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="9 7 2.5 7"
                  />
                )}

                {chartConfig.futPts.length > 1 && (
                  <path
                    d={chartConfig.smoothPath(chartConfig.futPts)}
                    fill="none"
                    stroke="url(#outlook-tg)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                )}

                {chartConfig.pastPts.slice(0, -1).map((p, k) => (
                  <circle key={`pp-${k}`} cx={p.x} cy={p.y} r="5" fill="#EE9F68" stroke="#fff" strokeWidth="2.6" />
                ))}

                {chartConfig.futPts.map((p, k) => (
                  <circle
                    key={`fp-${k}`}
                    cx={p.x}
                    cy={p.y}
                    r={k === 0 ? 6.5 : 5.5}
                    fill={chartConfig.tempColor(p.t)}
                    stroke="#fff"
                    strokeWidth="3"
                  />
                ))}
              </svg>

              {chartConfig.pts.map((p, k) => (
                <div
                  key={`tl-${k}`}
                  className={`outlook-tlabel ${p.i < nowIdx ? 'past' : ''}`}
                  style={{ left: p.x, top: p.y - 34 }}
                >
                  {p.t}°
                </div>
              ))}
            </div>
          </div>
        </div>

        <button className={`outlook-navbtn left ${atStart ? 'hidden' : ''}`} onClick={() => scrollByAmount('left')} aria-label="Scroll left">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 5 7.5 12 14.5 19" /></svg>
        </button>
        <button className={`outlook-navbtn right ${atEnd ? 'hidden' : ''}`} onClick={() => scrollByAmount('right')} aria-label="Scroll right">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9.5 5 16.5 12 9.5 19" /></svg>
        </button>
      </div>

      <div className={`outlook-detail ${detailShow ? 'show' : ''}`} dangerouslySetInnerHTML={{ __html: detailHtml }} />
    </section>
  )
}

export default TodayOutlook