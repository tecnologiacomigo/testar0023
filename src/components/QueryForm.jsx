import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  FormControl,
  CircularProgress,
  InputAdornment,
  Paper,
  Typography,
  Grid,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import SearchIcon from '@mui/icons-material/Search';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function QueryForm({ onSubmit }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateError, setDateError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (startDate && endDate && startDate > endDate) {
      setDateError('Data inicial não pode ser maior que a data final');
      return;
    }
    setDateError('');
    setLoading(true);
    try {
      await onSubmit({ phone, startDate, endDate });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhone(value);
  };

  const formatPhoneDisplay = (value) => {
    if (!value) return '';
    if (value.length <= 2) return value;
    if (value.length <= 7) return `(${value.slice(0,2)}) ${value.slice(2)}`;
    return `(${value.slice(0,2)}) ${value.slice(2,7)}-${value.slice(7)}`;
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WhatsAppIcon color="success" />
          Análise de Conversas
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <TextField
                label="Número do WhatsApp"
                value={formatPhoneDisplay(phone)}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
                disabled={loading}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      +55
                    </InputAdornment>
                  ),
                }}
                helperText="Digite apenas o DDD + número"
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Data Inicial"
              value={startDate}
              onChange={(newValue) => {
                setStartDate(newValue);
                setDateError('');
              }}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: !!dateError
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Data Final"
              value={endDate}
              onChange={(newValue) => {
                setEndDate(newValue);
                setDateError('');
              }}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: !!dateError
                }
              }}
            />
          </Grid>

          {dateError && (
            <Grid item xs={12}>
              <Alert severity="error">{dateError}</Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              disabled={loading || !phone || !startDate || !endDate}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{ 
                height: 48,
                background: loading ? 'grey.400' : 'primary.main',
                '&:hover': {
                  background: 'primary.dark',
                }
              }}
            >
              {loading ? 'Analisando...' : 'Analisar Conversas'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
