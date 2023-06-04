import { useCallback, useEffect, useMemo, useState } from 'react'
import flame1 from '../assets/flame/1-no-stroke.png'
import flame2 from '../assets/flame/2-no-stroke.png'
import flame3 from '../assets/flame/3-no-stroke.png'
import flame4 from '../assets/flame/4-no-stroke.png'

const { ipcRenderer } = window.require('electron')

export default function useIgniLogic() {
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

  const igniteToggle = useCallback(() => {
    setCliked(true)
    setLastInputTime(Date.now())
    if (schedule == 0) return
    !isIgnited ? setScheduleTime(Date.now() + schedule * 1000 * 60) : setScheduleTime(0)
    setIsIgnited(!isIgnited)
    setTimeout(() => ipcRenderer.send('ignit', { isIgnited: !isIgnited, schedule }), 500)
  }, [schedule, isIgnited])

  const onChangeMinutes = useCallback(
    (e) => {
      let value = parseInt(e?.target?.value)
      if (!value) value = 0

      setSchedule(
        (days + parseInt((hours + (parseInt(value / 60) % 24)) / 24)) * 1440 +
          (hours + (parseInt(value / 60) % 24)) * 60 +
          (value % 60)
      )
      setHours((hours + parseInt(value / 60)) % 24)
      setDays((days + parseInt((hours + parseInt(value / 60)) / 24)) % 99)
      setMinutes(value % 60)
    },
    [days, hours, minutes]
  )

  const onChangeHours = useCallback(
    (e) => {
      let value = parseInt(e.target.value)
      if (!value) value = 0

      setSchedule((days + parseInt(value / 24)) * 1440 + (value % 24) * 60 + minutes)
      setDays((days + parseInt(value / 24)) % 99)
      setHours(value % 99)
    },
    [days, hours, minutes]
  )

  const onChangeDays = useCallback(
    (e) => {
      let value = parseInt(e.target.value)
      if (!value) value = 0

      setSchedule(value * 1440 + hours * 60 + minutes)
      setDays(value % 99)
    },
    [days, hours, minutes]
  )

  const onFocusMinutes = useCallback(
    (e) => {
      setMinutes(0)
      setSchedule(days * 1440 + hours * 60 + 0)
      setInputMinutesFocused(true)
    },
    [days, hours, minutes]
  )

  const onFocusHours = useCallback(
    (e) => {
      setHours(0)
      setSchedule(days * 1440 + minutes)
      setInputHoursFocused(true)
    },
    [days, hours, minutes]
  )

  const onFocusDays = useCallback(
    (e) => {
      setDays(0)
      setSchedule(hours * 60 + minutes)
      setInputDaysFocused(true)
    },
    [days, hours, minutes]
  )

  const handleWeel = useCallback(
    (e) => {
      if (isIgnited) return
      let newSchedule = e.deltaY < 0 ? schedule + 10 : schedule - 10
      newSchedule = newSchedule > 0 ? newSchedule : 0
      setSchedule(newSchedule)
      setMinutes(newSchedule % 60)
      setHours(parseInt((newSchedule / 60) % 24))
      setDays(parseInt(parseInt((newSchedule / 60) % 24) / 24))
      setLastInputTime(Date.now())
    },
    [schedule, isIgnited]
  )

  const handleMouseDown = useCallback(
    (e) => {
      setShouldDisplayTime(true)
      const windowHeight = window.innerHeight

      const elmentHeight = e.target.getBoundingClientRect().height
      setInitialMouseY(elmentHeight - (e.clientY - (windowHeight - elmentHeight)))
      setInitialSchedule(schedule)
      setIsClicked(true)
    },
    [schedule]
  )

  const handleMouseUp = useCallback((e) => {
    setIsClicked(false)
    setShouldDisplayTime(false)
  }, [])

  const handleMouseMove = useCallback(
    (e) => {
      if (!isClicked) return
      setLastInputTime(Date.now())
      if (isIgnited) return
      const windowHeight = window.innerHeight

      const elmentHeight = e.target.getBoundingClientRect().height
      const y = e.clientY

      const newY = elmentHeight - (y - (windowHeight - elmentHeight))
      const newSchedule = newY - initalMouseY + initialSchedule
      setSchedule(newSchedule > 0 ? newSchedule : 0)
    },
    [schedule, isClicked, isIgnited]
  )

  const handleDoubleClick = useCallback(() => {
    if (isIgnited) return
    const days = Math.floor(schedule / 1440)
    const hours = schedule - days * 1440 > 60 ? Math.floor((schedule - days * 1440) / 60) : 0
    const minutes = schedule - days * 1440 - hours * 60
    setDays(days)
    setHours(hours)
    setMinutes(minutes)
    setClickedInput(true)
    setShouldDisplayTime(true)
  }, [schedule, isIgnited])

  const handleCampfireClick = useCallback(() => {
    if (isIgnited) return
    if (clickedInput) {
      setSchedule(days * 1440 + hours * 60 + minutes)
    }
    setClickedInput(false)
    setShouldDisplayTime(false)
  }, [schedule, isIgnited, clickedInput])

  const onBlurMinutes = useCallback(() => {
    setInputMinutesFocused(false)
  }, [])

  const onBlurHours = useCallback(() => {
    setInputHoursFocused(false)
  }, [])

  const onBlurDays = useCallback(() => {
    setInputDaysFocused(false)
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

  const shouldDisplayTimeText = useMemo(
    () => !(Date.now() - lastInputTime > 3000) || shouldDisplayTime || clickedInput,
    [lastInputTime, shouldDisplayTime, clickedInput]
  )

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

  useEffect(() => {
    if (shloudRerender) setShloudRerender(false)
  }, [shloudRerender])

  useEffect(() => {
    let timeout = setTimeout(() => setShloudRerender(true), 3000)
    return () => clearTimeout(timeout)
  }, [lastInputTime])

  const campfireCallbacks = useMemo(
    () => ({
      handleMouseUp,
      handleMouseDown,
      handleMouseMove,
      handleDoubleClick,
      handleCampfireClick,
      handleWeel
    }),
    [
      handleMouseUp,
      handleMouseDown,
      handleMouseMove,
      handleDoubleClick,
      handleCampfireClick,
      handleWeel
    ]
  )

  const hoursCallbacks = useMemo(
    () => ({
      onChangeHours,
      onFocusHours,
      onBlurHours
    }),
    [onChangeHours, onFocusHours, onBlurHours]
  )

  const daysCallbacks = useMemo(
    () => ({
      onChangeDays,
      onFocusDays,
      onBlurDays
    }),
    [onChangeDays, onFocusDays, onBlurDays]
  )

  const minutesCallbacks = useMemo(
    () => ({
      onChangeMinutes,
      onFocusMinutes,
      onBlurMinutes
    }),
    [onChangeMinutes, onFocusMinutes, onBlurMinutes]
  )

  const flameSrc = useMemo(() => flames[flamePowerOfSchedule - 1], [flamePowerOfSchedule])

  return {
    hoursCallbacks,
    daysCallbacks,
    minutesCallbacks,

    igniteToggle,
    handleMouseMove,

    campfireCallbacks,
    inputDaysFocused,
    inputHoursFocused,
    inputMinutesFocused,
    flameSrc,
    haloSize,
    isIgnited,
    days,
    hours,
    minutes,
    schedule,
    cliked,
    scheduleTime,
    clickedInput,
    shouldDisplayTimeText
  }
}
