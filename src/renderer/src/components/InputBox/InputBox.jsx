import { memo } from 'react'
import box from '../../assets/box.png'

import './inputbox.css'

const InputBox = memo(
  ({
    isFocused = false,
    img: { name: imgName, src },
    name,
    value,
    onChange = () => {},
    onFocus = () => {},
    onBlur = () => {}
  }) => {
    return (
      <div className="input-container">
        <img src={box} alt="box" className="box" />
        <img src={src} alt={imgName} className={imgName} />
        <span className="input-value">{value}</span>

        <input
          type="number"
          id={name}
          value={value}
          maxLength={2}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {isFocused && <div className="glass"></div>}
        <label htmlFor={name} />
      </div>
    )
  }
)
export default InputBox
