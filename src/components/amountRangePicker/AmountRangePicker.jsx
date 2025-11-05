import { InputNumber, Space } from 'antd'

const AmountRangePicker = ({min, max, onChange}) => {

  return (
    <Space className='flex items-center justify-between border xl:p-1 rounded'>
      <InputNumber
        min={0} // Set your desired minimum value
        placeholder='Min Amount'
        value={min}
        onChange={val => onChange([val, max])}
        className='border-0 xl:w-[117px] w-[90px]'
      />
      <span>-</span>
      <InputNumber
        min={0} // Set your desired minimum value
        placeholder='Max Amount'
        value={max}
        onChange={val => onChange([min, val])}
        className='border-0 xl:w-[117px] w-[90px]'
      />
    </Space>
  )
}

export default AmountRangePicker
