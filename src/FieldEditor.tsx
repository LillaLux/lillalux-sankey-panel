import React from 'react';
import { Select, } from '@grafana/ui';
import { StandardEditorProps, SelectableValue } from '@grafana/data';



export const FieldEditor = ({ item, value, onChange, context }: StandardEditorProps<string>) => {
    const options: Array<SelectableValue<string>> = [];

  if (context.data) {
    const frames = context.data;

    for (let i = 0; i < frames.length; i++) {
        for (let j = 0; j < frames[i].fields.length; j++) {
            options.push({
                label: frames[i].fields[j].name,
                value: frames[i].fields[j].name,
            })
        }
      }
    }
  

  return <Select options={options} value={value} onChange={(selectableValue) => onChange(selectableValue.value)} />;
};
