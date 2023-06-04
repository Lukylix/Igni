import bloop from '../../assets/bloop.png'

import './bloop.css'

export default function Bloop({ isIgnited, igniteToggle, cliked }) {
  return (
    <>
      <div className="halo-icon-container">
        <div className={`halo-icon ${!isIgnited ? 'not-ignited' : ''}`} />
      </div>
      <div className="icon-container" onClick={igniteToggle}>
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
    </>
  )
}
