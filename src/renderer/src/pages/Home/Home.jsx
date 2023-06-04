import rondin from '../../assets/rondin.png'
import clouds from '../../assets/clouds.png'
import log from '../../assets/log64.png'
import twig from '../../assets/twig64.png'
import stick from '../../assets/stick64.png'

import InputBox from '../../components/InputBox/InputBox'
import useIgniLogic from '../../hooks/useIgniLogic'

import './home.css'
import Bloop from '../../components/Bloop/Bloop'

const prettyTimePrint = (mins) => {
  const days = Math.floor(mins / 1440)
  const hours = mins - days * 1440 > 60 ? Math.floor((mins - days * 1440) / 60) : 0
  const minutes = mins - days * 1440 - hours * 60
  return `${days ? days + 'd' : ''}${hours ? hours + 'h' : ''}${minutes}m`
}

function Home() {
  const {
    igniteToggle,
    haloSize,
    isIgnited,
    days,
    hours,
    minutes,
    schedule,
    cliked,
    scheduleTime,
    clickedInput,
    shouldDisplayTimeText,
    campfireCallbacks,
    daysCallbacks,
    hoursCallbacks,
    minutesCallbacks,
    flameSrc,
    inputDaysFocused,
    inputHoursFocused,
    inputMinutesFocused
  } = useIgniLogic()

  const {
    handleMouseUp,
    handleMouseDown,
    handleMouseMove,
    handleDoubleClick,
    handleCampfireClick,
    handleWeel
  } = campfireCallbacks

  const { onChangeHours, onFocusHours, onBlurHours } = hoursCallbacks

  const { onChangeDays, onFocusDays, onBlurDays } = daysCallbacks

  const { onChangeMinutes, onFocusMinutes, onBlurMinutes } = minutesCallbacks

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
          <img src={flameSrc} alt="flame" className="flame" />
        </div>
        <img src={rondin} alt="rondin" className="rondin" />
        {shouldDisplayTimeText && (
          <h1 className="schedule">
            {prettyTimePrint(
              isIgnited ? parseInt((scheduleTime - Date.now()) / 1000 / 60) : schedule
            )}
          </h1>
        )}
        <div className="glass"></div>
        <Bloop isIgnited={isIgnited} igniteToggle={igniteToggle} cliked={cliked} />
        {clickedInput && (
          <div className="inputs-container" onClick={(e) => e.stopPropagation()}>
            <InputBox
              isFocused={inputDaysFocused}
              img={{ name: 'log', src: log }}
              name="days"
              value={days}
              onChange={onChangeDays}
              onFocus={onFocusDays}
              onBlur={onBlurDays}
            />
            <InputBox
              isFocused={inputHoursFocused}
              img={{ name: 'twig', src: twig }}
              name="hours"
              value={hours}
              onChange={onChangeHours}
              onFocus={onFocusHours}
              onBlur={onBlurHours}
            />
            <InputBox
              isFocused={inputMinutesFocused}
              img={{ name: 'stick', src: stick }}
              name="minutes"
              value={minutes}
              onChange={onChangeMinutes}
              onFocus={onFocusMinutes}
              onBlur={onBlurMinutes}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default Home
