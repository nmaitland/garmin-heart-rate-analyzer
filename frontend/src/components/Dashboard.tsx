import React, { useState, useEffect, useCallback } from 'react';
import { Container, Grid, Paper, Typography, TextField, Box, Button, Alert, CircularProgress } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import HeartRateChart from './HeartRateChart.tsx';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface HeartRateData {
  timestamp: string;
  heartRate: number;
}

const Dashboard: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [heartRateData, setHeartRateData] = useState<HeartRateData[]>([]);
  const [averageHeartRate, setAverageHeartRate] = useState<number>(0);
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchHeartRateData = useCallback(async () => {
    if (!startDate || !endDate || !userId) return;

    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `${API_BASE_URL}/heart-rate/${userId}`,
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        }
      );
      setHeartRateData(response.data);

      const avgResponse = await axios.get(
        `${API_BASE_URL}/heart-rate/${userId}/average`,
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        }
      );
      setAverageHeartRate(avgResponse.data);
      setMessage('Heart rate data fetched successfully!');
    } catch (error) {
      console.error('Error fetching heart rate data:', error);
      setError('Failed to fetch heart rate data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, userId]);

  const handleSyncGarminData = async () => {
    console.log('🔄 Sync button clicked!');
    console.log('📅 Form data:', { userId, startDate, endDate });

    if (!startDate || !endDate || !userId) {
      const errorMsg = 'Please fill in all fields before syncing data.';
      console.log('❌ Validation failed:', errorMsg);
      setError(errorMsg);
      return;
    }

    console.log('✅ Validation passed, starting sync...');
    setSyncing(true);
    setError('');
    setMessage('');

    const requestData = {
      userId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
    
    console.log('📤 Sending request to:', `${API_BASE_URL}/garmin/sync`);
    console.log('📋 Request data:', requestData);

    try {
      const response = await axios.post(`${API_BASE_URL}/garmin/sync`, requestData);
      console.log('✅ Sync request successful!');
      console.log('📥 Response:', response.data);
      setMessage('Garmin data synced successfully! You can now fetch the updated data.');
    } catch (error: any) {
      console.error('❌ Sync request failed:');
      console.error('Error details:', error);
      console.error('Response data:', error?.response?.data);
      console.error('Status code:', error?.response?.status);
      setError(`Failed to sync Garmin data: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
    } finally {
      console.log('🏁 Sync request completed, resetting loading state');
      setSyncing(false);
    }
  };

  const handleFetchData = () => {
    setMessage('');
    fetchHeartRateData();
  };

  useEffect(() => {
    fetchHeartRateData();
  }, [fetchHeartRateData]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}> {/* Revert back to AdapterDateFns */}
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Garmin Heart Rate Analyzer
          </Typography>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                onClick={handleFetchData}
                disabled={loading || !userId}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Fetching...' : 'Fetch Heart Rate Data'}
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleSyncGarminData}
                disabled={syncing || !userId}
                startIcon={syncing ? <CircularProgress size={20} /> : null}
              >
                {syncing ? 'Syncing...' : 'Sync from Garmin'}
              </Button>
            </Box>
          </Paper>

          {message && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Average Heart Rate: {averageHeartRate.toFixed(1)} bpm
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <HeartRateChart data={heartRateData} />
          </Paper>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default Dashboard;