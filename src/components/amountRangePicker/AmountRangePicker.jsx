import { InputNumber, Space } from 'antd'

const AmountRangePicker = ({min, max, onChange}) => {

  return (
    <Space className='border p-3 rounded'>
      <InputNumber
        min={0} // Set your desired minimum value
        placeholder='Min Amount'
        value={min}
        onChange={val => onChange([val, max])}
        className='border-0 w-[117px]'
      />
      <span>-</span>
      <InputNumber
        min={0} // Set your desired minimum value
        placeholder='Max Amount'
        value={max}
        onChange={val => onChange([min, val])}
        className='border-0 w-[117px]'
      />
    </Space>
  )
}

export default AmountRangePicker
