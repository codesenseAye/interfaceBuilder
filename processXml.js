let fs = require("fs")

const electron = require('electron');
const os = require("os")

const http = require('http');
const path = require("path");

fs.readFile("./propertiesRef.xml", "utf8", (err, data) => {
    let domparser = new DOMParser();
    let xmlDoc = domparser.parseFromString(data, "text/xml");

    let domBuilder = new XMLSerializer()
    let back = domBuilder.serializeToString(xmlDoc)
})

let saveInterface = (interfaceObjects, animations) => {
    let prompt = new Promise((resolve) => {
        let file = electron.remote.dialog.showSaveDialog({
            title: "Select a save location",
            defaultPath: path.join(__dirname),
            buttonLabel: "Save",
        
            filters: [
                {
                    name: "Interface Builder Project",
                    extensions: ['rbxibp'] // roblox interface builder project
                }
            ],
        
            properties: []
        })

        resolve(file)
    })

    prompt.then((filePath) => {
        if (!filePath) {
            return
        }


    })
}

let exportInterfaceAsRbxmx = (interfaceObjects, animations) => {
    let prompt = new Promise((resolve) => {
        let file = electron.remote.dialog.showSaveDialog({
            title: "Select a save location",
            defaultPath: path.join(__dirname),

            buttonLabel: "Save",
        
            filters: [
                {
                    name: "Roblox XML",
                    extensions: ['rbxmx']
                }
            ],
        
            properties: []
        })

        resolve(file)
    })

    prompt.then((filePath) => {
        if (!filePath) {
            return
        }

        let objectXml = "<roblox  xmlns:xmime=\"http://www.w3.org/2005/05/xmlmime\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:noNamespaceSchemaLocation=\"http://www.roblox.com/roblox.xsd\" version=\"4\"><External>null</External><External>nil</External><Meta name=\"ExplicitAutoJoints\">true</Meta>"
        objectXml += "<Item class=\"ScreenGui\">"
        objectXml += "<Properties>"

        let lastBackslash = filePath.split("").reverse().join("")
        lastBackslash = filePath.length - lastBackslash.search(/\\/)

        let fileName = filePath.substr(lastBackslash)
        fileName = fileName.substr(0, fileName.length - 6)

        objectXml += `<string name=\"Name\">${fileName}</string>`
        objectXml += "</Properties>"

        let loopChildren = (parentState, children) => {
            for (let i in children) {
                let child = children[i]

                if (child == null) {
                    continue
                }
    
                objectXml += `<Item class=\"${child.state.ClassName}\">`
                objectXml += `<Properties>`
               
                for (let index in child.state.props) {
                    let value = child.state.props[index]
                    
                    if (index == "Position" || index == "Size") {
                        objectXml += `<UDim2 name=\"${index}\">`
                        objectXml += `<XS>${value.x / 1920}</XS>`
                        objectXml += `<XO>0</XO>`
                        objectXml += `<YS>${value.y / 1080}</YS>`
                        objectXml += `<YO>0</YO>`
                        objectXml += `</UDim2>`
                    } else if (index == "BackgroundColor3" || index == "ImageColor3") {
                        objectXml += `<Color3 name=\"${index}\">`
                        objectXml += `<R>${value.R}</R>`
                        objectXml += `<G>${value.G}</G>`
                        objectXml += `<B>${value.B}</B>`
                        objectXml += `</Color3>`
                    }
                }
    
                objectXml += `</Properties>`

                loopChildren(child.state, child.children)
                objectXml += "</Item>"
            }
        }
        
        loopChildren(null, interfaceObjects)
        
        objectXml += "</Item>"
        objectXml += "</roblox>"

        fs.writeFile(filePath, objectXml)
    })
}

let groupId = null
let title = "hi"
let description = "hello"

let url = "https://www.roblox.com/ide/publish/uploadnewanimation" +
"?assetTypeName=Animation" +
`&name=${encodeURIComponent(title)}` +
`&description=${encodeURIComponent(description)}` +
"&AllID=1" +
"&ispublic=False" +
"&allowComments=True" +
"&isGamesAsset=False" +
(groupId != null ? `&groupId=${groupId}` : "")

let response = fetch(url, {
    body: {},
    method: "POST",

    headers: {}
})

http.createServer((req, res) => {
    let body = []

    req.on("data", (chunk) => {
        body.push(chunk)
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        console.log(body)
        
        let jObj = JSON.parse(body)
        console.log(jObj)
        // at this point, `body` has the entire request body stored in it as a string
    });

    res.write('Hello World!');
    res.end();
}).listen(1337, "localhost");
console.log(os.networkInterfaces())

//window.open("https://developer.mozilla.org", null, "frame=true")
module.exports = {saveInterface: saveInterface, exportInterfaceAsRbxmx: exportInterfaceAsRbxmx}