import React from 'react';
import SwitchButton from '../../../../../components/SwitchButton/SwitchButton';
import { DualRangeSlider } from '../../../../../components/DualRangeSlider/DualRangeSlider';

function Filter({ dataset, color }: any) {
  const [checked, setChecked] = React.useState(false);

  return (
    <>
      <SwitchButton
        id={dataset.name}
        isOn={checked}
        title={'Filter'}
        handleToggle={() => setChecked(!checked)}
        colorOne={color.hex}
      />
      <DualRangeSlider
        min={0}
        max={100}
        step={25}
        defaultMinValue={25}
        defaultMaxValue={75}
        inactive={checked}
        color={checked && color}
      />
    </>
  );
}

export default Filter;
