import * as React from 'react'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'

interface SelectSmallProps<T extends string | number> {
    inputLabel: string
    menuItems: { label: string; value: T }[]
    value: T
    onChange: (value: T) => void
}

function SelectSmall<T extends string | number>({
    inputLabel,
    menuItems,
    value,
    onChange,
}: SelectSmallProps<T>) {
    const handleChange = (event: SelectChangeEvent<T>) => {
        const selectedValue = event.target.value as T
        onChange(selectedValue)
    }

    return (
        <FormControl sx={{
            minWidth: 120,
            '&:hover .MuiInputLabel-root.MuiInputLabel-shrink': {
                color: 'var(--color-light-blue)',
            },
        }} size="small">
            <InputLabel
                id={`${inputLabel}-label`}
                sx={{
                    fontSize: '1rem',
                    color: 'var(--foreground)',
                    transition: 'color 0.3s ease, transform 0.2s ease, font-size 0.2s ease',
                    '&.Mui-focused': {
                        color: 'var(--foreground)',
                    }
                }}
            >
                {inputLabel}
            </InputLabel>
            <Select<T>
                labelId={`${inputLabel}-label`}
                id={`${inputLabel}-select`}
                value={value}
                label={inputLabel}
                onChange={handleChange}
                size="small"
                sx={{
                    fontSize: '1rem',
                    color: 'var(--foreground)',
                    '& .MuiSelect-select': {
                        fontSize: '1rem',
                        textAlign: 'left',
                    },
                    '& .MuiSelect-icon': {
                        color: 'var(--foreground)',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--foreground)',
                        transition: 'border-color 0.3s ease',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--color-light-blue)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--foreground)',
                    },
                    '&.Mui-focused:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--color-light-blue)',
                    },
                }}
            >
                {menuItems.map((item) => (
                    <MenuItem key={String(item.value)} value={item.value} sx={{ fontSize: '1rem' }}>
                        {item.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}

export default SelectSmall