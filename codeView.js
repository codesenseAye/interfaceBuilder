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
                WebkitTextStrokeWidth: "0px",
                fontFamily: "Consolas, 'Courier New', monospace",
                left: "5px",
                width: "97%", height: "95%",
                WebkitUserSelect: "text"
            }
        }, react.createElement("font", {
            className: "localVariableTextColor"
        }, "local "), react.createElement("font", {
            className: "variableNameTextColor"
        }, "screenGui"), ": ", react.createElement("font", {
            className: "typeNameTextColor"
        }, "ScreenGui"), " = ", react.createElement("font", {
            className: "variableNameTextColor"
        }, "New"), " ", react.createElement("font", {
            className: "stringTextColor"
        }, "\"ScreenGui\" "), "{\n", react.createElement("font", {
            className: "variableNameTextColor"
        }, "    BackgroundColor3"), " = " , react.createElement("font", {
            className: "globalVariableTextColor"
        }, "Color3"), ".", react.createElement("font", {
            className: "tablePropertyTextColor"
        }, "fromRGB"), "(", react.createElement("font", {
            className: "numberTextColor"
        }, "255"), ", ", react.createElement("font", {
            className: "numberTextColor"
        }, "255"), ", ", react.createElement("font", {
            className: "numberTextColor"
        }, "255"), ")\n}")
    }
} 

module.exports = CodeView