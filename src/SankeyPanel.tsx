// @ts-nocheck
import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { PanelProps } from '@grafana/data';
import { SankeyOptions } from 'types';
import { Sankey } from 'Sankey'
import { ErrorMessage } from 'Error'
import { css, cx } from '@emotion/css';
import { useStyles2, useTheme2 } from '@grafana/ui';

interface Props extends PanelProps<SankeyOptions> {}

const getStyles = () => {
  return {
    wrapper: css`
      font-family: Open Sans;
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
};
let isDebug = false
let sourcestr = ""
let targetstr = ""
let colorstr = ""
let nodestr = ""
let linkstr = ""
let somethingstr = ""
let valueframe = null

export const SankeyPanel: React.FC<Props> = ({ options, data, width, height }) => {
  isDebug = options.isDebug 
  

  const theme = useTheme2();
  const styles = useStyles2(getStyles);  

  // ------------------------    CHART CONSTANTS    -----------------------
  const CHART_REQUIRED_FIELDS = { source: 'source', target: 'target', value: 'value' };
  const CHART_OPTIONAL_FIELDS = { color_: 'color' };

  // ------------------------    ERROR MESSAGES    ------------------------
  const requiredFieldsMsg = `Required fields not present: ${Object.keys(CHART_REQUIRED_FIELDS).join(', ')}`;
  const fieldTypeMsg = `Fields should have the following types: source (string), target (string), value (numeric)`;

  // -------------------------    REACT HOOKS    --------------------------
  const [ error, setError ] = useState({ isError: false, message: '' })
  const [ graph, setGraph ] = useState({ nodes: [], links: [], colors: [] })

  useEffect(() => {
    data.error
    ?
      setError({isError: true, message: data.error.message})
    :
      setGraph(buildGraph())
  }, [data])

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
    const frame = data.series[0];

    const sourceAccesor = frame.fields.find(field => field.name === CHART_REQUIRED_FIELDS.source);
    const targetAccesor = frame.fields.find(field => field.name === CHART_REQUIRED_FIELDS.target);
    const valueAccesor = frame.fields.find(field => field.name === CHART_REQUIRED_FIELDS.value);
    const valuesNumeric = frame.fields.find(field => field.name === CHART_REQUIRED_FIELDS.value);
    
    //const colorAccesor = frame.fields.find(field => field.name === CHART_OPTIONAL_FIELDS.color_);

    const sources = sourceAccesor?.values.toArray();
    const targets = targetAccesor?.values.toArray();
    const values = valueAccesor?.values.toArray();
    //const colors = iterate(colorAccesor?.values.toArray());
 
    const isValid = validate(sources, targets, values);
    if (!isValid) {return}

    const zip = d3.zip(sources, targets, values);
  
    const nodecolor  = Array.from(new Set(sources.concat(targets))).map(node => ({ name: node.split("#")[0], color: "#" + node.split("#")[1] }));
    //const nodes = Array.from(new Set(sources.concat(targets))).map(node => ({ name: node.split("#")[0]}));
    const links = zip.map(d => ({ source: d[0].split("#")[0], target: d[1].split("#")[0], value: +d[2].toFixed(2) }));

    const colors = getcolor(nodecolor)
    const nodes = getnode(nodecolor)
    
    //colorstr = (colors)?.toString()
    
    if (isDebug){
      sourcestr = (sources)?.toString();
      targetstr = (targets)?.toString();
      nodestr = (JSON.stringify(nodecolor))?.toString();
      linkstr = (JSON.stringify(links))?.toString();
      //somethingstr=valuesNumeric?.display?.toString();
      //const v = valuesNumericvalues.map((value)

      //somethingstr = (JSON.stringify(valuesNumeric.display(500))).toString();
      somethingstr = options.colorScheme
      //somethingstr = getFieldDisplayName(valuesNumeric, frame)
      console.log(nodestr);
      //somethingstr = options.globalUnitFormat;
    }
    const graph = {nodes, links, colors};

    return graph
  }

  // ------------------------------- CHART  ------------------------------
  const chart = svg => {

    const sankey = new Sankey(svg)
      .width(width)
      .height(height)
      .align(options.align)
      .edgeColor(options.edgeColor)
      .colorScheme(options.colorScheme)
      .displayValues(options.displayValues)
      .highlightOnHover(options.highlightOnHover)
      .opacity(options.opacity)
      .globalDecimals(options.globalDecimals)
      .globalUnitFormat(options.globalUnitFormat)
      .data(graph)

    try {
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
