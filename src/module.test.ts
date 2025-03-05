import { PanelPlugin } from '@grafana/data';
import { plugin } from './module';

/*
 Plugin
 */
describe('plugin', () => {
  it('Should be instance of PanelPlugin', () => {
    expect(plugin).toBeInstanceOf(PanelPlugin);
  });

  it('Should add inputs', () => {
    /**
     * Builder
     */
    const builder: any = {
      addFieldNamePicker: jest.fn().mockImplementation(() => builder),
      addSliderInput: jest.fn().mockImplementation(() => builder),
      addColorPicker: jest.fn().mockImplementation(() => builder),
      addCustomEditor: jest.fn().mockImplementation(() => builder),
      addTextInput: jest.fn().mockImplementation(() => builder),
      addSelect: jest.fn().mockImplementation(() => builder),
      addBooleanSwitch: jest.fn().mockImplementation(() => builder),
    };

    /**
     * Supplier
     */
    plugin['optionsSupplier'](builder);

    /**
     * Inputs
     */
    //expect(builder.addSliderInput.addSliderInput.addColorPicker.addCustomEditor.addCustomEditor.addCustomEdito.addTextInputr.addSelect.addSelect.addSelect.addSelect.addBooleanSwitch).toHaveBeenCalled();
    expect(builder.addSliderInput).toHaveBeenCalled();
    expect(builder.addColorPicker).toHaveBeenCalled();
    expect(builder.addCustomEditor).toHaveBeenCalled();
    //expect(builder.addFieldNamePicker).toHaveBeenCalled();
    
    
    //  addSliderInput.addColorPicker.addCustomEditor.addCustomEditor.addCustomEdito.addTextInputr.addSelect.addSelect.addSelect.addSelect.addBooleanSwitch).toHaveBeenCalled();
    
  });
});
