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
  const [clikedCampfire, setClikedCampfire] = useState(false)
  const [scheduleTime, setScheduleTime] = useState(0)
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [clickedInput, setClickedInput] = useState(false)
  const [shouldDisplayTime, setShouldDisplayTime] = useState(false)
  const [inputDaysFocused, setInputDaysFocused] = useState(false)
  const [inputHoursFocused, setInputHoursFocused] = useState(false)
  const [inputMinutesFocused, setInputMinutesFocused] = useState(false)

  const igniteToggle = useCallback(() => {
    setClikedCampfire(true)
    setTimout(() => setClikedCampfire(false), 3000)
    setLastInputTime(Date.now())
    if (schedule == 0) return
    !isIgnited ? setScheduleTime(Date.now() + schedule * 1000 * 60) : setScheduleTime(0)
    setIsIgnited(!isIgnited)
    setTimeout(() => ipcRenderer.send('ignit', { isIgnited: !isIgnited, schedule }), 500)
  }, [schedule, isIgnited])

  const onChange = useCallback(
    (e, type) => {
      let value = parseInt(e?.target?.value)
      if (!value) value = 0
      const days = parseInt(schedule / 1440)
      const hours = parseInt((schedule - days * 1440) / 60)
      const minutes = schedule % 60
      if (type === 'days') setSchedule(value * 1440 + hours * 60 + minutes)
      else if (type === 'hours')
        setSchedule((days + parseInt(value / 24)) * 1440 + (value % 24) * 60 + minutes)
      else if (type === 'minutes')
        setSchedule(
          (days + parseInt((hours + (parseInt(value / 60) % 24)) / 24)) * 1440 +
            (hours + (parseInt(value / 60) % 24)) * 60 +
            (value % 60)
        )
    },
    [schedule]
  )

  const onFocus = useCallback(
    (e, type) => {
      const days = parseInt(schedule / 1440)
      const hours = parseInt((schedule - days * 1440) / 60)
      const minutes = schedule % 60

      if (type === 'days') {
        setSchedule(hours * 60 + minutes)
      } else if (type === 'hours') {
        setSchedule(days * 1440 + minutes)
      } else if (type === 'minutes') {
        setSchedule(days * 1440 + hours * 60)
      }
    },
    [schedule]
  )

  const onBlur = useCallback((type) => {
    if (type === 'days') setInputDaysFocused(false)
    else if (type === 'hours') setInputHoursFocused(false)
    else if (type === 'minutes') setInputMinutesFocused(false)
  }, [])

  const handleWeel = useCallback(
    (e) => {
      if (isIgnited) return
      let newSchedule = e.deltaY < 0 ? schedule + 10 : schedule - 10
      newSchedule = newSchedule > 0 ? newSchedule : 0
      setSchedule(newSchedule)
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
    setClickedInput(true)
    setShouldDisplayTime(true)
  }, [schedule, isIgnited])

  const handleCampfireClick = useCallback(() => {
    if (isIgnited) return
    setClickedInput(false)
    setShouldDisplayTime(false)
  }, [schedule, isIgnited, clickedInput])

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
    () => !(currentTime - lastInputTime > 3000) || shouldDisplayTime || clickedInput,
    [lastInputTime, shouldDisplayTime, clickedInput, currentTime]
  )

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
      onChangeHours: (e) => onChange(e, 'hours'),
      onFocusHours: (e) => onFocus(e, 'hours'),
      onBlurHours: () => onBlur('hours')
    }),
    [onChange, onFocus, onBlur]
  )

  const daysCallbacks = useMemo(
    () => ({
      onChangeDays: (e) => onChange(e, 'days'),
      onFocusDays: (e) => onFocus(e, 'days'),
      onBlurDays: () => onBlur('days')
    }),
    [onChange, onFocus, onBlur]
  )

  const minutesCallbacks = useMemo(
    () => ({
      onChangeMinutes: (e) => onChange(e, 'minutes'),
      onFocusMinutes: (e) => onFocus(e, 'minutes'),
      onBlurMinutes: () => onBlur('minutes')
    }),
    [onChange, onFocus, onBlur]
  )

  const flameSrc = useMemo(() => flames[flamePowerOfSchedule - 1], [flamePowerOfSchedule])

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
    })()
  }, [])

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
    schedule,
    cliked: clikedCampfire,
    scheduleTime,
    clickedInput,
    shouldDisplayTimeText
  }
}
