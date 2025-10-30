import * as React from 'react'
import dayjs from 'dayjs'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

interface ResponsiveDatePickerProps {
  setTransactionDate: (date: dayjs.Dayjs) => void
}

export default function ResponsiveDatePicker({
  setTransactionDate
}: ResponsiveDatePickerProps) {
  const [value, setValue] = React.useState<dayjs.Dayjs | null>(
    dayjs(new Date())
  )

  const handleChange = (newValue: dayjs.Dayjs | null) => {
    setValue(newValue)
    if (newValue !== null) setTransactionDate(newValue)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={value}
        onChange={handleChange}
        sx={{
          width: '100%',
          '& .MuiPickersOutlinedInput-root': {
            bgcolor: 'var(--foreground)',
            color: 'var(--background)',
            borderRadius: '0.2rem',
            fontSize: '0.9rem',
            boxShadow: '0 0 1.5px 1px white',
            transitionDuration: '200ms',
            '& fieldset': {
              borderColor: 'transparent !important'
            },
            '&:hover': {
              boxShadow: 'unset',
              '& fieldset': {
                borderColor: 'transparent !important'
              }
            },
            '&.Mui-focused': {
              boxShadow: 'unset',
              '& fieldset': {
                borderColor: 'transparent !important'
              }
            }
          },
          '& .MuiPickersSectionList-root': {
            paddingY: '0.6rem'
          }
        }}
      />
    </LocalizationProvider>
  )
}
