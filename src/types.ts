
import { FieldType, Field } from '@grafana/data';
type SankeyAlign = 'Left' | 'Right' | 'Center' | 'Justify';
type EdgeColor = 'input' | 'output' | 'path' | 'none';
type DisplayValues = 'total' | 'percentage' | 'both' | 'none';
type Color =
    'NoSchema'
  | 'Category10'
  | 'Accent'
  | 'Dark2'
  | 'Paired'
  | 'Pastel1'
  | 'Pastel2'
  | 'Set1'
  | 'Set2'
  | 'Set3'
  | 'Tableau10';

  export interface NodeColorElement {
    color?: string; // The color of the nodes
    node?: string; //Node from which to get the value. Values should be less than 1, representing fraction of a circle.
  }

  export interface NodeNameElement {
    name?: string; // The name of the nodes handed over to D3.
  }

  export interface LinkElement {
    source?: string; // source field name to handed over to D3 
    target?: string; // target field name to handed over to D3 
    value?: number; // The value field name to handed over to D3
  }
  export type ColorElement = string

  export type FieldDefintionEditor = {id: string | undefined, path: string | undefined, opt: keyof SankeyOptions| undefined, name: string | undefined}
  export type FieldDefinitionExtension =  {fieldAccesor: Field | undefined, fieldName: string | undefined, fieldEditorIndex: number, frameNo: number | undefined}
  //export type FieldDefinition = FieldDefinitionRaw & FieldDefinitionExtension; 
  export type FieldDefinitionBasic = {fieldPosition: number, fieldType: FieldType }
    export type FieldDefinition =  { [key: string]: {basic: FieldDefinitionBasic, extension: FieldDefinitionExtension, editor: FieldDefintionEditor}}


  export type FieldList = {frameNo: number, frameName: string | undefined, fieldNo: number, fieldName: string, fieldType: FieldType}
  export type FieldReference = { [key: string]: number[]}
  

  // export interface ArcList {
  //   nodes?: {
  //     /**
  //      * Define which fields are shown as part of the node arc (colored circle around the node).
  //      */
  //     node?: ArcElement[];
  //   };
  // }

//export type { Options as NodeGraphOptions, ArcOption, ZoomMode } from './panelcfg.gen';



export interface SankeyOptions {
  opacity: number;
  fontsize: number;
  fontcolor: number;
  optSource: string;
  optTarget: string;
  optValue: string;
  nodeColors: NodeColorElement[];
  text: string;
  align: SankeyAlign;
  colorScheme: Color;
  edgeColor: EdgeColor;
  displayValues: DisplayValues;
  isDebug: boolean;
  highlightOnHover: boolean;
  
}
