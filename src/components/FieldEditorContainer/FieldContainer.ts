//import { isNumberObject } from 'node:util/types';
//import { table } from 'console';
import _ from 'lodash';
import { FieldDefinition, FieldDefinitionBasic, FieldDefinitionExtension, FieldList,FieldReference, NodeColorElement,NodeNameElement, ColorElement, LinkElement, SankeyOptions, FieldDefintionEditor } from '../../types';
//import { FieldDefinition, FieldDefinitionBasic, FieldDefinitionExtension, FieldDefintionEditor, FieldList,FieldReference, SankeyOptions } from '../../types';
//import { FieldType, DataFrame, Field, DisplayProcessor, SelectableValue, getDisplayProcessor} from '@grafana/data';
import { FieldType, DataFrame, Field, DisplayProcessor, SelectableValue } from '@grafana/data';



export class FieldContainer {
    //private _error: boolean;
    private _debug = false;
    private _hasChanged = {data:false, option:false, color:false}
    private _panelFieldNames: FieldDefinition;
    private _frames: DataFrame[] ;
    private _fieldList: FieldList[] ;
    private _fieldRefernce: FieldReference;
    private _options: SankeyOptions | undefined;
    private _linksForD3: LinkElement[];
    private _nodesForD3: NodeNameElement[];
    private _nodesForEditor: NodeColorElement[];
    private _colorsForD3: ColorElement[];
    
    constructor (fieldDefinition: FieldDefinition) {
        if (this._debug) {console.log("constructor")}
        this._logvalopt()
        //this._log(this._panelFieldNames,true)
        //if (this._debug) {console.log( this._panelFieldNames)}
        //this._error = false;
        const pathPrefix = "opt", optPrefix = "opt", namePrefix = "", nameSuffix = " Column"
        const creatName = (nameIn: string, prefix: string, suffix: string) => {return prefix+nameIn.slice(0,1).toUpperCase() + nameIn.slice(1).toLowerCase()+suffix}
        const createObj = (nameIn: string, pathPrefix: string , optPrefix: string, namePrefix: string, nameSuffix: string): FieldDefintionEditor => 
            {
                return ({
                        id: nameIn,
                        path: creatName(nameIn, pathPrefix, ""),
                        opt: creatName(nameIn, optPrefix, "") as keyof SankeyOptions,
                        name: creatName(nameIn, namePrefix, nameSuffix)
                })
            }   

 
        
        const _expandObj = function (   obj: FieldDefinition,
                                        add: FieldDefinitionExtension, 
                                    ): FieldDefinition {
            const objKeys = Object.keys(obj), objValues = Object.values(obj)
            objValues.map((ele,i) => {
                add.fieldEditorIndex = i 
                ele.extension = {...add}
                ele.editor = {...createObj(objKeys[i], pathPrefix, optPrefix, namePrefix, nameSuffix) }
            }) 
            
            return obj
        }

        //if (this._debug) {console.log("fieldDefinition")}
        //this._log(fieldDefinition)
        this._panelFieldNames = _expandObj(fieldDefinition, {fieldAccesor: undefined,fieldName: undefined, fieldEditorIndex: 0 ,frameNo:undefined })

        this._frames = [];
        this._fieldList = []; 
        this._fieldRefernce = {};
        this._options = undefined;
        this._linksForD3 = [];
        this._nodesForD3 = [];
        this._colorsForD3 = [];
        this._nodesForEditor = [] 
        

        //if (this._debug) {console.log("this._panelFieldNames")}
        //this._log(this._panelFieldNames)
    }
    // getFieldEditorByNum (num: number): FieldDefintionEditor {
    //     const panelFieldName = Object.keys(this._panelFieldNames)[num]
    //     return this._getFieldEditorByName(panelFieldName)
    // }

    // _getFieldEditorByName (panelFieldName: string): FieldDefintionEditor {
    //     const pathPrefix = "opt", optPrefix = "opt", namePrefix = "", nameSuffix = " Column"
    //     const creatName = (nameIn: string, prefix: string, suffix: string) => {return prefix+nameIn.slice(0,1).toUpperCase() + nameIn.slice(1).toLowerCase()+suffix}
    //     const createObj = (nameIn: string, pathPrefix: string , optPrefix: string, namePrefix: string, nameSuffix: string): FieldDefintionEditor => 
    //         {
    //             return ({
    //                     id: nameIn,
    //                     path: creatName(nameIn, pathPrefix, ""),
    //                     opt: creatName(nameIn, optPrefix, "") as keyof SankeyOptions,
    //                     name: creatName(nameIn, namePrefix, nameSuffix)
    //             })
    //         }   
    //         return createObj(panelFieldName, pathPrefix, optPrefix, namePrefix, nameSuffix)  

    // }    


    addOption (options: SankeyOptions) {
        if (this._debug) {console.log("addOption")}
        this._logvalopt()
        if (!_.isEqual(this._options, options)) {
            this._options = options
            this._mapFieldOption()

            //this._mapColorOption()
        }
    }

    _mapFieldOption() {

        const _upateObj = (obj: FieldDefinition, options: SankeyOptions) => {
            //if (this._debug) {console.log("_upateObj start")}
            const objValues =  Object.values(obj)
            //this._log(objValues)

            objValues.map((ele, i ) =>{
                //const opt = ele.fieldEditor.opt !== undefined ? options[ele.fieldEditor.opt] : undefined
                //if (this._debug) {console.log("ele")}
                //this._log(ele)
                //if (this._debug) {console.log("opt")}
                //this._log(opt)
                const opt = ele.editor.opt
                if (opt !== undefined) {
                    const optVal = options[opt] as string
                    const [frameNo, fieldName] = optVal.split(".");
                    ele.extension.fieldName = fieldName;
                    ele.extension.frameNo = parseInt(frameNo,3);
                }
                else {
                    ele.extension.fieldName = undefined;
                    ele.extension.frameNo = undefined;
                }
            })
            return obj
        }
        if (this._options !== undefined ) {_upateObj(this._panelFieldNames, this._options)}
        if (this._debug) {console.log("addOption finish")}
        this._logvalopt()
        //this._log(this._panelFieldNames)
    }

    mapColorOption (listNodeColor: NodeColorElement[]): NodeColorElement[] {
        let rtn: NodeColorElement[]
        if (this._options  !== undefined) {
            this._options.nodeColors = listNodeColor
            rtn = this._mapColorOption()
        } else {
            rtn = []
        }
        return rtn
    }

    _mapColorOption (): NodeColorElement[] {
        const listNodeColor: NodeColorElement[] = this._options?.nodeColors !== undefined ? this._options?.nodeColors : []
        if (this._nodesForEditor.length > 0 ) {
            listNodeColor.map((l) =>{
                let lNode: string
                if  (l.node !== undefined) {
                    lNode = l.node
                    const i = this._nodesForEditor.findIndex((n) => {
                        let rtn = false
                        if (n.node !== undefined) {
                            rtn = (n.node === lNode)
                        }
                        return rtn 
                    })
                    if (i >= 0 ) {this._nodesForEditor[i].color = l.color}
                }
            } )
            this._colorsForD3 = []
            this._nodesForEditor.map((e)=> {
                if (e.color !== undefined) {
                    this._colorsForD3.push( e.color)
                }
            })
        }
        return (this._nodesForEditor.length > 0 ? this._nodesForEditor : listNodeColor)
    }

    hasChangedColor () {
        const rtn = this._hasChanged.color
        this._hasChanged.color = false
        return rtn
    }
    


    setFrames (frames: DataFrame[]) {
        if (this._debug) {console.log("setFrames")}
        //if (this._debug) {console.log(this._panelFieldNames)}
        //this._log(this._panelFieldNames,true)

        this._frames = frames
        //if (this._debug) {console.log("setFrames")}
        //if (this._debug) {console.log(this._frames)}
        this.clearFieldList()
        this.readFieldList()
        //this._log(this._panelFieldNames)
    }

    clearFieldList (): void {
        if (this._debug) {console.log("clearFieldList")}
        this._fieldList=[]
    }
    readFieldList(): DataFrame[] {
        if (this._debug) {console.log("readFieldList")}
        let fieldCount = 0
        this._clearRef()
        if (this._frames !== undefined) {    
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
    readAccesors(force = false): boolean {
        if (this._debug) {console.log("readAccesors")}
        console.log(this._frames)
        //if (this._debug) {console.log("readAccesors")}
        return(this._readAccesors(this._panelFieldNames,force))
    }

    

    getAccessorByNum(num: number): Field |  undefined{
        if (this._debug) {console.log("getAccessorByNum")}
        return(this.getAccessorByName(Object.keys(this._panelFieldNames)[num]))
    }
    getAccessorByName(panelFieldName: string): Field | undefined{
        if (this._debug) {console.log("getAccessorByName")}
        return(this._panelFieldNames[panelFieldName].extension.fieldAccesor)
    }

    getDisplayByNum(num: number): DisplayProcessor | undefined {
        if (this._debug) {console.log("getDisplayByNum")}
        return(this.getDisplayByName(Object.keys(this._panelFieldNames)[num]))

    }
    getDisplayByName(panelFieldName: string): DisplayProcessor | undefined {
        if (this._debug) {console.log("getDisplayByName")}
        let rtn: DisplayProcessor | undefined = undefined;
        const _checkObj = function (val: Field) {return val !== undefined && val !== null}
        const _getDisplay = function (val: Field): DisplayProcessor | undefined {return (_checkObj(val) ? val.display as DisplayProcessor : undefined)
        }
        if(this._panelFieldNames[panelFieldName].extension.fieldAccesor !== undefined) {
            rtn = _getDisplay (this._panelFieldNames[panelFieldName].extension.fieldAccesor)
        }
        // const Disp = getDisplayProcessor({
        //     field: this._panelFieldNames[2].extension.fieldAccesor,
        //     theme: config.theme2,
        //   });
        return( rtn )
    }

    getLinks (): LinkElement[] {return (this._linksForD3)}
    getNodes (): NodeNameElement[] {return (this._nodesForD3)}
    getColor (): string[] {return (this._colorsForD3)}
    
    // getAccessorsByList(list: number[]=[0,1]): Array<Field | undefined> {
    //     const arrAccessors = Object.values(this._panelFieldNames).filter((ele,i) => list.includes(i) && ele.extension.fieldAccesor !== undefined).map((ele) => ele.extension.fieldAccesor )
    //     return arrAccessors
    // }

    // getUniqueValuesByList (list: number[]=[0,1]): string[] {
    //     const accesors = this.getAccessorsByList(list) 
    //     let rtn: string[] = []
    //     let accessrVal: string[][]
    //     if (accesors !== undefined && accesors.length > 0) {
    //         accessrVal = accesors.map((ele) => ele?.values) as string[][]
    //         if (this._debug) {console.log(accessrVal)}
    //         const valueList = accessrVal.reduce ((total: string[], arr: string[] ) => [...total,...arr],[])
    //         if (this._debug) {console.log(valueList)}
            
    //         rtn = [...new Set(valueList)]
    //     }
    //     if (this._debug) {console.log(rtn)}
    //     return rtn
    // }

    _readAccesors  (obj: FieldDefinition,force = false): boolean {
        if (this._debug) {console.log("_readAccesors")}
        //if (this._debug) {console.log("_readAccesors")}
        let ok = true; 
        for (let i = 0;  i < Object.keys(obj).length; i++) {
            if (ok && !this._readAccesor(obj[Object.keys(obj)[i]].basic, obj[Object.keys(obj)[i]].extension,force)) {
                if (this._discoverFieldName(obj[Object.keys(obj)[i]].basic, obj[Object.keys(obj)[i]].extension)) {
                    ok = this._readAccesor(obj[Object.keys(obj)[i]].basic, obj[Object.keys(obj)[i]].extension, force)
                    //if (this._debug) {console.log("_readAccesors discover true ok = ")}
                    //if (this._debug) {console.log(ok)}
                }
                else {
                    //if (this._debug) {console.log("_readAccesors discover false ok = ")}
                    ok = false
                    //if (this._debug) {console.log(ok)}
                }
            }
        }
        if (ok && this._hasChanged.data) {
            if (this._fillLinks()) {
                if (this._fillNodes([0,1]))
                    {this._hasChanged.data = false }
        }}
        return ok
    }
    _readAccesor (basic: FieldDefinitionBasic, extension: FieldDefinitionExtension, force = false) {
        if (this._debug) {console.log("_readAccesor")}
        //this._logvalopt()
        //if (this._debug) {console.log(panelField.fieldName)}
        let rtn = false
        
        //const _checkObj = function (val: any | undefined) {return val !== undefined && val !== null}
        const isChangedConfig = (current: Field | undefined, saved: Field) => {
            let rtn = false
            if (current !== undefined) {
                let {unit, decimals} = current.config
                if (!(unit === saved.config.unit && decimals === saved.config.decimals)) {
                    rtn = true
                }
            }
            return rtn

        }

        if (extension.fieldName !== undefined && extension.frameNo !== undefined ) {
            if (this._debug) {console.log("_readAccesor1")}
            //this._logvalopt()
            if (extension.fieldAccesor !== undefined) {
                if (this._debug) {console.log("_readAccesor2")}
                this._frames[extension.frameNo].fields.find(field => field.name === extension.fieldName && field.type === basic.fieldType)
                //this._logvalopt()
                //console.log (extension.fieldAccesor.config) 
                let tmpAccesor = this._frames[extension.frameNo].fields.find(field => field.name === extension.fieldName && field.type === basic.fieldType)


                if (extension.fieldAccesor.name !== extension.fieldName  || isChangedConfig(tmpAccesor, extension.fieldAccesor) || force) {

                    extension.fieldAccesor = this._frames[extension.frameNo].fields.find(field => field.name === extension.fieldName && field.type === basic.fieldType)
                    this._hasChanged.data = true;
                    if (this._debug) {console.log("_readAccesor3")}
                    //this._logvalopt()
                    //if (this._debug) {console.log(panelField.fieldAccesor)}
                }  
                
            }
            else {

                extension.fieldAccesor = this._frames[extension.frameNo].fields.find(field => field.name === extension.fieldName && field.type === basic.fieldType)
                this._hasChanged.data = true;
                if (this._debug) {console.log("_readAccesor4")}
                //this._logvalopt()
            }
            if (this._debug) {console.log("_readAccesor5")}
            rtn = (extension.fieldAccesor !== undefined)
            if (this._debug) {console.log(rtn)}
            this._logvalopt()

        }
        return(rtn)
    }


    // const CHART_FIELD_DEFINTION = {
    //     source:{fieldPosition:1,fieldType: FieldType.string},
    //     target:{fieldPosition:2,fieldType: FieldType.string},
    //     value:{fieldPosition:1,fieldType: FieldType.number}
    // }
      
    _discoverFieldName (basic: FieldDefinitionBasic, extension: FieldDefinitionExtension): boolean {
        if (this._debug) {console.log("_discoverFieldName")}
        this._logvalopt()
        //if (this._debug) {console.log("_discoverFieldName")}
        let ok = false
        const fieldRef = this._fieldRefernce[basic.fieldType]
        
        //if (this._debug) {console.log("fieldRef")}
        //if (this._debug) {console.log(fieldRef)}

        const fieldRefPos = fieldRef[basic.fieldPosition]
        
        //if (this._debug) {console.log("fieldRefPos")}
        //if (this._debug) {console.log(fieldRefPos)}

        const fieldList = this._fieldList[fieldRefPos]
        
        //if (this._debug) {console.log("fieldList")}
        //if (this._debug) {console.log(fieldList)}
        if (fieldList !== undefined) {
            //if (this._debug) {console.log("_discoverFieldName set value")}
            extension.fieldName = fieldList.fieldName
            extension.frameNo = fieldList.frameNo
            ok = true
        }
        return ok
    }

    _clearRef (): void{
        if (this._debug) {console.log("_clearRef")}
        this._fieldRefernce = {}
    }
        
    _addToRef (fieldType: FieldType, fieldCount: number): FieldReference {
        if (this._debug) {console.log("_addToRef")}
        if (!(fieldType in this._fieldRefernce)) {
            this._fieldRefernce[fieldType] = []
        }
        this._fieldRefernce[fieldType].push(fieldCount)
        return this._fieldRefernce
    };    

    _fillLinks (): boolean {
        const objKeys = Object.keys(this._panelFieldNames), objValues = Object.values(this._panelFieldNames)
        const values = []
        const key: string[] = []
        let len = Infinity
        let error = false
        for (let j = 0; j < objValues.length && !error; j++) {
            const accsor = objValues[j].extension.fieldAccesor
            key.push(objKeys[j])
            if (accsor !== undefined) {
                values.push(accsor.values)
                len = Math.min(len, accsor.values.length)
            } else {
                error = true
            }
        }
        if (!error) {
            this._linksForD3 = []
            for (let i = 0; i < len; i++ ) {
               const val: LinkElement = {}
               for (let j = 0; j < objValues.length && !error; j++) {
                    (typeof values[j][i] === "number") ? 
                    Object.defineProperty(val, key[j], {value: values[j][i].toFixed(2), writable: true, enumerable: true, configurable: true}) : 
                    Object.defineProperty(val, key[j], {value: values[j][i], writable: true, enumerable: true, configurable: true})
                }
                this._linksForD3.push(val)
            }
        
        }
        return (!error)
    
    }



    _fillNodes (list: number[]=[0,1]): boolean {
        const objValues = Object.values(this._panelFieldNames)
        let valueList: any[] = []
        let len = Infinity
        let error = false
        for (let j = 0; j < list.length && !error; j++) {
            const accsor = objValues[list[j]].extension.fieldAccesor
            if (accsor !== undefined) {
                valueList = [...valueList, ...accsor.values]
                len = Math.min(len, accsor.values.length)
            } else {
                error = true
            }
        }
        if (!error) {
            const nodes = [...new Set(valueList)].sort()
            this._nodesForD3 = nodes.map((ele) => {return ({name: ele})})
            this._nodesForEditor = nodes.map((ele) => {return ({node: ele, color:"#808080"})})
            this._mapColorOption()
            this._hasChanged.color = true
        }
        return (!error)
    }


    fillEditorOptions(panelFieldName: string, fieldNameList: Array<SelectableValue<string>>): void {
        if (this._debug) {console.log("fillEditorOptions")}
        const panelField = this._panelFieldNames[panelFieldName]
        //if (this._debug) {console.log(panelFieldName)}
        //if (this._debug) {console.log(panelField)}
        const fieldRef = this._fieldRefernce[panelField.basic.fieldType]
        //if (this._debug) {console.log(fieldRef)}
        //if (this._debug) {console.log("Call _fillEditorOption")}
        if (fieldRef !== undefined) {fieldRef.map((ele) => {(this._fillEditorOption(ele,fieldNameList))})}
    }


    _fillEditorOption(num: number, fieldNameList: Array<SelectableValue<string>> =[]): SelectableValue<string> {
        if (this._debug) {console.log("_fillEditorOption")}
        //i.toString() + "." + frames[i].fields[j].name
        const _value = ({frameNo, fieldName}: FieldList) => {return frameNo.toString() + "." + fieldName}
        const _label = ({frameNo, frameName, fieldName}: FieldList) => {return (frameName === undefined?frameNo.toString():frameName) + "." + fieldName}

        const fList = this._fieldList[num]
        //if (this._debug) {console.log("_fillEditorOption")}
        //if (this._debug) {console.log(fList)}
        //if (this._debug) {console.log(_label(fList))}
        //if (this._debug) {console.log(_value(fList) )}
        const opt = { label: _label(fList), value: _value(fList) }
        if (fieldNameList !== undefined) {fieldNameList.push(opt)}
        //if (this._debug) {console.log(opt)}
        return (opt)

        //if (this._debug) {console.log("options")}
        //if (this._debug) {console.log(options)}

    }
    getEditorDefaultValue(panelFieldName: string) {
        if (this._debug) {console.log("getEditorDefaultValue")}
        const _isEmpty = (myEmptyObj: FieldReference) => {return Object.keys(myEmptyObj).length === 0 && myEmptyObj.constructor === Object}
        
        const panelField = this._panelFieldNames[panelFieldName]
        let rtn = undefined
        //if (this._debug) {("getEditorDefaultValue")}
        //if (this._debug) {console.log(panelField)}
        //if (this._debug) {console.log(this._fieldRefernce)}
        
        if (!_isEmpty(this._fieldRefernce)) {
            const fieldRef = this._fieldRefernce[panelField.basic.fieldType]
            const fieldRefPos = fieldRef[panelField.basic.fieldPosition]

            //if (this._debug) {console.log(fieldRef)}
            //if (this._debug) {console.log(fieldRefPos)}

            const {value: val} = this._fillEditorOption(fieldRefPos)
            rtn = val
            //if (this._debug) {console.log(val)}
            //if (this._debug) {console.log(rtn)}

        }
        //if (this._debug) {console.log(rtn)}
        return rtn
    }


    _logvalopt(){
        const convNotStr = (x: any) => {return (typeof x === "string" || x instanceof String ? x : "undefined")}  
        const convNotNum = (x: any) => {return (typeof x === "number" || x instanceof Number ? x.toString() : "undefined")}  
        
        if (this._panelFieldNames){
            Object.values(this._panelFieldNames).map((ele) => {
                const x = "fieldName: "+ convNotStr(ele.extension.fieldName) + "   frameNo: " + convNotNum(ele.extension.frameNo)
                if (this._debug) {console.log(x)}
                })
            
            if (this._options !== undefined) {
                Object.values(this._panelFieldNames).map((ele) => {
                    const opt = ele.editor.opt
                    if (opt === undefined) {
                        if (this._debug) {console.log("undefined: "+ "undefined")}
                    } else {
                        if (this._options === undefined) {
                            if (this._debug) {console.log(opt +": "+ "undefined")}
                        } else {
                            if (this._debug) {console.log(opt +": "+ this._options[opt])}
                        }
                    }


                })

            }
            
        }
    }

    _log(x: any,direct = false ){
        if (direct || x === undefined) {
            if (this._debug) {console.log(x)}
        }
        else {
            const xcopy = JSON.parse(JSON.stringify(x, this._censor(x)))
            if (this._debug) {console.log(xcopy)}
        }
    }
        
    
    _censor(censor: any) {
        let i = 0;
        
        return function(key: any, value: any) {
          if(i !== 0 && typeof(censor) === 'object' && typeof(value) === 'object' && censor === value) {return '[Circular]'; }
            
          
          if(i >= 29) {return '[Unknown]';}// seems to be a harded maximum of 30 serialized objects?
            
          
          ++i; // so we know we aren't using the original object anymore
          
          return value;  
        }
      }
    _logFieldList(){if (this._debug) {console.log(this._fieldList)}}
    _logFieldRefernce(){if (this._debug) {console.log(this._fieldRefernce)}}
    _logFieldContainer(){if (this._debug) {console.log(this._panelFieldNames)}}


}



