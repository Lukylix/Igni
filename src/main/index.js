const electron = require('electron')
const utils = require('@electron-toolkit/utils')
const Store = require('electron-store')
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')
let startMinimized = (process.argv || []).indexOf('--hidden') !== -1
const store = new Store()
function createWindow() {
  let icon
  if (process.platform === 'win32') icon = path.join(__dirname, '../../build/iconOn256.ico')
  else if (process.platform === 'linux') icon = path.join(__dirname, '../../build/iconOn512.png')
  const display = electron.screen.getPrimaryDisplay()
  const { width, height } = display.workAreaSize
  const [x, y] = store.get('windowPosition') || []
  const mainWindow = new electron.BrowserWindow({
    width: 300,
    height: 500,
    x: x ? x : width - 300,
    y: y ? y : height - 500,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: 'hidden',
    resizable: false,
    icon,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })
  let tray
  function createTray(isOn = false) {
    let paths = [
      '../../../build/iconOff16.ico',
      '../../build/iconOff16.ico',
      '../build/iconOff16.ico',
      './build/iconOff16.ico',
      '../../../resources/iconOff16.ico',
      '../../resources/iconOff16.ico',
      '../resources/iconOff16.ico',
      './resources/iconOff16.ico',
      '../../../resources/app.asar.unpacked/resources/iconOff16.ico',
      '../../resources/app.asar.unpacked/resources/iconOff16.ico',
      '../resources/app.asar.unpacked/resources/iconOff16.ico',
      './resources/app.asar.unpacked/resources/iconOff16.ico'
    ]
    if (isOn)
      paths = [
        '../../../build/iconOn16.ico',
        '../../build/iconOn16.ico',
        '../build/iconOn16.ico',
        './build/iconOn16.ico',
        '../../../resources/iconOn16.ico',
        '../../resources/iconOn16.ico',
        '../resources/iconOn16.ico',
        './resources/iconOn16.ico',
        '../../../resources/app.asar.unpacked/resources/iconOn16.ico',
        '../../resources/app.asar.unpacked/resources/iconOn16.ico',
        '../resources/app.asar.unpacked/resources/iconOn16.ico',
        './resources/app.asar.unpacked/resources/iconOn16.ico'
      ]
    let iconFound = false
    for (const path$1 of paths) {
      try {
        if (fs.existsSync(path.join(electron.app.getAppPath(), path$1))) {
          console.log(path.join(__dirname, path$1), ' icon found')
          iconFound = true
          const nativeImageIcon = electron.nativeImage.createFromPath(
            path.join(electron.app.getAppPath(), path$1)
          )
          let appIcon = new electron.Tray(nativeImageIcon)
          const contextMenu = electron.Menu.buildFromTemplate([
            {
              label: 'Show',
              click: function () {
                mainWindow.show()
              }
            },
            {
              label: 'Exit',
              click: function () {
                electron.app.isQuiting = true
                electron.app.quit()
              }
            }
          ])
          appIcon.on('click', function () {
            mainWindow.show()
            tray.destroy()
          })
          appIcon.setToolTip('igni')
          appIcon.setContextMenu(contextMenu)
          return appIcon
        }
      } catch (error) {
        console.log(error)
      }
    }
    console.log('icon not found')
  }
  if (!startMinimized)
    mainWindow.on('ready-to-show', () => {
      mainWindow.show()
    })
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url)
    return { action: 'deny' }
  })
  if (utils.is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key.toLowerCase() === 'f12') {
      mainWindow.webContents.openDevTools()
      event.preventDefault()
    }
  })

  electron.ipcMain.handle('get-screen-size', async (event, data) => {
    event.returnValue = display.workAreaSize
  })

  let isIgnitedStore = false
  electron.ipcMain.on('ignit', async (event, data) => {
    const { isIgnited, schedule } = data
    // if (!isIgnited) {
    //   shutdown.shutdown({ force: true, timerseconds: schedule * 60 })
    // } else {
    //   shutdown.abort()
    // }µ
    const settings = store.get('settings')
    if (isIgnited) {
      exec(`shutdown -s -t ${schedule * 60}`)
      store.set('settings', {
        isIgnited,
        schedule: Date.now() + schedule * 60 * 1000,
        lastSchedule: schedule
      })
      isIgnitedStore = true
    } else {
      exec('shutdown -a')
      store.set('settings', { isIgnited, schedule: null, lastSchedule: settings.lastSchedule })
      isIgnitedStore = false
    }
  })
  electron.ipcMain.on('save-settings', async (event, data) => {
    const settings = store.get('settings')
    const { isIgnited, schedule, lastSchedule } = data
    if (isIgnited !== undefined) settings.isIgnited = isIgnited
    if (schedule !== undefined) settings.schedule = schedule
    if (lastSchedule !== undefined) settings.lastSchedule = lastSchedule
  })
  electron.ipcMain.handle('load-settings', async (event, data) => {
    const settings = store.get('settings')
    if (settings.schedule < Date.now()) {
      store.set('settings', { isIgnited: false, schedule: null })
      return { isIgnited: false, schedule: null }
    }
    return store.get('settings')
  })
  electron.ipcMain.on('minimize-event', async (event) => {
    event.preventDefault()
    mainWindow.hide()
    tray = createTray(isIgnitedStore ? true : false)
  })
  electron.ipcMain.on('restore', async (event) => {
    mainWindow.show()
    tray.destroy()
  })
  electron.ipcMain.on('maximize-event', async () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })
  electron.ipcMain.on('close-event', async () => {
    mainWindow.close()
  })
  if (startMinimized) tray = createTray()

  mainWindow.on('moved', (event, data) => {
    store.set('windowPosition', mainWindow.getPosition())
  })
}

electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId('com.electron')
  electron.app.on('browser-window-created', (_, window) => {
    utils.optimizer.watchWindowShortcuts(window)
  })
  createWindow()
  electron.app.on('activate', function () {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
