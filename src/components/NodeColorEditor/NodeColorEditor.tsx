import React from 'react';

import { css } from '@emotion/css';

import { GrafanaTheme2, StandardEditorProps} from '@grafana/data';
import { ColorPicker, useStyles2 } from '@grafana/ui';
import { FieldContainerInstance } from '../SankeyPanel/SankeyPanel';
import { NodeColorElement, SankeyOptions } from '../../types';

type NodeColorOptionsEditorProps = StandardEditorProps<NodeColorElement[], undefined, SankeyOptions, undefined>;

let isChanged = true

export const NodeColorEditor = ({ value, onChange, context }: NodeColorOptionsEditorProps) => {
  const fieldContainer = FieldContainerInstance()
    
  const styles = useStyles2(getStyles);
  if (isChanged || value.length === 0 || fieldContainer.hasChangedColor()) {
    const nodeColorOption =  fieldContainer.mapColorOption(value)
    if (nodeColorOption.length > 0 ) {
      onChange(fieldContainer.mapColorOption(value))
      isChanged = false
    } else {
      isChanged = true
    }
  }
  // .. siehe Node Graph https://github.com/grafana/grafana/blob/main/public/app/plugins/panel/nodeGraph/editor/ArcOptionsEditor.tsx
  const updateNode = <K extends keyof NodeColorElement>(idx: number, prop: K, newValue: NodeColorElement[K]) => {
    let arr = value?.slice() ?? [];
    arr[idx][prop] = newValue;
    isChanged = true;
    onChange(arr);
  };

  return (
    <>
      {value?.map((ele, i) => {
        return (
          <div className={styles.section} key={i}>
            <ColorPicker
              color={ele.color || '#808080'}
              onChange={(val) => {
                updateNode(i, 'color', val);
              }}
            />
            <p style={{textAlign: "left"}}>{ele.node}</p>
          </div>
        );
      })}
    </>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    section: css({
      display: 'flex',
      alignItems: 'left',
      //justifyContent: 'space-between',
      gap: `0 ${theme.spacing(1)}`,
      marginBottom: theme.spacing(1),
      textAlign: 'left',
      fontSize: 10
    }),
  };
};

//            <Select options={nodeNames} value={ele.node ?? ''} onChange={(val) => {updateNode(i, 'node', val?.value)}} />
//<Button size="sm" icon="minus" variant="secondary" onClick={() => removeNode(i)} title="Remove arc" />
//<Button size={'sm'} icon="plus" onClick={addNode} variant="secondary">
//Add arc
//</Button>

            // {/* <Select 
            //   context={context}
            //   value={ele.node ?? ''}
            //   onChange={(val) => {
            //     updateNode(i, 'node', val);
            //   }}
            //   item={{
            //     settings: {
            //       filter: (field: Field) => field.name.includes('arc__'),
            //     },
            //     id: `arc-field-${i}`,
            //     name: `arc-field-${i}`,
            //   }}
            // /> */}
