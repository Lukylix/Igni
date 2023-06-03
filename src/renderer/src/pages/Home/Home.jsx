import rondin from '../../assets/rondin.png'
import flame1 from '../../assets/flame/1-no-stroke.png'
import flame2 from '../../assets/flame/2-no-stroke.png'
import flame3 from '../../assets/flame/3-no-stroke.png'
import flame4 from '../../assets/flame/4-no-stroke.png'
import clouds from '../../assets/clouds.png'
import bloop from '../../assets/bloop.png'
import box from '../../assets/box.png'
import log from '../../assets/log64.png'
import twig from '../../assets/twig64.png'
import stick from '../../assets/stick64.png'

import './home.css'
import { useEffect, useMemo, useRef, useState } from 'react'

const { ipcRenderer } = window.require('electron')

const prettyTimePrint = (mins) => {
  const days = Math.floor(mins / 1440)
  const hours = mins - days * 1440 > 60 ? Math.floor((mins - days * 1440) / 60) : 0
  const minutes = mins - days * 1440 - hours * 60
  return `${days ? days + 'd' : ''}${hours ? hours + 'h' : ''}${minutes}m`
}

function Home() {
  const [schedule, setSchedule] = useState(1)
  const [isClicked, setIsClicked] = useState(false)
  const [initalMouseY, setInitialMouseY] = useState(0)
  const [initialSchedule, setInitialSchedule] = useState(0)
  const [isIgnited, setIsIgnited] = useState(false)
  const [lastInputTime, setLastInputTime] = useState(0)
  const [cliked, setCliked] = useState(false)
  const [shloudRerender, setShloudRerender] = useState(false)
  const [scheduleTime, setScheduleTime] = useState(0)
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [clickedInput, setClickedInput] = useState(false)
  const [shouldDisplayTime, setShouldDisplayTime] = useState(false)
  const [inputDaysFocused, setInputDaysFocused] = useState(false)
  const [inputHoursFocused, setInputHoursFocused] = useState(false)
  const [inputMinutesFocused, setInputMinutesFocused] = useState(false)
  const [forceInputRerender, setForceInputRerender] = useState(false)

  useEffect(() => {
    if (cliked) setTimeout(() => setCliked(false), 500)
  }, [cliked])

  useEffect(() => {
    const iterval = setInterval(() => setCurrentTime(Date.now()), 1000)
    return () => clearInterval(iterval)
  }, [])

  useEffect(() => {
    ;(async () => {
      const settings = await ipcRenderer.invoke('load-settings')
      setIsIgnited(settings?.isIgnited)
      setScheduleTime(settings?.schedule)
      setSchedule(settings?.lastSchedule)
      setSchedule(settings.schedule - Date.now() > 0 ? settings.schedule - Date.now() : 0)
    })()
  }, [])

  const flamePowerOfSchedule = useMemo(() => {
    let choosedSchedule = schedule
    if (isIgnited) choosedSchedule = parseInt((scheduleTime - currentTime) / 1000 / 60)
    if (choosedSchedule > 60) return 1
    else if (choosedSchedule > 30) return 2
    else if (choosedSchedule > 5) return 3
    else if (choosedSchedule > 0) return 4
    return 4
  }, [schedule, currentTime, isIgnited, scheduleTime])

  const handleWeel = (e) => {
    if (isIgnited) return
    const newSchedule = e.deltaY < 0 ? schedule + 10 : schedule - 10
    setSchedule(newSchedule > 0 ? parseInt(newSchedule) : 0)
    setLastInputTime(Date.now())
  }

  const handleMouseDown = (e) => {
    setShouldDisplayTime(true)
    const windowHeight = window.innerHeight

    const elmentHeight = e.target.getBoundingClientRect().height
    setInitialMouseY(elmentHeight - (e.clientY - (windowHeight - elmentHeight)))
    setInitialSchedule(schedule)
    setIsClicked(true)
  }

  const handleMouseUp = (e) => {
    setIsClicked(false)
    setShouldDisplayTime(false)
  }

  const handleMouseMove = (e) => {
    if (!isClicked) return
    setLastInputTime(Date.now())
    if (isIgnited) return
    const windowHeight = window.innerHeight

    const elmentHeight = e.target.getBoundingClientRect().height
    const y = e.clientY

    const newY = elmentHeight - (y - (windowHeight - elmentHeight))
    const newSchedule = newY - initalMouseY + initialSchedule
    setSchedule(newSchedule > 0 ? newSchedule : 0)
  }

  const handleDoubleClick = () => {
    if (isIgnited) return
    const days = Math.floor(schedule / 1440)
    const hours = schedule - days * 1440 > 60 ? Math.floor((schedule - days * 1440) / 60) : 0
    const minutes = schedule - days * 1440 - hours * 60
    setDays(days)
    setHours(hours)
    setMinutes(minutes)
    setClickedInput(true)
    setShouldDisplayTime(true)
  }

  const handleCampfireClick = () => {
    if (isIgnited) return
    if (clickedInput) {
      setSchedule(days * 1440 + hours * 60 + minutes)
    }
    setClickedInput(false)
    setShouldDisplayTime(false)
  }

  const flames = useMemo(() => [flame1, flame2, flame3, flame4], [])

  const haloSize = useMemo(() => {
    let halo1, halo2

    if (flamePowerOfSchedule == 1) {
      halo1 = 256
      halo2 = 150
    } else if (flamePowerOfSchedule == 2) {
      halo1 = 200
      halo2 = 100
    } else if (flamePowerOfSchedule == 3) {
      halo1 = 150
      halo2 = 50
    } else if (flamePowerOfSchedule == 4) {
      halo1 = 100
      halo2 = 0
    } else {
      console.error('Invalid flame value', flame)
      halo1 = 256
      halo2 = 150
    }

    return { halo1, halo2 }
  }, [flamePowerOfSchedule])

  useEffect(() => {
    if (shloudRerender) setShloudRerender(false)
  }, [shloudRerender])

  useEffect(() => {
    let timeout = setTimeout(() => setShloudRerender(true), 3000)
    return () => clearTimeout(timeout)
  }, [lastInputTime])

  return (
    <>
      <div
        className="campfire"
        onMouseOutCapture={handleMouseUp}
        onMouseUpCapture={handleMouseUp}
        onMouseDownCapture={handleMouseDown}
        onMouseMove={handleMouseMove}
        onDoubleClick={handleDoubleClick}
        onClick={handleCampfireClick}
        onWheel={handleWeel}
      >
        <div className="clouds-container">
          <img src={clouds} alt="clouds" className="clouds" />
          <img src={clouds} alt="clouds" className="clouds" />
        </div>
        <div className="halo-container">
          <div className="halo-1 halo" style={{ height: haloSize.halo1, width: haloSize.halo1 }} />
          <div className="halo-2 halo" style={{ height: haloSize.halo2, width: haloSize.halo2 }} />
        </div>

        <div className="flame-container">
          <img src={flames[flamePowerOfSchedule - 1]} alt="flame" className="flame" />
        </div>
        <img src={rondin} alt="rondin" className="rondin" />
        {(!(Date.now() - lastInputTime > 3000) || shouldDisplayTime || clickedInput) && (
          <h1 className="schedule">
            {prettyTimePrint(
              isIgnited ? parseInt((scheduleTime - Date.now()) / 1000 / 60) : schedule
            )}
          </h1>
        )}
        <div className="glass"></div>
        <div className="halo-icon-container">
          <div className={`halo-icon ${!isIgnited ? 'not-ignited' : ''}`} />
        </div>
        <div
          className="icon-container"
          onClick={() => {
            setCliked(true)
            setLastInputTime(Date.now())
            if (schedule == 0) return
            !isIgnited ? setScheduleTime(Date.now() + schedule * 1000 * 60) : setScheduleTime(0)
            setIsIgnited(!isIgnited)
            setTimeout(() => ipcRenderer.send('ignit', { isIgnited: !isIgnited, schedule }), 500)
          }}
        >
          <img
            src={bloop}
            alt="Ignit Off Icon"
            className={`icon ${isIgnited ? 'ignited' : ''} ${cliked ? 'clicked' : ''} `}
          />
          <img
            src={bloop}
            alt="Ignit Off Icon"
            className={`icon icon-top ${isIgnited ? 'ignited' : ''} ${cliked ? 'clicked' : ''} `}
          />
          <div className="glass"></div>
        </div>
        {clickedInput && (
          <div className="inputs-container" onClick={(e) => e.stopPropagation()}>
            <div className="input-container">
              <img src={box} alt="box" className="box" />
              <img src={log} alt="log" className="log" />
              <span className="input-value">{days}</span>
              <input
                type="number"
                id="days"
                value={days}
                maxLength={2}
                onChange={(e) => {
                  let value = parseInt(e.target.value)
                  if (!value) value = 0

                  setSchedule(value * 1440 + hours * 60 + minutes)
                  setDays(value % 99)
                }}
                onFocus={(e) => {
                  setDays(0)
                  setSchedule(hours * 60 + minutes)
                  setInputDaysFocused(true)
                }}
                onBlur={() => setInputDaysFocused(false)}
              />
              {inputDaysFocused && <div className="glass"></div>}
              <label htmlFor="days" />
            </div>
            <div className="input-container">
              <img src={box} alt="box" className="box" />
              <img src={twig} alt="twig" className="twig" />
              <span className="input-value">{hours}</span>
              <input
                type="number"
                value={hours}
                id="hours"
                maxLength={2}
                onChange={(e) => {
                  let value = parseInt(e.target.value)
                  if (!value) value = 0

                  setSchedule((days + parseInt(value / 24)) * 1440 + (value % 24) * 60 + minutes)
                  setDays((days + parseInt(value / 24)) % 99)
                  setHours(value % 99)
                }}
                onFocus={(e) => {
                  setHours(0)
                  setSchedule(days * 1440 + minutes)
                  setInputHoursFocused(true)
                }}
                onBlur={() => setInputHoursFocused(false)}
              />
              {inputHoursFocused && <div className="glass"></div>}
              <label htmlFor="hours" />
            </div>
            <div className="input-container">
              <img src={box} alt="box" className="box" />
              <img src={stick} alt="stick" className="stick" />
              <span className="input-value">{minutes}</span>

              <input
                type="number"
                id="minutes"
                value={minutes}
                maxLength={2}
                onChange={(e) => {
                  let value = parseInt(e.target.value)
                  if (!value) value = 0

                  setSchedule(
                    (days + parseInt((hours + (parseInt(value / 60) % 24)) / 24)) * 1440 +
                      (hours + (parseInt(value / 60) % 24)) * 60 +
                      (value % 60)
                  )
                  setHours((hours + parseInt(value / 60)) % 24)
                  setDays((days + parseInt((hours + parseInt(value / 60)) / 24)) % 99)
                  setMinutes(value % 60)
                }}
                onFocus={(e) => {
                  setMinutes(0)
                  setSchedule(days * 1440 + hours * 60 + 0)
                  setInputMinutesFocused(true)
                }}
                onBlur={() => setInputMinutesFocused(false)}
              />
              {inputMinutesFocused && <div className="glass"></div>}
              <label htmlFor="minutes" />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Home
