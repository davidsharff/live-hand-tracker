import React from 'react';

import Typography from '@material-ui/core/Typography/Typography';
import { useTheme } from '@material-ui/styles';


export const MainHeader = ({ children, style }) => (
  <Typography variant="h5" style={{ fontWeight: 300, color: useTheme().palette.text.secondary, ...style }}>
    { children }
  </Typography>
);

export const SubHeader = ({ children, style }) => (
  <Typography variant="h6" style={{ color: useTheme().palette.text.secondary, ...style}}>
    { children }
  </Typography>
);

export const Subtitle = ({ children, style }) => (
  <Typography variant="subtitle1" style={{ color: useTheme().palette.text.secondary, ...style}}>
    { children }
  </Typography>
);

