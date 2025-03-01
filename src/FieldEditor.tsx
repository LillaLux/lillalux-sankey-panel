import React from 'react';
//import { StandardEditorProps, SelectableValue, FieldType, DataFrame } from '@grafana/data';
import { StandardEditorProps, SelectableValue} from '@grafana/data';
import { Select } from '@grafana/ui';
import { FieldContainerInstance } from './SankeyPanel';

export const defaultField = {source: "", target: "", value:""};

export const FieldEditor = ({ item, value, onChange, context }: StandardEditorProps<string>) => {
  console.log("FieldEditor")
  const fieldContainer = FieldContainerInstance()
  const options: Array<SelectableValue<string>> = [];
  const inOptions = function (opt: Array<SelectableValue<string>>,val: string) {
    let isIn = false;
    opt.map((ele) => {if (ele.value === val && !isIn) {isIn= true } })
    return (isIn)
  }

  //logEditorProps(item, value, onChange, context )
  
  fieldContainer.fillEditorOptions(item.id, options)
  //console.log("print options")
  //console.log(options)
  
  //console.log("print value before")
  //console.log(value)
  if (value === undefined || !inOptions(options,value)) {
    value = fieldContainer.getEditorDefaultValue(item.id)
    //context.options.optSource = value
    //console.log("print value if")
    //console.log(value)
  }
  //console.log(context)
  //const options: Array<SelectableValue<string>> = [];
  return <Select options={options} value={value} onChange={(selectableValue) => onChange(selectableValue.value)} />;
};
