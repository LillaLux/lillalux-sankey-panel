import { FieldType, DataFrame } from '@grafana/data';


export class FieldContainer {
    constructor (fieldDefinition) {
        console.log("constructor")
        this._logvalopt()
        //this._log(this._panelFieldNames,true)
        //console.log( this._panelFieldNames)
 
        this._error = false;
        const _expandObj = function (obj,add, pathPrefix = "opt",  optPrefix = "opt", namePrefix = "", nameSuffix = " Column" )  {
            //console.log("obj")
            //this._log(obj,true)
            
            const creatName = (nameIn, prefix, suffix) => {return prefix+nameIn.slice(0,1).toUpperCase() + nameIn.slice(1).toLowerCase()+suffix}
            const createObj = (nameIn, pathPrefix, optPrefix, namePrefix, nameSuffix) => 
                {
                    return ({
                            id: nameIn,
                            path: creatName(nameIn, pathPrefix, ""),
                            opt: creatName(nameIn, optPrefix, ""),
                            name: creatName(nameIn, namePrefix, nameSuffix)
                    })
                }   
            const objKeys = Object.keys(obj), objValues = Object.values(obj)
            const objx = objKeys.map ((ele,i) => {
                obj[ele]={...objValues[i],...add}
                obj[ele].fieldEditor = createObj(ele,  pathPrefix, optPrefix, namePrefix, nameSuffix)} 
            )
            return obj
        }
        //console.log("fieldDefinition")
        //this._log(fieldDefinition)
        this._panelFieldNames = _expandObj(fieldDefinition, {fieldAccesor: undefined,fieldName:undefined,fieldEditor:undefined,frameNo:undefined })

        this._frames= undefined
        this._fieldList = undefined
        this._fieldRefernce = {};
        this._options = undefined

        //console.log("this._panelFieldNames")
        //this._log(this._panelFieldNames)
    }

    addOption (options) {
        console.log("addOption")
        this._logvalopt()
        this._options = options
        const _upateObj = (obj,options) => {
            //console.log("_upateObj start")
            const objValues =  Object.values(obj)
            //this._log(objValues)

            objValues.map((ele, i ) =>{
                const opt = options[ele.fieldEditor.opt]
                //console.log("ele")
                //this._log(ele)
                //console.log("opt")
                //this._log(opt)
                
                if (opt !== undefined) {
                    const [frameNo, fieldName]=options[ele.fieldEditor.opt]?.split(".");
                    ele.fieldName = fieldName;
                    ele.frameNo = parseInt(frameNo,3);
                }
                else {
                    ele.fieldName = undefined;
                    ele.frameNo = undefined;
                }
            })
            return obj
        }
        _upateObj(this._panelFieldNames, options)
        console.log("addOption finish")
        this._logvalopt()
        //this._log(this._panelFieldNames)
    }


    setFrames (frames) {
        console.log("setFrames")
        //console.log(this._panelFieldNames)
        //this._log(this._panelFieldNames,true)

        this._frames = frames
        //console.log("setFrames")
        //console.log(this._frames)
        this.clearFieldList()
        this.readFieldList()
        //this._log(this._panelFieldNames)
    }

    clearFieldList () {
        console.log("clearFieldList")
        this._fieldList=[]
    }
    readFieldList() {
        console.log("readFieldList")
        let fieldCount = 0
        this._clearRef()
        if (this._frames) {    
          for (let i = 0; i < this._frames.length; i++) {
            for (let j = 0; j < this._frames[i].fields.length; j++) {
                const fn = "name" in this._frames[i] ? this._frames[i].name: undefined
                this._fieldList.push( {frameNo: i, frameName: fn, fieldNo: j, fieldName: this._frames[i].fields[j].name, fieldType: this._frames[i].fields[j].type })
                this._addToRef(this._frames[i].fields[j].type, fieldCount)
                fieldCount++     
            }  
          }
        }
        return this._frames
    };
    readAccesors(force = false) {
        console.log("readAccesors")
        //console.log("readAccesors")
        return(this._readAccesors(this._panelFieldNames))
    }

    getAccessorByNum(num){
        console.log("getAccessorByNum")
        return(this.getAccessorByName(Object.keys(this._panelFieldNames)[num]))
    }
    getAccessorByName(panelFieldName){
        console.log("getAccessorByName")
        return(this._panelFieldNames[panelFieldName].fieldAccesor)
    }

    getDisplayByNum(num) {
        console.log("getDisplayByNum")
        return(this.getDisplayByName(Object.keys(this._panelFieldNames)[num]))

    }
    getDisplayByName(panelFieldName) {
        console.log("getDisplayByName")
        const _checkObj = function (val) {return val !== undefined && val !== null}
        const _getDisplay = function (val) {return (_checkObj(val)?val.display:undefined)
        }
        return(  _getDisplay (this._panelFieldNames[panelFieldName].fieldAccesor))
    }
    _readAccesors  (obj,force = false)  {
        console.log("_readAccesors")
        //console.log("_readAccesors")
        let ok = true; 
        for (let i = 0;  i < Object.keys(obj).length; i++) {
            if (ok && !this._readAccesor(obj[Object.keys(obj)[i]],force)) {
                if (this._discoverFieldName(obj[Object.keys(obj)[i]]) ){
                    ok = this._readAccesor(obj[Object.keys(obj)[i]],force)
                    //console.log("_readAccesors discover true ok = ")
                    //console.log(ok)
                }
                else {
                    //console.log("_readAccesors discover false ok = ")
                    ok = false
                    //console.log(ok)
                }
            }
        }
        return ok
    }
    _readAccesor (panelField, force = false) {
        console.log("_readAccesor")
        //this._logvalopt()
        //console.log(panelField.fieldName)
        let rtn = false
        const _checkObj = function (val) {return val !== undefined && val !== null}
        if (_checkObj(panelField.fieldName ) && _checkObj(panelField.frameNo) ) {
            console.log("_readAccesor1")
            //this._logvalopt()
            if (_checkObj(panelField.fieldAccesor)) {
                console.log("_readAccesor2")
                //this._logvalopt()
                if (panelField.fieldAccesor.name !== panelField.fieldName || force) {
                    panelField.fieldAccesor = this._frames[panelField.frameNo].fields.find(field => field.name === panelField.fieldName && field.type === panelField.fieldType)
                    console.log("_readAccesor3")
                    //this._logvalopt()
                    //console.log(panelField.fieldAccesor)
                }  
            }
            else {
                panelField.fieldAccesor = this._frames[panelField.frameNo].fields.find(field => field.name === panelField.fieldName && field.type === panelField.fieldType)
                console.log("_readAccesor4")
                //this._logvalopt()
            }
            console.log("_readAccesor5")
            rtn = _checkObj(panelField.fieldAccesor)
            console.log(_checkObj(panelField.fieldAccesor))
            this._logvalopt()

        }
        return(rtn)
    }


    // const CHART_FIELD_DEFINTION = {
    //     source:{fieldPosition:1,fieldType: FieldType.string},
    //     target:{fieldPosition:2,fieldType: FieldType.string},
    //     value:{fieldPosition:1,fieldType: FieldType.number}
    // }
      
    _discoverFieldName (panelField) {
        console.log("_discoverFieldName")
        this._logvalopt()
        //console.log("_discoverFieldName")
        let ok = false
        const fieldRef = this._fieldRefernce[panelField.fieldType]
        
        //console.log("fieldRef")
        //console.log(fieldRef)

        const fieldRefPos = fieldRef[panelField.fieldPosition]
        
        //console.log("fieldRefPos")
        //console.log(fieldRefPos)

        const fieldList = this._fieldList[fieldRefPos]
        
        //console.log("fieldList")
        //console.log(fieldList)
        if (fieldList !== undefined) {
            //console.log("_discoverFieldName set value")
            panelField.fieldName = fieldList.fieldName
            panelField.frameNo = fieldList.frameNo
            ok = true
        }
        return ok
    }

    _clearRef (){
        console.log("_clearRef")
        this._fieldRefernce = {}
    }
        
    _addToRef (fieldType, fieldCount) {
        console.log("_addToRef")
        if (!(fieldType in this._fieldRefernce)) {
            this._fieldRefernce[fieldType] = []
        }
        this._fieldRefernce[fieldType].push(fieldCount)
        return this._fieldRefernce
    };    

    fillEditorOptions(panelFieldName, options) {
        console.log("fillEditorOptions")
        const panelField = this._panelFieldNames[panelFieldName]
        //console.log(panelFieldName)
        //console.log(panelField)
        const fieldRef = this._fieldRefernce[panelField.fieldType]
        //console.log(fieldRef)
        //console.log("Call _fillEditorOption")
        if (fieldRef !== undefined) {fieldRef.map((ele) => {(this._fillEditorOption(ele,options))})}
    }
    _fillEditorOption(num, options=undefined) {
        console.log("_fillEditorOption")
        //i.toString() + "." + frames[i].fields[j].name
        const _value = ({frameNo, fieldName}) => {return frameNo.toString() + "." + fieldName}
        const _label = ({frameNo, frameName, fieldName}) => {return (frameName === undefined?frameNo.toString():frameName) + "." + fieldName}

        const fList = this._fieldList[num]
        //console.log("_fillEditorOption")
        //console.log(fList)
        //console.log(_label(fList))
        //console.log(_value(fList) )
        const opt = { label: _label(fList), value: _value(fList) }
        if (options !== undefined) {options.push(opt)}
        //console.log(opt)
        return (opt)

        //console.log("options")
        //console.log(options)

    }
    getEditorDefaultValue(panelFieldName) {
        console.log("getEditorDefaultValue")
        const _isEmpty = (myEmptyObj) => {return Object.keys(myEmptyObj).length === 0 && myEmptyObj.constructor === Object}
        
        const panelField = this._panelFieldNames[panelFieldName]
        let rtn = undefined
        //console.log("getEditorDefaultValue")
        //console.log(panelField)
        //console.log(this._fieldRefernce)
        
        if (!_isEmpty(this._fieldRefernce)) {
            const fieldRef = this._fieldRefernce[panelField.fieldType]
            const fieldRefPos = fieldRef[panelField.fieldPosition]

            //console.log(fieldRef)
            //console.log(fieldRefPos)

            const {value: val} = this._fillEditorOption(fieldRefPos)
            rtn = val
            //console.log(val)
            //console.log(rtn)

        }
        //console.log(rtn)
        return rtn
    }


    _log(x,direct = false ){
        if (direct || x === undefined) {
            console.log(x)
        }
        else {
            const xcopy = JSON.parse(JSON.stringify(x, this._censor(x)))
            console.log(xcopy)
        }
    }
    _logvalopt(){
        const convNotStr = (x) => {return (typeof x === "string" || x instanceof String ? x : "undefined")}  
        const convNotNum = (x) => {return (typeof x === "number" || x instanceof Number ? x.toString() : "undefined")}  
        
        if (this._panelFieldNames){
            Object.values(this._panelFieldNames).map((ele) => {
                const x = "fieldName: "+ convNotStr(ele.fieldName) + "   frameNo: " + convNotNum(ele.frameNo)
                console.log(x)
                })
            
            if (this._options !== undefined) {
                Object.values(this._panelFieldNames).map((ele) => 
                    console.log(ele.fieldEditor.opt +": "+ this._options[ele.fieldEditor.opt] ))
            }
            
        }
    }
        
    
        _censor(censor) {
        let i = 0;
        
        return function(key, value) {
          if(i !== 0 && typeof(censor) === 'object' && typeof(value) === 'object' && censor === value) {return '[Circular]'; }
            
          
          if(i >= 29) {return '[Unknown]';}// seems to be a harded maximum of 30 serialized objects?
            
          
          ++i; // so we know we aren't using the original object anymore
          
          return value;  
        }
      }


    _logFieldList(){console.log(this._fieldList)}
    _logFieldRefernce(){console.log(this._fieldRefernce)}
    _logFieldContainer(){console.log(this._panelFieldNames)}


}



