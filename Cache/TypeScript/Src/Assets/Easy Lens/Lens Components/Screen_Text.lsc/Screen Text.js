
//@input int renderOrder = 1;
//@input string text {"widget" : "text_area"};
//@input vec2 position
//@input float fontSize = 0.5 {"widget":"slider", "min":0.1, "max":1.0, "step":0.01}
//@input int font = 0 { "widget": "combobox", "values": [ {"label": "Regular", "value": 0}, {"label": "Cartoon", "value": 1}, {"label": "Bold", "value": 2}, {"label": "Rounded", "value": 3}, {"label": "Hand written", "value": 4}, {"label": "Typewriter", "value": 5}, {"label": "Silly", "value": 6}, {"label": "Grand, elegant", "value": 7}, {"label": "Vintage", "value": 8}, {"label": "Art Deco", "value": 9}, {"label": "Casual", "value": 10}, {"label": "Slanted Italic", "value": 11} ] }
//@input Asset.Font[] fonts;
//@input vec4 color {"widget":"color"};        

//@input bool enableOutline;
//@input vec4 outlineColor {"widget":"color","showIf":"enableOutline"};
//@input float outlineThickness {"widget":"slider","showIf":"enableOutline","min":0.0, "max":1.0, "step":0.01};
//@input bool enableDropShadow;
//@input vec4 dropShadowColor {"widget":"color","showIf":"enableDropShadow"};
//@input float dropShadowOffsetX {"widget":"slider","showIf":"enableDropShadow", "label":"Shadow X","min":0.0, "max":1.0, "step":0.01};
//@input float dropShadowOffsetY {"widget":"slider","showIf":"enableDropShadow", "label":"Shadow Y","min":0.0, "max":1.0, "step":0.01};
//@ui {"widget":"separator"}
//@input bool advanced = false;
//@input bool autoAlign {"showIf":"advanced"};
//@input int textAlignment = 0 { "widget": "combobox", "showIf":"autoAlign","showIfValue":"false","values": [ {"label": "Left", "value": 0}, {"label": "Center", "value": 1}, {"label": "Right", "value": 2} ]}
//@input bool autoFormat = true {"showIf":"advanced"};
//@input float margin = 0 {"widget":"slider","showIf":"advanced","min":0.0, "max":0.2, "step":0.01};
//@input bool debugRectangle = false {"showIf":"advanced"};
//@input Asset.Material debugMat {"showIf":"advanced"};


let stComp,extentsTarget,noLines=1,textSO,text=script.text,position,fontSize = script.fontSize, textComp, scriptSO = script.getSceneObject();


function init(){
    if(!validateInputs()){
        return;
    }
    posSetup();
    setInputs();
    script.createEvent("OnDisableEvent").bind(function() {
        if (textSO) {
            textSO.enabled = false;
        }
    });
    script.createEvent("OnEnableEvent").bind(function() {
        if (textSO) {
            textSO.enabled = true;
        }
    });
    bindProperty('color',textComp.textFill,'color');
    bindText('text','text');
    bindFontSize('fontSize',textComp,'size');
    bindFont('font',textComp,'font');
    bindPosition('position');
    bindProperty('enableOutline',textComp.outlineSettings,'enabled');
    bindProperty('outlineColor',textComp.outlineSettings.fill,'color');
    bindProperty('outlineThickness',textComp.outlineSettings,'size');
    bindProperty('dropShadowColor',textComp.dropshadowSettings.fill,'color');
    bindProperty('enableDropShadow',textComp.dropshadowSettings,'enabled');
    bindProperty('dropShadowOffsetX',textComp.dropshadowSettings.offset,'x');
    bindProperty('dropShadowOffsetY',textComp.dropshadowSettings.offset,'y');
}

function posSetup(){
    textSO = global.scene.createSceneObject("Text");
    if(script.debugRectangle){
         let debugImg = textSO.createComponent('Component.Image');
         debugImg.materials = [script.debugMat.clone()];
         let bgImage = script.getSceneObject().createComponent('Component.Image');
         let bgImageMat = script.debugMat.clone();
        bgImageMat.mainPass.blendMode = 11;
         bgImage.materials = [bgImageMat];
    }
    textComp = textSO.createComponent('Component.Text');
    stComp = textSO.createComponent('Component.ScreenTransform');
    if(!script.position){
        script.position = new vec2(0.5,0.5);
    }
    position = script.position;
    posToScreenPos(position);
    setLayerRO(textSO);
    textSO.setParent(scriptSO);
}

function setInputs(){
    textComp.text = splitString(script.text);
    if(script.fontSize>1.0){
        script.fontSize = 1.0;
    }
    textComp.sizeToFit = true;
    textComp.lineSpacing = 0.7;
    textComp.textFill.color = script.color;
    textComp.horizontalOverflow = HorizontalOverflow.Wrap;
    if(script.font<script.fonts.length && script.font > 0){
        textComp.font = script.fonts[script.font];
    }    
    else{
        textComp.font = script.fonts[0];
    }

    // Outline
    textComp.outlineSettings.enabled = script.enableOutline;
    textComp.outlineSettings.fill.color = script.outlineColor;
    textComp.outlineSettings.size = script.outlineThickness;
    // Dropshadow
    textComp.dropshadowSettings.enabled = script.enableDropShadow;
    textComp.dropshadowSettings.fill.color = script.dropShadowColor;
    textComp.dropshadowSettings.offset = new vec2(script.dropShadowOffsetX,script.dropShadowOffsetY);
}

// Helpers
function validateInputs(){
    if(!getParentCamera(scriptSO)){
        print("Text On Screen error: please place under orthographic camera!");
        return false;
    }
    return true;
}

function getParentCamera(obj) {
    if (!obj) {
        return null;
    }

    var cam = obj.getComponent("Component.Camera");
    if (cam) {
        return cam;
    }

    return getParentCamera(obj.getParent());
}

function setLayerRO(obj){
    obj.renderOrder = script.renderOrder;
    obj.setRenderLayer(scriptSO.getRenderLayer());
}


function posToScreenPos(position) {
    if(script.autoAlign){
        if(position.x >= 0.46 && position.x <= 0.54){
            textComp.horizontalAlignment = HorizontalAlignment.Center;
        }
        else if(position.x > 0.6){
            textComp.horizontalAlignment = HorizontalAlignment.Right;
        }
        else if(position.x < 0.4){
            textComp.horizontalAlignment = HorizontalAlignment.Left;
        }
    }
    else{
        textComp.horizontalAlignment = script.textAlignment;
    }
    // Remaps (0,1.0) to screen space
    let remappedX = position.x * 2 - 1;
    let remappedY = 1 - position.y*2;
    position = new vec2(remappedX,remappedY);


    convertPositionToRectangle(position,0.0);
}

function convertNormalizedToScreenSpace(normalizedPosition, componentWidth) {
    // Calculate the half-width of the component in normalized screen space
    const halfComponentWidth = componentWidth / 2;

    // Map normalized position (-1 to 1) to screen space (0 to 1) considering component width
    // -1 corresponds to the left edge being at 0
    // 1 corresponds to the right edge being at 1
    let start = -1+halfComponentWidth;
    let end = 1-halfComponentWidth;
    let screenPosition = scale(normalizedPosition,-1,1,start,end);
    return screenPosition;
}


function convertPositionToRectangle(vec2) {
    // Set the center of the rectangle
    // Get and scale the size
    setFontSize(fontSize);
    let sidesMargin = script.margin;
    let width = stComp.anchors.getSize().x;
    let height = stComp.anchors.getSize().y;
    vec2.x = convertNormalizedToScreenSpace(vec2.x,width);
    vec2.y = convertNormalizedToScreenSpace(vec2.y,height);
    stComp.anchors.setCenter(vec2);
    

    // Calculate potential rectangle boundaries
    let top = stComp.anchors.top;
    let bottom = stComp.anchors.bottom;
    let left = stComp.anchors.left;
    let right = stComp.anchors.right;
    const leftMax = sidesMargin - 1;
    const rightMax = 1- sidesMargin;  

    // Check and adjust boundaries
    if (left < leftMax) {
        right -= left +1;
        left = leftMax;
    }
    if (right > rightMax) {
        left -= right-1;
        right = rightMax;
    }
    if (bottom < -1) {
        top -= bottom +1;
        bottom = -1;
    }
    if (top > 1) {
        bottom -= top-1;
        top = 1;
    }
    stComp.anchors.right = right;
    stComp.anchors.left = left;
    stComp.anchors.bottom = bottom;
    stComp.anchors.top = top;
}

function splitString(inputString) {
    if(!script.autoFormat){
        return inputString;
    }
    let result = '';
    let currentLine = '';
    let limit = 14;
    let noSplits = 0;
    inputString.split(' ').forEach(word => {
        if ((currentLine + word).length > limit) {
            noSplits ++;
            result += currentLine.trim() + '\n';
            currentLine = word + ' ';
        } else {
            currentLine += word + ' ';
        }
    });
    noLines = noSplits;
    // Add the last line
    result += currentLine.trim();
    return result;
}

function scale (number, inMin, inMax, outMin, outMax) {
    let retVal = (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    return retVal;
}

function setFontSize(val) {
    // Ensure fontSize is within the expected range
    fontSize = Math.max(0.1, Math.min(1.0, val));

    let size = stComp.anchors.getSize();
    size.x = 2.0;
    size.y = noLines * fontSize / 3 + 0.3;
    if (noLines > 1) {
        size.y += 0.1;
    }

    // Instead of scaling fontSize cumulatively, use a direct mapping
    let scaledFontSize = scale(fontSize, 0, 1.0, 0.1, 1.0);
//    if (text.length < 8 && scaledFontSize < 0.8) {
//        scaledFontSize /= (8 / text.length);
//    }
    size = size.uniformScale(scaledFontSize);
    stComp.anchors.setSize(size);
}

function bindProperty(inputName, target, propName) {
    Object.defineProperty(script, inputName, {
        set: function(val){
            target[propName] = val;
        },
        get: function(){
            return target[propName];
        }
    });
}

function bindFontSize(inputName, target, propName) {
    Object.defineProperty(script, inputName, {
        set: function(val){
            setFontSize(val);
            posToScreenPos(position);
        },
        get: function(){
            return fontSize;
        }
    });
}

function bindFont(inputName, target, propName) {
    Object.defineProperty(script, inputName, {
        set: function(val){
            if(val<script.fonts.length && val > 0){
                target[propName] = script.fonts[val];
            }
        },
        get: function(){
            return target[propName];
        }
    });
}

function bindText() {
    Object.defineProperty(script, 'text', {
        set: function(val){
            textComp.text = splitString(val);
            text = val;
            posToScreenPos(position);
        },
        get: function(){
            return textComp.text;
        }
    });
}

function bindPosition() {
    Object.defineProperty(script, 'position', {
        set: function(val){
            position = val;
            posToScreenPos(val);
        },
        get: function(){
            return position;
        }
    });
}


init();