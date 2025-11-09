import * as React from 'react'
import dayjs, { Dayjs } from 'dayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

// interface ResponsiveDatePickerProps {
interface ResponsiveDatePickerProps {
  onChange(value: Dayjs): void
}

const ResponsiveDatePicker: React.FC<ResponsiveDatePickerProps> = ({ onChange }) => {
  const [value, setValue] = React.useState<Dayjs | null>(dayjs())


  // const handleSetDate = (event: SelectChangeEvent<dayjs.Dayjs>) => {
  const handleSetDate = (newValue: Dayjs | null) => {
    setValue(newValue)
    if (newValue !== null) {
      onChange(newValue)
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* <DatePicker label="Uncontrolled picker" defaultValue={dayjs('2022-04-17')} /> */}
      <DatePicker
        label="Controlled picker"
        value={value}
        onChange={handleSetDate}
        slotProps={{
          textField: {
            size: 'small',
            sx: {
              fontSize: '1rem',
              color: 'var(--foreground)',
              backgroundColor: 'transparent',

              // ✅ Input field styling
              '& .MuiPickersOutlinedInput-root': {
                fontSize: '1rem',
                color: 'var(--foreground)',
                backgroundColor: 'transparent',
                transition: 'border-color 0.3s ease, color 0.3s ease',

                // Border (fieldset)
                '& .MuiPickersOutlinedInput-notchedOutline': {
                  borderColor: 'var(--foreground)',
                  transition: 'border-color 0.3s ease',
                },
                '&:hover .MuiPickersOutlinedInput-notchedOutline': {
                  borderColor: 'var(--color-light-blue)',
                },
                '&.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
                  borderColor: 'var(--foreground)',
                },
                // ✅ Hover while focused (needs higher specificity)
                '&.Mui-focused:hover .MuiPickersOutlinedInput-notchedOutline': {
                  borderColor: 'var(--color-light-blue)',
                },
              },

              // ✅ Label (floating text)
              '& .MuiInputLabel-root': {
                fontSize: '1rem',
                color: 'var(--foreground)',
                transition:
                  'color 0.3s ease, transform 0.2s ease, font-size 0.2s ease',
              },
              '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                color: 'var(--foreground)',
              },
              '&:hover .MuiInputLabel-root.MuiInputLabel-shrink': {
                color: 'var(--color-light-blue)',
              },

              // ✅ Calendar icon (svg)
              '& .MuiSvgIcon-root': {
                color: 'var(--foreground)',
                transition: 'color 0.3s ease',
              },

              // ✅ Remove unwanted default spacing
              // '&.MuiFormControl-root, &.MuiTextField-root': {
              //   margin: 0,
              // },
            },
          },
        }}
      />
    </LocalizationProvider>
  )
}

export default ResponsiveDatePicker