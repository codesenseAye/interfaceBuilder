let react = require("react")
let reactDom = require("react-dom")

class CodeView extends react.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return react.createElement("div", {
            style: {
                position: "absolute",
                color: "rgb(255,255,255)",
                overflowY: "auto",
                overflowX: "auto",
                wordBreak: "none",
                whiteSpace: "pre",
                fontSize: "14px",
                WebkitTextStrokeColor: "rgb(0,0,0)",
                WebkitTextStrokeWidth: "1px",
                fontFamily: "Fredoka One",
                left: "5px",
                width: "97%", height: "95%"
            }
        }, ('local screenGui: ScreenGui = New "ScreenGui" {\n\tBackgroundColor3 = Color3.fromRGB(255, 255, 255)\n}\n\n').repeat(25))
    }
} 

module.exports = CodeView