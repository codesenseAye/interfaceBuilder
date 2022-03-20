const {app, BrowserWindow} = require('electron') 
const url = require('url') 
const path = require('path')  

let win  

function createWindow() { 
	win = new BrowserWindow({width: 1200, height: 600, titleBarStyle: "hidden", titleBarOverlay: true, frame: false}) 
	win.setMenuBarVisibility(false);
	win.setAspectRatio(2.505);

	win.setMinimumSize(600, 600/1.5)
	win.setBackgroundColor("#555555")

	win.loadURL(url.format ({ 
		pathname: path.join(__dirname, 'index.html'), 
		protocol: 'file:', 
		slashes: true 
	})) 
}  

app.on('ready', createWindow) 