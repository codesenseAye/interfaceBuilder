import react from "react"
import reactdom from "react-dom"
import lodash from "lodash"
import textFit from "./textFit"

//window.open("https://developer.mozilla.org", null, "frame=true")

const properties = {
    Frame: require("./propertyVisual/propertyData/frame.json"),
    ImageButton: require("./propertyVisual/propertyData/imageButton.json"),
    ImageLabel: require("./propertyVisual/propertyData/imageLabel.json"),
    TextLabel: require("./propertyVisual/propertyData/textLabel.json"),
    TextButton: require("./propertyVisual/propertyData/textButton.json"),
    ScrollingFrame: require("./propertyVisual/propertyData/scrollingFrame.json"),
    UICorner: require("./propertyVisual/propertyData/uiCorner.json"),
    UIGradient: require("./propertyVisual/propertyData/uiGradient.json"),
    UIListLayout: require("./propertyVisual/propertyData/uiListLayout.json"),
    UIPadding: require("./propertyVisual/propertyData/uiPadding.json"),
    UIPageLayout: require("./propertyVisual/propertyData/uiPageLayout.json"),
    UIStroke: require("./propertyVisual/propertyData/uiStroke.json"),
}

import PropertyView from "./propertyVisual/propertiesCompiled.js"
import CodeView from "./codeView.js"

const MEASURE_X = 1920
const MEASURE_Y = 1080

let clientX = 0;
let clientY = 0;

let sizeScale = 0.2

let mouseMoved;
let dragNum;

let dragData;
let dragDidWork;

document.onmousemove = function(event) {
    clientX = event.clientX
    clientY = event.clientY

    if (!mouseMoved) {
        return
    }

    mouseMoved(event)
}

class ButtonHandle extends react.Component {
    constructor(props) {
        super(props)

        this.state = {left: 0, top: 0, visible: false, width: 15, height: 15}
        this.id = Math.random() * 1e9
    
        this.timer = setInterval(() => {
            let element = document.getElementById(this.id)

            if (!element) {
                return
            }

            let rect = element.parentElement.getBoundingClientRect()

            this.setState({
                left: rect.left + this.props.side[0] * rect.width,
                top: rect.top + this.props.side[1] * rect.height
            })
        }, 10)
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    render() {
        let visible = this.state.visible || this.state.dragging
        
        let color1 = this.state.dragging && 200 || 255
        let color2 = this.state.dragging && 0 || 255

        return (
            <button id={this.id} className="dragButton" style={{
                position: "fixed",
                backgroundColor: `rgba(${color1}, ${color1}, ${color2}, ` + (visible ? "1" : "0") + ")",
                height: "15px",
                width: "15px",
                boxShadow: "none",
                left: -7.5 + this.state.left + "px",
                top: -7.5 + this.state.top + "px",
                borderRadius: "100%",
                borderStyle: "solid",
                borderColor: "rgba(0, 50, 200, " + (visible ? "1" : "0") + ")",
            }} onMouseEnter={() => {
                this.setState({
                    visible: true
                })
            }} 
            onMouseLeave={() => {
                this.setState({
                    visible: false
                })
            }}
            onMouseDown={(e) => {
                e.stopPropagation()
                
                this.setState({
                    dragging: true
                })

                this.drag = setInterval(() => {
                    let element = document.getElementById(this.id)
                    let rect = element.parentElement.getBoundingClientRect()
                    let parentRect = element.parentElement.parentElement.getBoundingClientRect()

                    let xS = rect.width, yS = rect.height
                    let xP = rect.left, yP = rect.top

                    if (this.props.side[0] == 1 && this.props.side[1] == 0.5 || this.props.side[0] == 1 && this.props.side[1] == 0 || this.props.side[0] == 1 && this.props.side[1] == 1) {
                        let parentDist = clientX - xP
                        xS = parentDist
                    }
                    
                    if (this.props.side[0] == 0 && this.props.side[1] == 0.5 || this.props.side[0] == 0 && this.props.side[1] == 0 || this.props.side[0] == 0 && this.props.side[1] == 1) {
                        let parentDist = clientX - xP
                        let xDiff = (xP + parentDist)

                        xS = (xS - parentDist)
                        xP = xDiff
                    }
                    
                    if (this.props.side[0] == 0.5 && this.props.side[1] == 1 || this.props.side[0] == 0 && this.props.side[1] == 1 || this.props.side[0] == 1 && this.props.side[1] == 1) {
                        let parentDist = clientY - yP
                        yS = parentDist
                    }
                    
                    if (this.props.side[0] == 0.5 && this.props.side[1] == 0 || this.props.side[0] == 0 && this.props.side[1] == 0 || this.props.side[0] == 1 && this.props.side[1] == 0) {
                        let parentDist = clientY - yP
                        let yDiff = (yP + parentDist)

                        yP = yDiff
                        yS = (yS - parentDist)
                    }

                    let relativeXsize = (xS / parentRect.width) * MEASURE_X
                    let relativeYsize = (yS / parentRect.height) * MEASURE_Y

                    let relativeXpos = ((xP - parentRect.left) / parentRect.width) * MEASURE_X
                    let relativeYpos = ((yP - parentRect.top) / parentRect.height) * MEASURE_Y

                    this.props.setS(relativeXsize, relativeYsize)
                    this.props.setP(relativeXpos, relativeYpos)
                }, 0)
                
                let clear = () => {
                    this.setState({
                        dragging: false
                    })

                    document.onmouseup = null
                    clearInterval(this.drag)
                }
            
                document.onmouseup = clear
            }}></button>
        )
    }
}

function getState(className) {
    let props = {Name: className}
    let specProps = properties[className]

    for (let key in specProps) {
        if (key == "Name") continue

        let prop = specProps[key]
        props[key] = prop.default 
    }

    return {
        ClassName: className,
        childrenViewOpen: false,
        key: performance.now(),
        props: props,
        children: []
    }
}

class Draggable extends react.Component {
    constructor(props) {
        super(props)

        this.drag = this.drag.bind(this);
        this.dragEnd = this.dragEnd.bind(this);

        this.setSize = this.setSize.bind(this);
        this.setPosition = this.setPosition.bind(this);

        this.state = {}

        this.setParent = setInterval(() => {
            let element = document.getElementById(this.props.element.id)

            if (!element) {
                return
            }

            let canvas = document.getElementById(this.props.element.props.parentId || "canvas") 
            
            if (canvas == element.parentElement) {
                return
            }

            canvas.appendChild(element)
        }, 0)

        this.setParentLocationInterval = setInterval(() => {
            let id = this.props.element.id
            let element = document.getElementById(id)

            let elementText = document.getElementById(id + "_text")
            let elementImage = document.getElementById(id + "_image")

            if (!element) {
                return
            }

            let cornerRadius = element.getAttribute("cornerRadius")
            let fontSize = null

            if (elementText && (this.lastText != this.props.element.state.props.Text || sizeScale != this.lastSizeScale)) {
                this.lastText = this.props.element.state.props.Text
                this.lastSizeScale = sizeScale

                fontSize = textFit(elementText, {multiLine: true, alignVert: true, alignHoriz: true})
                fontSize = fontSize ? fontSize[0] : null
            }

            if (elementImage) {
                let props = this.props.element.state.props
                
                if (typeof props.Image == "object" && (!this.lastImage || props.Image.path != this.lastImage.path)) {
                    elementImage.style.backgroundImage = 'url("' + URL.createObjectURL(props.Image) + '")'
                    elementImage.style.mask = elementImage.style.backgroundImage
                } else if (typeof props.Image == "string" && props.Image != this.lastImage) {
                    elementImage.style.backgroundImage = 'url("' + props.Image + '")'
                    elementImage.style.mask = elementImage.style.backgroundImage
                }

                this.lastImage = props.Image
            }

            this.setState({
                fontSize: fontSize || this.state.fontSize,
                cornerRadius: cornerRadius,
                parentLocation: element.parentElement.getBoundingClientRect()
            })
        }, 0)
    }

    componentWillUnmount() {
        clearInterval(this.setParent)
        clearInterval(this.setParentLocationInterval)
    }

    componentDidMount() {
        this.setSize(250, 250)
        this.setPosition(250, 100)
    }

    setSize(xS, yS) {
        let size = {x: xS, y: yS}

        this.props.element.setState((state) => {
            let elementStateProps = lodash.cloneDeep(state.props)
            elementStateProps.Size = size
            this.lastText = null

            return {props: elementStateProps}
        })
    }

    setPosition(xP, yP) {
        let position  = {x: xP, y: yP}

        this.props.element.setState((state) => {
            let elementStateProps = lodash.cloneDeep(state.props)
            elementStateProps.Position = position
            return {props: elementStateProps}
        })
    }

    drag() {
        let element = document.getElementById(this.props.element.id)

        let rect = element.getBoundingClientRect()
        let parentRect = element.parentElement.getBoundingClientRect()
        
        let offsetX = rect.left - clientX
        let offsetY = rect.top - clientY

        this.props.element.props.setSelectedElement(this.props.element)
        
        mouseMoved = event => {
            let x = event.clientX - parentRect.left
            let y = event.clientY - parentRect.top

            let relativeClientX = (x / parentRect.width) * MEASURE_X
            let relativeOffsetX = (offsetX / parentRect.width) * MEASURE_X

            let relativeClientY = (y / parentRect.height) * MEASURE_Y
            let relativeOffsetY = (offsetY / parentRect.height) * MEASURE_Y
            
            this.setPosition(relativeClientX + relativeOffsetX, relativeClientY + relativeOffsetY)
        };
    
        document.onmouseup = () => {
            document.onmouseup = null
            this.dragEnd()
        }
    }

    dragEnd() {
        mouseMoved = null;
    }

    render() {
        let parentLocation = this.state.parentLocation

        let props = this.props.element.state.props
        let color3 = props.BackgroundColor3

        let pHeight = parentLocation && parentLocation.height || props.Size.y
        let pWidth = parentLocation && parentLocation.width || props.Size.x

        return (
            <button 
                onClick={this.reset}
                id={this.props.element.id}
                
                onMouseDown={this.drag}
                className="renderedElement"
                
                style={{
                    backgroundColor: `rgba(${color3.R * 255},${color3.G * 255},${color3.B * 255},` + (props.BackgroundTransparency || 1) + ")",
                    position: "absolute",
                    oveflowY: this.props.element.state.ClassName == "ScrollingFrame" ? "auto" : props.ClipsDescendants ? "hidden" : "visible",
                    overflowX: this.props.element.state.ClassName == "ScrollingFrame" ? "auto" : props.ClipsDescendants ? "hidden" : "visible",
                    scrollBehavior: "smooth",
                    borderStyle: !this.props.element.state.isSelected && "none" || "solid",
                    borderSpacing: "5px",
                    borderRadius: this.state.cornerRadius || "0px",
                    borderColor: "rgba(0,0,150, 0.1)",
                    left: `${(props.Position.x / MEASURE_X) * pWidth}px`,
                    top: `${(props.Position.y / MEASURE_Y) * pHeight}px`,
                    height: (props.Size.y / MEASURE_Y) * pHeight + "px",
                    width: (props.Size.x / MEASURE_X) * pWidth + "px",
                    zIndex: props.ZIndex || 0
                }

            }>
                {props.Text ? <div id={this.props.element.id + "_text"} style={{
                    height: "100%",
                    width: "100%",
                    color: `rgb(${props.TextColor3.R * 255},${props.TextColor3.G * 255},${ props.TextColor3.B * 255})`,
                    WebkitTextStrokeColor: `rgba(${props.TextStrokeColor3.R * 255},${props.TextStrokeColor3.G * 255},${ props.TextStrokeColor3.B * 255}, ${props.TextStrokeTransparency})`,
                    '-webkit-text-stroke-width': ((this.state.fontSize || 15) / 30),
                    fontFamily: props.Font
                }}>{props.Text}</div> : null}

                {(this.props.element.state.ClassName == "ImageButton" || this.props.element.state.ClassName == "ImageLabel") ? 
                    <div draggable="false"id={this.props.element.id + "_image"} style={{
                        height: "100%",
                        width: "100%",
                        backgroundSize: "100% 100%",
                        maskType: "luminance",
                        borderRadius: this.state.cornerRadius || "0px",
                        backgroundBlendMode: "multiply",
                        backgroundColor: `rgb(${props.ImageColor3.R * 255},${props.ImageColor3.G * 255},${ props.ImageColor3.B * 255})`
                    }}></div> 
                : null}

                <ButtonHandle side={[0, 1]}setP={this.setPosition}setS={this.setSize}/>
                <ButtonHandle side={[1, 1]}setP={this.setPosition}setS={this.setSize}/>
                <ButtonHandle side={[0, 0]}setP={this.setPosition}setS={this.setSize}/>
                <ButtonHandle side={[1, 0]}setP={this.setPosition}setS={this.setSize}/>

                <ButtonHandle side={[0, 0.5]}setP={this.setPosition}setS={this.setSize}/>
                <ButtonHandle side={[0.5, 1]}setP={this.setPosition}setS={this.setSize}/>
                <ButtonHandle side={[1, 0.5]}setP={this.setPosition}setS={this.setSize}/>
                <ButtonHandle side={[0.5, 0]}setP={this.setPosition}setS={this.setSize}/>
            </button>
        )
    }
}

class DragTarget extends react.Component {
    constructor(props) {
        super(props)
        this.dragEnd = this.dragEnd.bind(this)

        this.dragOver = this.dragOver.bind(this)
        this.dragLeave = this.dragLeave.bind(this)

        this.drop = this.drop.bind(this)
        this.drag = this.drag.bind(this)
    }

    drag(ev) {
        dragDidWork = null;

        dragNum = null
        dragData = lodash.cloneDeep(this.state)
        
        dragData.id = this.id
        dragData.parentId = this.props.parentId

        ev.dataTransfer.setData("text/plain", this.state.key.toString())
    }

    drop(ev) {
        this.setState({
            draggedOver: false
        })

        if (dragNum && dragNum == this) {
            if (this.addElement(dragData)()) {
                dragDidWork = true
            }
        }

        ev.preventDefault()
    }

    dragOver(ev) {
        if (dragNum && dragNum != this) {
            return
        }

        dragNum = this

        this.setState({
            draggedOver: true
        })

        ev.preventDefault()
    }

    dragEnd(ev) {
        dragData = null

        if (!dragNum) {
            return;
        }

        if(!dragDidWork) {
            return;
        }

        this.props.delete()
    }

    dragLeave(ev) {
        dragNum = null

        this.setState({
            draggedOver: false
        })
    }
}

class ElementHolder extends DragTarget {
    constructor(props) {
        super(props)
        this.id = Math.random() * 1e9

        this.addElement = this.addElement.bind(this)
        this.removeElement = this.removeElement.bind(this)

        // react probably clones the state after we set it so look that up and find out how to share data properly
        this.state = props.props && props.props.key && props.props || getState("Frame")
    }

    addElement(data, ignoreDrag, className) {
        return () => {
            let checkIsChildOfData = (parent) => {
                if (parent.key == this.state.key) {
                    return true;
                }

                for (let key = 0; key < parent.children.length; key++) {
                    let child = parent.children[key]

                    if (!child) {
                        // not sure why this detects when data is two trees deep into state
                        return true;
                    }

                    if (checkIsChildOfData(child)) {
                        return true
                    }
                } 
            }

            if (data) {
                let isChildOfData = checkIsChildOfData(data)

                if (isChildOfData) {
                    return;
                }
            }

            let newData = data || getState(className || "Frame")
            if (ignoreDrag || dragNum) { // if dragended didnt fire before we added it
                if (this.removeElement(newData.key) && !ignoreDrag) {
                    dragNum = null
                }
            }
            
            this.setState((state) => {
                let newChildren = lodash.cloneDeep(state.children)
                newData.isSelected = false

                newChildren.splice(newChildren.length, 0, newData) 

                if (this.props.addToParent) {
                    let newState = lodash.cloneDeep(this.state)
                    newState.children = newChildren
                    this.props.addToParent(newState, true)()
                }

                return {children: newChildren}
            })

            return true;
        }
    }

    doElementRemove(parentId, element) {
        if (element.ClassName == "UICorner") {
            let elementElement = document.getElementById(parentId)
            if (elementElement) {
                elementElement.setAttribute("cornerRadius", "0px")
            }
        }
    }

    componentDidUpdate() {
        if (!this.removeSelectedOnUpdate) {
            return
        }

        this.removeSelectedOnUpdate = false
        this.setSelectedElement()
    }

    removeElement(key, wasForSafety) {
        let id;
        let element;

        let setId = (state) => {
            let stateObj = state || this.state

            for (let index in stateObj.children) {
                let child = stateObj.children[index]
                if (child.key == key) {
                    id = index
                    element = child
                    break
                }
            }

            if (!id) {
                if (!wasForSafety) {
                    console.warn("Did not find index for element key")
                }
                
                return;
            }

            return true
        }

        if (!setId()) {
            return;
        }

        this.setState((state) => {
            if (!setId(state)) {
                return;
            }

            if (this.state.selectedElement && key == this.state.selectedElement.state.key) {
                this.removeSelectedOnUpdate = true // signal for component did update
            }
           
            this.doElementRemove(this.id, element)
            
            let newChildren = lodash.cloneDeep(state.children)
            newChildren.splice(id, 1)

            return {children: newChildren}
        })

        return true
    }
}

class Element extends ElementHolder {
    constructor(props) {
        super(props)

        this.toggleView = this.toggleView.bind(this)
    }

    toggleView() {
        this.setState({
            childrenViewOpen: !this.state.childrenViewOpen
        })
    }

    componentWillUnmount() {
        let draggable = document.getElementById(this.id)

        if (!draggable) {
            return
        }

        draggable.remove()
    }

    render() {
        let draggableObject = null
        let foundUIObject = this.state.ClassName.search("UI") 

        if (foundUIObject < 0) {
            draggableObject =  <Draggable element={this}key={this} />
        } 

        let cornerRadius = this.state.props.CornerRadius

        if (cornerRadius) {
            let parentElement = document.getElementById(this.props.parentId)
            if (parentElement) {
                parentElement.setAttribute("cornerRadius", (cornerRadius / 2) + "%")
            }
        }

        return (
            <li id={this.state.key.toString()} className={this.state.draggedOver ? "elementItemDragOver" : "elementItem"} >
                <h className="elementLabel" 
                onMouseEnter = {(e) => {
                    e.stopPropagation()
                }}
                onMouseDown={()=> {
                    this.props.setSelectedElement(this)
                }}
                draggable="true" onDragStart={this.drag} onDrop={this.drop} onDragOver={this.dragOver} onDragLeave={this.dragLeave} onDragEnd={this.dragEnd}>{this.state.props.Name}</h> 

                <button className="delete" onClick={this.props.delete}>D</button>

                <button 
                    style={{visibility:this.state.children.length > 0 ? "visible" : "hidden"}}
                    className="childrenToggle"
                    onClick={this.toggleView}
                >
                    {this.state.childrenViewOpen ? "^" : ">"}
                </button>

                <div className={this.state.isSelected ? "selectedBox" : "unselectedBox"}></div>

                <ul className={this.state.childrenViewOpen ? "containerListOpen" : "containerList"}>{this.state.children.map((id) => 
                
                <Element key={id.key} props ={id} parentId={this.id} addToParent={this.addElement}
                    setSelectedElement={this.props.setSelectedElement}
                    delete={() => {
                        this.removeElement(id.key)
                    }}/>
                )}</ul> {draggableObject}
            </li>
        )
    }
}

class App extends ElementHolder {
    constructor(props) {
        super(props)
        this.setSelectedElement = this.setSelectedElement.bind(this)

        this.state.offsetX = 0
        this.state.offsetY = 0

        this.state.sizeScale = 0.2
        sizeScale = this.state.sizeScale
    }

    setSelectedElement(element) {
        if (this.state.selectedElement) {
            this.state.selectedElement.setState({
                isSelected: false
            })
        }

        if (element) {
            element.setState({
                isSelected: true
            })
        }
        
        this.setState({
            selectedElement: element
        })
    }

    render() {
        let height = 1080 * this.state.sizeScale
        let width = 1920 * this.state.sizeScale

        let buttonStyle = {
            marginTop: "5px",
            backgroundColor:"rgb(255,255,255)",
            borderRadius: "10px",
            
            borderStyle: "none",
            color: "rgb(0,0,0)",
            zIndex: 150
        }

        let selectedClass = (className) => {
            return () => {
                this.addElement(null, null, className)()
            }
        }

        return (
            <div>
                <div className="renderedView" id="renderedView" onWheel={(e) => {
                    let scale = Math.max(0.01, Math.min(1, this.state.sizeScale + (e.deltaY / 10000))) 
                    sizeScale = scale

                    this.setState({
                        sizeScale: scale
                    })
                }} onMouseDown={(e) => {
                    if (e.buttons == 1) {
                        this.setSelectedElement()
                        return
                    }

                    let lastX = clientX
                    let lastY = clientY

                    if (this.dragCanvas) {
                        clearInterval(this.dragCanvas)
                    }

                    this.dragCanvas = setInterval(() => {
                        let diffX = lastX - clientX
                        let diffY = lastY - clientY

                        this.setState({
                            offsetX: this.state.offsetX + diffX,
                            offsetY: this.state.offsetY + diffY,
                        })

                        lastX = clientX
                        lastY = clientY
                    }, 0)
                }} onMouseUp={() => {
                    clearInterval(this.dragCanvas)
                }}>
                    <div className="formatView" style={{
                        position: "absolute",
                        marginLeft: "calc(50% - 50px)",
                        width: "25px",
                        zIndex: 100,
                    }}>
                        <select style={{
                            position: "absolute",
                            top: "5px",
                            borderWidth: "1px",
                            outlineWidth: "0px",
                            borderColor:"rgb(0,0,0)",
                            borderRadius: "5px",
                            backgroundColor: "rgb(255,255,255)"
                        }}>
                            <option value={1} style={{
                                color: "rgb(0,0,0)",
                                fontFamily: "Fredoka One",
                                borderRadius: "5px"
                            }}>DESKTOP</option>
                            <option value={2}>PHONE</option>
                            <option value={3}>TABLET</option>
                        </select>
                    </div>
                    <div style={{
                            overflow:"hidden",
                            backgroundColor: "rgb(255, 255, 255)",
                            position: "absolute",
                            left: "calc(50% - " + (width / 2) + "px - " + this.state.offsetX + "px)",
                            top: "calc(50% - " + (height / 2) + "px - " + this.state.offsetY + "px)",
                            height: height + "px",
                            width: width + "px",
                        }}
                        id="canvas"
                    >
                    </div>
                </div>
                <div className="elementView">
                    <div className="title">
                        <h1 className="text">LIST OF ELEMENTS</h1>
                        <button className="addElement" onClick={() => {
                            let classDropdown = !this.state.classDropdown
                            
                            this.setState({
                                classDropdown: classDropdown
                            })

                            if (!classDropdown) {
                                return
                            }   

                            document.onmousedown = () => {
                                document.onmousedown = null
                                
                                this.setState({
                                    classDropdown: false
                                })
                            }
                        }}>+
                            <div style={{
                                position: "absolute",
                                width: "100px",
                                paddingLeft: "25px",
                                marginTop: "-20px",
                                visibility: this.state.classDropdown ? "visible" : "hidden"
                            }}>
                                <button style={buttonStyle} onMouseDown={selectedClass("Frame")}>Frame</button>
                                <button style={buttonStyle} onMouseDown={selectedClass("ScrollingFrame")}>ScrollingFrame</button>
                                <button style={buttonStyle} onMouseDown={selectedClass("ImageButton")}>ImageButton</button>
                                <button style={buttonStyle} onMouseDown={selectedClass("ImageLabel")}>ImageLabel</button>
                                <button style={buttonStyle} onMouseDown={selectedClass("TextLabel")}>TextLabel</button>
                                <button style={buttonStyle} onMouseDown={selectedClass("TextButton")}>TextButton</button>
                                <button style={buttonStyle} onMouseDown={selectedClass("UICorner")}>UICorner</button>
                                <button style={buttonStyle} onMouseDown={selectedClass("UIStroke")}>UIStroke</button>
                                <button style={buttonStyle} onMouseDown={selectedClass("UIAspectRatioConstraint")}>UIAspectRatioConstraint</button>
                                <button style={buttonStyle} onMouseDown={selectedClass("UIGradient")}>UIGradient</button>
                                <button style={buttonStyle} onMouseDown={selectedClass("UIListLayout")}>UIListLayout</button>
                                <button style={buttonStyle} onMouseDown={selectedClass("UIPadding")}>UIPadding</button>
                                <button style={buttonStyle} onMouseDown={selectedClass("UIPageLayout")}>UIPageLayout</button>
                            </div>
                        </button>
                        <div className="line">
                        </div>
                    </div>
                    <div  className={this.state.draggedOver ? "elementsDraggedOver" : "elements"} onDrop={this.drop} onDragOver={this.dragOver} onDragLeave={this.dragLeave}>
                        <ul className="elementList">{
                            this.state.children.map((id) => {
                                return (<Element key={id.key} props ={id} delete={() => {
                                    this.removeElement(id.key)
                                }} setSelectedElement={this.setSelectedElement}/>)
                            })
                        }</ul>
                    </div>
                    <div className="propertiesView">
                        <PropertyView element={this.state.selectedElement} existingProps={{}}/>
                    </div>
                </div>
                <div className="codeView">
                    <CodeView/>
                </div>
            </div>
         )
    }
}

reactdom.render(<App />, document.getElementById("appBody"))