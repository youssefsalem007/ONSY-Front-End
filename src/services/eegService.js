import axiosInstance from '../utils/axiosInstance';

/**
 * Downsamples an Emotiv INSIGHT2 CSV file in memory to prevent Vercel 4.5MB payload limit
 * and serverless function timeouts (10s) while preserving mathematical integrity of metrics.
 */
async function downsampleCsv(file) {
  try {
    const text = await file.text();
    const lines = text.split(/\r?\n/);
    
    // Find the header index (starts with Timestamp)
    const headerIndex = lines.findIndex(line => /^Timestamp,/i.test(line.trim()));
    if (headerIndex === -1) {
      return file; // If invalid header, let the backend validate it
    }
    
    const metadataLines = lines.slice(0, headerIndex);
    const headerLine = lines[headerIndex];
    const dataLines = lines.slice(headerIndex + 1).filter(line => line.trim().length > 0);
    
    const headers = headerLine.split(',').map(h => h.trim());
    
    // Identify indices of metrics we want to forward-fill
    // These include PM.*, Focus, Engagement, Excitement, Stress, Relaxation, Interest, etc.
    const metricIndices = [];
    headers.forEach((header, index) => {
      const lower = header.toLowerCase();
      if (
        lower.startsWith('pm.') ||
        lower.includes('attention') ||
        lower.includes('focus') ||
        lower.includes('engagement') ||
        lower.includes('excitement') ||
        lower.includes('stress') ||
        lower.includes('relaxation') ||
        lower.includes('interest')
      ) {
        metricIndices.push(index);
      }
    });
    
    const totalDataRows = dataLines.length;
    const maxRows = 1200; // Under 1200 rows ensures sub-second DB inserts and ultra-fast upload
    
    // First pass: forward fill the metric values across all rows in the original data
    const lastKnownMetrics = {};
    const filledDataLines = [];
    
    for (let i = 0; i < totalDataRows; i++) {
      const cols = dataLines[i].split(',');
      
      // Update cached metrics if present in the current row
      metricIndices.forEach(idx => {
        if (cols[idx] !== undefined && cols[idx].trim() !== '') {
          lastKnownMetrics[idx] = cols[idx].trim();
        }
      });
      
      // Fill empty fields with last known value
      metricIndices.forEach(idx => {
        if ((cols[idx] === undefined || cols[idx].trim() === '') && lastKnownMetrics[idx] !== undefined) {
          cols[idx] = lastKnownMetrics[idx];
        }
      });
      
      filledDataLines.push(cols.join(','));
    }
    
    // If the file is small enough, return it with forward-filled values
    if (totalDataRows <= maxRows) {
      const newContent = [
        ...metadataLines,
        headerLine,
        ...filledDataLines
      ].join('\n');
      return new File([newContent], file.name, { type: file.type });
    }
    
    // Downsample the forward-filled data
    const step = Math.ceil(totalDataRows / maxRows);
    const downsampledData = [];
    
    for (let i = 0; i < totalDataRows; i += step) {
      downsampledData.push(filledDataLines[i]);
    }
    
    // Reconstruct the CSV
    const newContent = [
      ...metadataLines,
      headerLine,
      ...downsampledData
    ].join('\n');
    
    console.log(`[EEG Downsampler] Smart-reduced ${file.name} from ${totalDataRows} rows to ${downsampledData.length} rows (PM metrics preserved).`);
    return new File([newContent], file.name, { type: file.type });
  } catch (err) {
    console.warn('[EEG Downsampler] Failed to downsample CSV, uploading original. Error:', err);
    return file;
  }
}

export const eegService = {
  async getLatestAnalysis() {
    try {
      const response = await axiosInstance.get('/analysis/latest');
      return response.data;
    } catch (error) {
      console.error("Error getting latest EEG analysis:", error);
      throw error;
    }
  },

  async uploadEegData(file) {
    try {
      // Process the file to downsample it if it's too large
      const processedFile = await downsampleCsv(file);
      
      const formData = new FormData();
      formData.append('file', processedFile);
      
      const response = await axiosInstance.post('/eeg/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading EEG data:", error);
      throw error;
    }
  }
};
