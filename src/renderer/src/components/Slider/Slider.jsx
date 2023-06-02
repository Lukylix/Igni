import { useCallback } from 'react'
import './slider.css'

const Slider = ({ value, min, max, onChange = () => {} }) => {
  const handleChange = useCallback((event) => {
    onChange(event.target.value)
  }, [])

  return (
    <input
      className="slider-input"
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={handleChange}
    />
  )
}

export default Slider
