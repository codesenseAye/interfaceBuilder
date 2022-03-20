const react = require("react")
const reactdom = require("react-dom")
const lodash = require("lodash")
const { useState } = require("react")

const properties = {
    Frame: require("./propertyData/frame.json"),
    ImageButton: require("./propertyData/imageButton.json"),
    ImageLabel: require("./propertyData/imageLabel.json"),
    TextLabel: require("./propertyData/textLabel.json"),
    TextButton: require("./propertyData/textButton.json"),
    ScrollingFrame: require("./propertyData/scrollingFrame.json"),
    UICorner: require("./propertyData/uiCorner.json"),
    UIGradient: require("./propertyData/uiGradient.json"),
    UIListLayout: require("./propertyData/uiListLayout.json"),
    UIPadding: require("./propertyData/uiPadding.json"),
    UIPageLayout: require("./propertyData/uiPageLayout.json"),
    UIStroke: require("./propertyData/uiStroke.json"),
}

const enums = {
    Font: require("../enums/font.json")
}

let hexToRgbAlpha = (hex) => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        R: parseInt(result[1], 16) / 255,
        G: parseInt(result[2], 16) / 255,
        B: parseInt(result[3], 16) / 255
    } : null;
}

let componentToHex = (c) => {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

let rgbToHex = (r, g, b) => {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

let compareValues = (lastValue, currentValue, propType) => {
    if (propType == "UDim2") {
        return lastValue.x != currentValue.x || lastValue.y != currentValue.y
    } else if (propType == "Color3") {
        return lastValue.R != currentValue.R || lastValue.G != currentValue.G || lastValue.B != currentValue.B
    } else {
        return lastValue != currentValue
    }
}

class Property extends react.Component {
    constructor(props) {
        super(props)
        this.id = Math.random() * 1e9

        this.updateInput = this.updateInput.bind(this)
    }

    updateInput() {
        let property = properties[this.props.element.state.ClassName][this.props.name]
        let value = this.props.element.state.props[this.props.name]

        if (value == null) {
            value = property.default || ""
        }

        let element = document.getElementById(this.props.element.props.parentId)
        let inputElement = document.getElementById(this.id)

        this.lastValue = value

        if (property.type == "Color3") {
            inputElement.value = rgbToHex(value.R * 255, value.G * 255, value.B * 255)
        } else if (property.type == "UDim2") {
            let udim2 = this.props.element.state.props[this.props.name]
            inputElement.value = "{0, " + udim2.x + "}, {0, " + udim2.y + "}"
        } else if (property.type == "boolean") {
            inputElement.checked = value == 1
        } else if (property.type == "CornerRadius") {
            inputElement.value = value
        } else if (property.type == "File") {
            // cant set value field because its a file input
        } else if (inputElement) {
            inputElement.value = value
        }

    }

    componentDidMount() {
        this.updateInput()

        this.checkValue = setInterval(() => {
            let property = properties[this.props.element.state.ClassName][this.props.name]
            let value = this.props.element.state.props[this.props.name] || property.default || ""

            if (compareValues(this.lastValue, value, property.type)) {
                this.updateInput()
            }
        }, 60)
    }

    componentWillUnmount() {
        clearInterval(this.checkValue)
    }

    componentDidUpdate() {
        this.updateInput()
    }

    render() {
        let valueChanged = (e) => {
            let className = this.props.element.state.ClassName

            let property = properties[className][this.props.name]
            let propertyType = property.type

            let inputField = document.getElementById(this.id)
            let base = e && e.target || inputField

            let value =  e && e.target.value || document.getElementById(this.id).value
            let props = lodash.cloneDeep(this.props.element.state.props)

            if (propertyType == "Color3") {
                props[this.props.name] = hexToRgbAlpha(value)
            } else if (propertyType == "UDim2") {
                let nums = value.match(/\d+/g)
                let prop = props[this.props.name]

                props[this.props.name] = {x: nums[1] || prop.x, y: nums[3] || prop.y}
            } else if (propertyType == "Enum") {
                props[this.props.name] = value
            } else if (propertyType == "boolean") {
                props[this.props.name] = base.checked ? 1 : 0
            } else if (propertyType == "File") {
                if (e.__doReset) {
                    props[this.props.name] = property.default
                    inputField.value = ""
                } else {
                    props[this.props.name] = inputField.files[0]
                }

                let image = props[this.props.name]
                let label = document.getElementById(this.id + "_label")
                
                let reset = document.getElementById(this.id + "_reset")
                let isImageFile = typeof image == "object"

                label.textContent = isImageFile ? image.path : typeof image == "string" ? image : "SELECT IMAGE"
                reset.style.visibility = isImageFile ? "visible" : "hidden" 
            } else {
                props[this.props.name] = value
            }

            this.props.element.setState({
                props: props
            })
        }

        let getInput = () => {
            if (propertyType == "number") {
                return (<input type="number" id={this.id} onInput={valueChanged}></input>)
            } else if (propertyType == "Color3") {
                return (<input id={this.id} type="color" key={this.id} onInput={valueChanged}></input>)
            }  else if (propertyType == "boolean") {
                return (<input id={this.id} type="checkbox" key={this.id} onChange={valueChanged}></input>)
            } else if (propertyType == "Enum") {
                let fonts = []
                
                for (let fontName in enums[this.props.name]) {
                    fonts.push(<option value={fontName}>{fontName}</option>)
                }
                
                return (<select id={this.id} key={this.id} onInput={valueChanged}>
                    {fonts}
                </select>)
            } else if (propertyType == "string") {
                return (<input id={this.id} type="text" key={this.id} onInput={valueChanged}></input>)
            } else if (propertyType == "UDim") {
                return (<input id={this.id} type="text" key={this.id} onInput={valueChanged}></input>)
            } else if (propertyType == "UDim2") {
                return (<input id={this.id} type="text" key={this.id} onBlur={valueChanged} onKeyDownCapture={(e) => {
                    if (e.key == "Enter") {
                        valueChanged()
                    }
                }}></input>)
            } else if (propertyType == "File") {
                let image = this.props.element.state.props.Image

                return [
                    <input type="file" key={this.id} id={this.id} accept="image/*" onChange={valueChanged} style={{
                        visibility: "hidden",
                        position: "absolute",
                    }}></input>,
                    <label for={this.id} id={this.id + "_label"}style={{
                        paddingLeft: "5px",
                        wordBreak: "break-word",
                    }}>{typeof image == "object" ? image.path : typeof image == "string" ? image : "SELECT IMAGE"}</label>,
                    <button id={this.id + "_reset"} style={{
                        marginLeft: "10px",
                        visibility: typeof image == "object" ? "visible" : "hidden",
                        height: "25px",
                        width: "65px",
                    }} onMouseDown={() => {
                        valueChanged({
                            __doReset: true,
                            target: {value: "./imageMissing.webp"}
                        })
                    }}>RESET</button>
                ]
            } else {
                return null
            }
        }

        let propertyType = properties[this.props.element.state.ClassName][this.props.name].type

        return (<li className="Property" style={{
                margin: "0px",
                padding: "0px",
                listStyle: "none",
                color: "rgb(255, 255, 255)"
            }}>
                {this.props.name}:
                {
                    getInput()
                }
        </li>)
        
    }
}

class PropertyView extends react.Component {
    constructor(props) {
        super(props)
    } 

    render() {
        if (!this.props.element) {
            return (<h1 style={{
                position: "absolute",
                color: "white",
                fontSize: "1em",
                width: "100%",
                marginTop: "55px",
                textAlign: "center",
                WebkitTextStrokeColor: "rgb(0,0,0)",
                WebkitTextStrokeWidth: "1px",
                fontFamily: "Fredoka One"
            }}>SELECT AN ELEMENT</h1>)
        }

        let elements = []

        for (let key in properties[this.props.element.state.ClassName]) {
            elements.push(<Property key={Math.random() * 1e9}element={this.props.element} name={key}existing={this.props.element.state.props[key]}/>)
        }
        
        return (<ul style={{
            overflow: "hidden"
        }}>{elements}</ul>)
    }
}

module.exports = PropertyView