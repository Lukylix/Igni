import rondin from '../../assets/rondin.png'
import flame1 from '../../assets/flame/1-no-stroke.png'
import flame2 from '../../assets/flame/2-no-stroke.png'
import flame3 from '../../assets/flame/3-no-stroke.png'
import flame4 from '../../assets/flame/4-no-stroke.png'
import clouds from '../../assets/clouds.png'
import bloop from '../../assets/bloop.png'

import './home.css'
import { useEffect, useMemo, useState } from 'react'

const { ipcRenderer } = window.require('electron')

const prettyTimePrint = (mins) => {
  const days = Math.floor(mins / 1440)
  const hours = Math.floor((mins % 1440) / 60)
  const minutes = mins % 60
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

  useEffect(() => {
    console.log('schedule time', scheduleTime)
  }, [scheduleTime])
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
    if (choosedSchedule > 120) return 1
    else if (choosedSchedule > 90) return 2
    else if (choosedSchedule > 60) return 3
    else if (choosedSchedule > 30) return 4
    return 4
  }, [schedule, currentTime, isIgnited, scheduleTime])

  const handleWeel = (e) => {
    if (isIgnited) return
    const newSchedule = e.deltaY < 0 ? schedule + 10 : schedule - 10
    setSchedule(newSchedule > 0 ? parseInt(newSchedule) : 0)
    setLastInputTime(Date.now())
  }

  const handleMouseDown = (e) => {
    const windowHeight = window.innerHeight

    const elmentHeight = e.target.getBoundingClientRect().height
    setInitialMouseY(elmentHeight - (e.clientY - (windowHeight - elmentHeight)))
    setInitialSchedule(schedule)
    setIsClicked(true)
  }

  const handleMouseUp = (e) => {
    setIsClicked(false)
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
        {!(Date.now() - lastInputTime > 3000) && (
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
      </div>
    </>
  )
}

export default Home
