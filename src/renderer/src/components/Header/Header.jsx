const { ipcRenderer } = window.require('electron')

import { ReactComponent as Close } from '../../assets/close.svg'
import { ReactComponent as Minimize } from '../../assets/minimize.svg'

import './header.css'
import { memo, useCallback } from 'react'

const Header = memo(() => {
  const minimize = useCallback(() => ipcRenderer.send('minimize-event'), [])
  const close = useCallback(() => ipcRenderer.send('close-event'), [])

  return (
    <div className="header">
      <div className="dragable"></div>
      <nav className="nav">
        <Minimize fill="white" onClick={minimize} style={{ transform: 'translateY(-2px)' }} />
        <Close height="24px" width="24px" fill="#f3696c" onClick={close} />
      </nav>
    </div>
  )
})
export default Header
