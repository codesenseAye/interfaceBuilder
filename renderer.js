const remote = require('electron').remote;
const win = remote.getCurrentWindow(); 

document.onreadystatechange = (event) => {
    if (document.readyState == "complete") {
        handleWindowControls();
    }
};

window.onbeforeunload = (event) => {
    win.removeAllListeners();
}

function handleWindowControls() {
    let appMenuDrawer = document.createElement("div")
    appMenuDrawer.className = "appDrawerIn"
    
    appMenuDrawer.style.position = "absolute"
    appMenuDrawer.style.left = "10px"
    
    appMenuDrawer.style.top = "35px"
    appMenuDrawer.style.backgroundColor = "rgb(200,200,200)"
    appMenuDrawer.style.borderRadius = "3px"

    appMenuDrawer.style.height = "min-content"
    appMenuDrawer.style.width = "min-content"

    appMenuDrawer.id = "appDrawer"
    appMenuDrawer.style.border = "2px rgb(100,100,100) solid"

    let save = document.createElement("button")
    let open = document.createElement("button")
    let exportAsRbxmx = document.createElement("button")
    
    save.style.margin = "10px"
    save.style.backgroundColor = "rgb(150,150,150)"

    save.style.border = "1px rgb(100,100,100) solid"
    save.style.borderRadius = "3px"

    open.style.margin = "10px"
    open.style.marginTop = "0px"

    open.style.backgroundColor = "rgb(150,150,150)"
    open.style.border = "1px rgb(100,100,100) solid"
    open.style.borderRadius = "3px"
    
    exportAsRbxmx.style.margin = "10px"
    exportAsRbxmx.style.marginTop = "0px"

    exportAsRbxmx.style.backgroundColor = "rgb(150,150,150)"
    exportAsRbxmx.style.border = "1px rgb(100,100,100) solid"
    exportAsRbxmx.style.borderRadius = "3px"

    save.innerHTML = "SAVE"
    open.innerHTML = "OPEN"
    exportAsRbxmx.innerHTML = "EXPORT AS RBXMX"

    save.id = "saveBttn"
    open.id = "openBttn"
    exportAsRbxmx.id = "exportAsRbxmxBttn"

    save.style.color = "rgb(255,255,255)"
    open.style.color = "rgb(255,255,255)"
    exportAsRbxmx.style.color = "rgb(255,255,255)"

    save.style.fontFamily = "Fredoka One"
    open.style.fontFamily = "Fredoka One"
    exportAsRbxmx.style.fontFamily = "Fredoka One"

    save.style.WebkitTextStroke = "1px black"
    open.style.WebkitTextStroke = "1px black"
    exportAsRbxmx.style.WebkitTextStroke = "1px black"

    appMenuDrawer.appendChild(save)
    appMenuDrawer.appendChild(open)
    appMenuDrawer.appendChild(exportAsRbxmx)

    document.getElementById("topbar").appendChild(appMenuDrawer)
    
    let closeDrawer = document.createElement("div")
    closeDrawer.id = "closeAppDrawer"

    closeDrawer.style.position = "absolute"
    
    closeDrawer.style.height = "100%"
    closeDrawer.style.width = "100%"

    closeDrawer.style.visibility = "hidden"
    document.body.appendChild(closeDrawer)
    
    document.getElementById('appMenu').addEventListener("click", event => {
        appMenuDrawer.className = appMenuDrawer.className == "appDrawerIn" ? "appDrawerOut" : "appDrawerIn"
        closeDrawer.style.visibility = appMenuDrawer.className == "appDrawerIn" ? "hidden" : "visible"
    });

    closeDrawer.onmousedown = () => {
        appMenuDrawer.className = "appDrawerIn"
        closeDrawer.style.visibility = "hidden"
    }

    document.getElementById('min-button').addEventListener("click", event => {
        win.minimize();
    });

    document.getElementById('icon-restore').src = "./icons/restore.png"

    document.getElementById('restore-button').addEventListener("click", event => {
        if (win.isMaximized()) {
            document.getElementById('icon-restore').src = "./icons/restore.png"
            win.unmaximize();
        } else {
            document.getElementById('icon-restore').src = "./icons/maximize.png"
            win.maximize()
        }
    });

    document.getElementById('close-button').addEventListener("click", event => {
        win.close();
    });
}