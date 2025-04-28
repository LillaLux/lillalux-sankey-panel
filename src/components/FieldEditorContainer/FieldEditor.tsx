import React from 'react';
import { StandardEditorProps, SelectableValue} from '@grafana/data';
import { Select } from '@grafana/ui';
import { FieldContainerInstance } from '../SankeyPanel/SankeyPanel';

export const defaultField = {source: "", target: "", value:""};

export const FieldEditor = ({ item, value, onChange, context }: StandardEditorProps<string>) => {
  //console.log("FieldEditor")
  const fieldContainer = FieldContainerInstance()
  const fieldNameList: Array<SelectableValue<string>> = [];
  const inOptions = function (opt: Array<SelectableValue<string>>,val: string) {
    let isIn = false;
    opt.map((ele) => {if (ele.value === val && !isIn) {isIn= true } })
    return (isIn)
  }
  fieldContainer.fillEditorOptions(item.id, fieldNameList)
  if (value === undefined || !inOptions(fieldNameList,value)) {
    const defaultValue = fieldContainer.getEditorDefaultValue(item.id)
    if (defaultValue !== undefined) {onChange(defaultValue)} 
  }
  const onUpdate = (str: string | undefined) => {
    //console.log(str)
    onChange(str);
  };
  return <Select options={fieldNameList} value={value} onChange={(selectableValue) => onUpdate(selectableValue.value)} />;
};
