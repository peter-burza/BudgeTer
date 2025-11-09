import React from 'react'
import {
    Box,
    TextField,
    Select,
    MenuItem,
    InputAdornment
} from '@mui/material'
import { CURRENCIES } from '@/utils/constants'

interface Props {
    typedAmount: number
    handleDisplayZero: (value: number) => string
    handleSetAmount: (value: string) => void
    newTrCurrency: { code: string }
    handleSetCurrency: (value: string) => void
}

export default function InputWithCurrency({
    typedAmount,
    handleDisplayZero,
    handleSetAmount,
    newTrCurrency,
    handleSetCurrency
}: Props) {
    return (
        <Box position="relative" width="100%">
            <TextField
                fullWidth
                type="number"
                variant="outlined"
                label="Amount"
                size="small"
                value={handleDisplayZero(typedAmount)}
                onChange={(e) => handleSetAmount(e.target.value)}
                placeholder="e.g. 4.99"
                sx={{
                    '& .MuiInputBase-root': {
                        paddingRight: '7px',
                        fontSize: '1rem',
                        overflow: 'hidden',
                        color: 'var(--foreground)', // typed amount color
                        backgroundColor: 'transparent',
                        transition: 'border-color 0.3s ease, color 0.3s ease',
                    },
                    '& .MuiOutlinedInput-input': {
                        fontSize: '1rem', // set your desired size here
                        color: 'var(--foreground)', // optional: text color
                    },
                    '& .MuiOutlinedInput-root fieldset': {
                        borderColor: 'var(--foreground)',
                        transition: 'border-color 0.3s ease',
                    },
                    '& .MuiOutlinedInput-root:hover fieldset': {
                        borderColor: 'var(--color-light-blue)',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                        borderColor: 'var(--foreground)',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused:hover fieldset': {
                        borderColor: 'var(--color-light-blue)',
                    },

                    '& .MuiSelect-icon': {
                        color: 'var(--foreground)', // arrow color
                    },

                    // Floating label
                    '& .MuiInputLabel-root': {
                        fontSize: '1rem',
                        color: 'var(--foreground)', // default color
                        transition: 'color 0.3s ease, transform 0.2s ease, font-size 0.2s ease', // important for smooth move
                    },
                    '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                        color: 'var(--foreground)', // also when label shrinks
                    },
                    '&:hover .MuiInputLabel-root.MuiInputLabel-shrink': {
                        color: 'var(--color-light-blue)',
                    },

                    // Input text (number)
                    '& input[type=number]': {
                        MozAppearance: 'textfield',
                        color: 'var(--foreground)',
                    },
                    '& input[type=number]::-webkit-outer-spin-button': {
                        WebkitAppearance: 'none',
                        margin: 0,
                    },
                    '& input[type=number]::-webkit-inner-spin-button': {
                        WebkitAppearance: 'none',
                        margin: 0,
                    },
                }}

                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end" sx={{ p: 0 }}>
                            <Select
                                id="currency_select"
                                value={newTrCurrency.code}
                                onChange={(e) => handleSetCurrency(e.target.value)}
                                variant="standard"
                                disableUnderline
                                sx={{
                                    minWidth: 68,
                                    textAlign: 'right',
                                    '& .MuiSelect-select': {
                                        textAlign: 'right',
                                        pr: 1,
                                        py: 0.5
                                    },
                                }}
                            >
                                {Object.values(CURRENCIES).map((currency) => (
                                    <MenuItem
                                        key={currency.code}
                                        value={currency.code}
                                        title={`${currency.code} - ${currency.name} - ${currency.symbol}`}
                                    >
                                        {currency.code}
                                    </MenuItem>
                                ))}
                            </Select>
                        </InputAdornment>
                    )
                }}
            />
        </Box>
    )
}
