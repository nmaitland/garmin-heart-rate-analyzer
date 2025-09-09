import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import React from 'react';


// Create a theme instance
const theme = createTheme();

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver for Recharts
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
});

// Custom render function with MUI providers
const customRender = (ui, options) => {
  const Wrapper = ({ children }) => (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...(options || {}) });
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render }; 