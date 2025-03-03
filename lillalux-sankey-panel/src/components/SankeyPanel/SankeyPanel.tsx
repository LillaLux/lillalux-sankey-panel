// @ts-nocheck
import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { PanelProps, Field, FieldType } from '@grafana/data';
import { SankeyOptions } from 'types';
import { Sankey } from 'components/SankeyPanel/Sankey'
import { ErrorMessage } from 'Error'
//import { css, cx } from '@emotion/css';
import { useStyles2, useTheme2 } from '@grafana/ui';
import { defaultField } from '../FieldEditorContainer/FieldEditor';
import { FieldContainer } from '../FieldEditorContainer/FieldContainer';
//import { FieldContainer,defaultField } from '../../components';
import { getStyles } from '../../styles';

let isDebug = false
let sourcestr = ""
let targetstr = ""
let colorstr = ""
let nodestr = ""
let linkstr = ""
let somethingstr = ""
let valueframe = null

//let CHART_FIELD_DEFINTION = {}
const CHART_FIELD_DEFINTION = {
  source:{fieldPosition:0,fieldType: FieldType.string},
  target:{fieldPosition:1,fieldType: FieldType.string},
  value:{fieldPosition:0,fieldType: FieldType.number}
}
const CHART_FIELD_COPY = JSON.parse(JSON.stringify(CHART_FIELD_DEFINTION));
console.log(CHART_FIELD_DEFINTION)
console.log(CHART_FIELD_COPY)


const fieldContainer = new FieldContainer(CHART_FIELD_COPY);

export const FieldContainerInstance = () => {return fieldContainer}

//fieldContainer._logFieldContainer();
  



export const SankeyPanel: React.FC<Props> = ({ options, data, width, height }) => {
  isDebug = options.isDebug 
  //console.log ('Start')

  const theme = useTheme2();
  const styles = useStyles2(getStyles);  

  // ------------------------    CHART CONSTANTS    -----------------------
  //const CHART_REQUIRED_FIELDS = { source: 'source', target: 'target', value: 'value' };
  const CHART_REQUIRED_FIELDS = { source: options.columnSource, target: options.columnTarget, value: options.columnValue };
  const CHART_FIELD_NAMES = { source: options.columnSource, target: options.columnTarget, value: options.columnValue };
  //const CHART_OPTIONAL_FIELDS = { color_: 'color' };

  // ------------------------    ERROR MESSAGES    ------------------------
  const requiredFieldsMsg = `Required fields not present: ${Object.keys(CHART_REQUIRED_FIELDS).join(', ')}`;
  const fieldTypeMsg = `Fields should have the following types: source (string), target (string), value (numeric)`;
  const columnsNotCfg = `No columns configuered`;

  // -------------------------    REACT HOOKS    --------------------------
  const [ error, setError ] = useState({ isError: false, message: '' })
  const [ graph, setGraph ] = useState({ nodes: [], links: [], colors: []})
  //const [ accessor, setAccessor ] = useState({accessor: Field<any> | undefined})

  //let displayReference

  useEffect(() => {
    data.error
    ?
      setError({isError: true, message: data.error.message})
    :
      setGraph(buildGraph())
  }, [data])

  fieldContainer.setFrames(data.series)
  fieldContainer.addOption(options)
  fieldContainer.readAccesors()

  //fieldContainer._logFieldContainer();
  //fieldContainer._logFieldList();
  //fieldContainer._logFieldRefernce();
    

  const validateOptions = (opt) => {
    let isValid = true;

    // REQUIRED FIELDS
    if (!(opt.source)) {
      setError({ isError: true, message: columnsNotCfg })
      return isValid = false;
    }
  }

  const strChk = (str: string) => {return str === ""? "<empty>": str}

  // -------------------------    READ DATA FRAMES    --------------------------
  somethingstr  = "S: " + strChk(options.columnSource) + ",  T: " + strChk(options.columnTarget)  +", V: " + strChk(options.columnValue) +
  "  Sd: " + strChk(defaultField.source) + ",  Td: " + strChk(defaultField.target)  +", Vd: " + strChk(defaultField.value)


  // const setAcessor = (fieldname) => {
  //   const frame = data.series[0];
  //   //setDataFrame(frame)
  //   return frame.fields.find(field => field.name === fieldname )
  // }
  // const valueAccesor = setAcessor(CHART_REQUIRED_FIELDS.value)

  //console.log(valueAccesor)

  //let displayReference
  // if (data.series.length > 0)  {
  //   //console.log(displayReference)
  //   sourceAccesor = frame.fields.find(field => field.name === CHART_REQUIRED_FIELDS.source);
  //   targetAccesor = frame.fields.find(field => field.name === CHART_REQUIRED_FIELDS.target);
  //valueAccesor = frame.fields.find(field => field.name === CHART_REQUIRED_FIELDS.value);
  //displayReference = valueAccesor.display
  //   //console.log(displayReference)
  // }

  // -------------------------  DATA ACQUISITION  -------------------------
  const validate = (sources, targets, values) => {
    let isValid = true;

    // REQUIRED FIELDS
    if (!(sources && targets && values)) {
      setError({ isError: true, message: requiredFieldsMsg })
      return isValid = false;
    }

    // FIELD TYPES
    const sourcesString = sources.every(d => typeof d === 'string')
    const targetsString = targets.every(d => typeof d === 'string')
    const valuesNumeric = values.every(d => typeof d === 'number')
    if (!(sourcesString && targetsString && valuesNumeric)) {
      setError({ isError: true, message: fieldTypeMsg })
      return isValid = false;
    }

    setError({});

    return isValid;
  }

  const iterate = (obj) => {
    let rtn = []
    for (let i = 0; i < obj.length; i++) {
      rtn.push(obj[i])
    }    
    return rtn
  }
  const getcolor = (obj) => {
    let rtn = []
    for (let i = 0; i < obj.length; i++) {
      rtn.push(obj[i].color)
    }    
    return rtn
  }
  const getnode = (obj) => {
    let rtn = []
    for (let i = 0; i < obj.length; i++) {
      rtn.push({name: obj[i].name})
    }    
    return rtn
  }

  const buildGraph = () => {

    
    //const frame = data.series[0];
    
    //console.log("buildGraph")

    //const sourceAccesor = frame.fields.find(field => field.name === CHART_REQUIRED_FIELDS.source);
    //const targetAccesor = frame.fields.find(field => field.name === CHART_REQUIRED_FIELDS.target);

    //valueAccesor = frame.fields.find(field => field.name === CHART_REQUIRED_FIELDS.value);
    //console.log(valueAccesor)
      //setDisp(valueAccesor.display)
    //displayReference = valueAccesor.display;
    fieldContainer.addOption(options)

    fieldContainer.readAccesors()
  

    const sources = fieldContainer.getAccessorByNum(0)?.values.toArray();
    const targets = fieldContainer.getAccessorByNum(1)?.values.toArray();
    const values = fieldContainer.getAccessorByNum(2)?.values.toArray();
    console.log("sources")
    console.log(sources)
    console.log("targets")
    console.log(targets)
    console.log("values")
    console.log(values)

    //const colors = iterate(colorAccesor?.values.toArray());
 
    const isValid = validate(sources, targets, values);
    if (!isValid) {return}

    const zip = d3.zip(sources, targets, values);
  
    const nodecolor  = Array.from(new Set(sources.concat(targets))).map(node => ({ name: node.split("#")[0], color: "#" + node.split("#")[1] }));
    //const nodes = Array.from(new Set(sources.concat(targets))).map(node => ({ name: node.split("#")[0]}));
    const links = zip.map(d => ({ source: d[0].split("#")[0], target: d[1].split("#")[0], value: +d[2].toFixed(2) }));

    const colors = getcolor(nodecolor)
    const nodes = getnode(nodecolor)
    console.log(nodes)
    //const displayReference = valueAccesor.display
    
    if (isDebug){
      sourcestr = (sources)?.toString();
      targetstr = (targets)?.toString();
      nodestr = (JSON.stringify(nodecolor))?.toString();
      linkstr = (JSON.stringify(links))?.toString();
    //      somethingstr=displaytext(50000)+displaysuffix(50000)
    }
    const graph = {nodes, links, colors};

    return graph
  }

  // ------------------------------- CHART  ------------------------------
  const chart = svg => {

    //console.log("chart")
    //console.log(  console.log(valueAccesor))
    const sankey = new Sankey(svg)
        .width(width)
        .height(height)
        .align(options.align)
        .edgeColor(options.edgeColor)
        .colorScheme(options.colorScheme)
        .displayValues(options.displayValues)
        .highlightOnHover(options.highlightOnHover)
        .opacity(options.opacity)
        .fontsize(options.fontsize)
        .fontcolor(options.fontcolor)
        .backgroundcolor(theme.colors.background.primary)
        .displayReference(fieldContainer.getDisplayByNum(2))
        .data(graph)

  

    try {
      //const displayValue = displayReference!(200)   
      //somethingstr= (JSON.stringify(displayValue))?.toString();
      //sankey.displayReference(displayReference)
      sankey.render();
    } catch (renderError) {
      setError({isError: true, message: renderError.message})
    }
  };

  return (error.isError ?
    <ErrorMessage message={error.message} />
    :
    !isDebug ?
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        ref={node => {
          d3.select(node)
            .selectAll('*')
            .remove();
          d3.select(node).call(chart);
        }}
      />
    </div>
    :
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        ref={node => {
          d3.select(node)
            .selectAll('*')
            .remove();
          d3.select(node).call(chart);
        }}
      />
      <div className={styles.textBox}>
      <div><div style={{display: 'inline-block'}}>options.globalUnitFormat</div>: <div style={{display: 'inline-block'}}>{options.globalUnitFormat}</div></div>
      <p>Dispaly: {somethingstr}</p>
      <p>Links: {linkstr}</p>
      <p>NodesColor: {nodestr}</p>

      </div>
    </div>
    );
      //   <div className={styles.textBox}>
      //   <p>Source: {sourcestr}</p>
      //   <p>Target: {targetstr}</p>
      //   <p>Color: {colorstr}</p>
      //   <p>Nodes: {nodestr}</p>
      //   <p>Linkes: {linkstr}</p>
      // </div>   
 
};
