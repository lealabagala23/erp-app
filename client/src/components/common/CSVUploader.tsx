import React, { useState } from 'react';
import Papa from 'papaparse';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FETCH_PRODUCTS_QUERY_KEY } from '../pages/inventory/constants';
import {
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { CloseRounded, Upload } from '@mui/icons-material';

interface IProps {
  open: boolean;
  handleClose: (b: boolean) => void;
  // eslint-disable-next-line
  uploadAPI: (payload: any) => Promise<any>;
}

const CSVUploader = ({ open, handleClose, uploadAPI }: IProps) => {
  const queryClient = useQueryClient();
  const [csvData, setCsvData] = useState(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const { mutateAsync: mutateUploadCSV, isLoading } = useMutation({
    mutationFn: uploadAPI,
    onSuccess: () => {
      queryClient.invalidateQueries([FETCH_PRODUCTS_QUERY_KEY]);
    },
  });

  const handleFileChange = (e: { target: { files: FileList | null } }) => {
    if (e.target.files === null) return;
    const file = e.target.files[0];

    if (file) {
      setFileName(file.name);
      Papa.parse(file, {
        header: true, // Converts rows to JSON objects
        // eslint-disable-next-line
        complete: (result: any) => {
          setCsvData(result.data); // Parsed data
        },
        skipEmptyLines: true,
      });
    }
  };

  const handleUpload = async () => {
    if (!csvData) {
      alert('No data to upload');
      return;
    }

    // Send data to the server
    await mutateUploadCSV(csvData);
    handleClose(true);
    clearInput();
  };

  const clearInput = () => {
    setFileName(null);
    setCsvData(null);
    const elem = document.getElementById('upload-csv-input');
    if (elem) {
      // eslint-disable-next-line
      (elem as any).value = null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle id="alert-dialog-title">Upload CSV File</DialogTitle>
      <DialogContent sx={{ width: '500px' }}>
        <Card>
          <Typography variant="body1" marginBottom={2}>
            Choose file you want to upload
          </Typography>

          <Stack direction={'row'} gap={2} alignItems={'center'}>
            <Button variant="outlined" component="label">
              Select File
              <input
                id="upload-csv-input"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                hidden
              />
            </Button>
            {fileName && (
              <>
                <Typography variant="body2">{fileName}</Typography>
                <IconButton
                  sx={{ border: 0, width: '15px', height: '15px' }}
                  onClick={() => clearInput()}
                >
                  <CloseRounded />
                </IconButton>
              </>
            )}
          </Stack>
        </Card>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={handleUpload}
          startIcon={
            isLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Upload />
            )
          }
        >
          {isLoading ? 'Uploading...' : 'Upload CSV'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CSVUploader;
