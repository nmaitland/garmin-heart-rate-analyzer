module.exports = {
  LocalizationProvider: ({ children }) => children,
  DatePicker: ({ onChange, label, value, ...props }) => {
    const React = require('react');
    // Filter out MUI-specific props that shouldn't be passed to DOM elements
    const { slotProps, slots, format, ...validProps } = props;
    return React.createElement('input', {
      'data-testid': `date-picker-${label?.toLowerCase?.()?.replace(' ', '-') || 'date-picker'}`,
      onChange: (e) => onChange && onChange(new Date(e.target.value)),
      value: value ? value.toISOString().split('T')[0] : '',
      ...validProps
    });
  },
  MobileDatePicker: ({ onChange, label, value, ...props }) => {
    const React = require('react');
    // Filter out MUI-specific props that shouldn't be passed to DOM elements
    const { slotProps, slots, format, ...validProps } = props;
    return React.createElement('input', {
      'data-testid': `date-picker-${label?.toLowerCase?.()?.replace(' ', '-') || 'date-picker'}`,
      onChange: (e) => onChange && onChange(new Date(e.target.value)),
      value: value ? value.toISOString().split('T')[0] : '',
      ...validProps
    });
  }
};