const { app, BrowserWindow } = require("electron");
const path = require("path"); // Manejar rutas

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    backgroundColor: '#050505',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,   // Mantener aislado el proceso
      // preload: path.join(__dirname, 'preload.js') // Para funciones de node 
    }
  });

  win.loadFile("index.html");

  // Abrir herramimientas de desarrollo 
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});