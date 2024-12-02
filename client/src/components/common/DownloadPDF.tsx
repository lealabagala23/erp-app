import { DownloadOutlined } from '@mui/icons-material';
import { Button } from '@mui/material';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import { snakeCase } from 'lodash';
import React from 'react';
import 'jspdf-autotable';

interface IProps {
  // eslint-disable-next-line
  data: any[];
  columns: string[];
  title: string;
}

export default function DownloadPDF({ data, columns, title }: IProps) {
  const handleDownload = () => {
    const doc = new jsPDF({
      putOnlyUsedFonts: true,
      orientation: 'landscape',
      // eslint-disable-next-line
    }) as any;
    const startY = 25;
    doc.text(`${title} (${dayjs().format('MM-DD-YYYY')})`, 15, startY);

    const margin = { top: 20 + 10, left: 15, right: 15, bottom: 20 };

    doc.autoTable({
      head: [columns],
      body: data.map((obj) => {
        // eslint-disable-next-line
        const { _id, barcode, __v, created_at, ...rest } = obj;
        console.log('created_at', created_at);
        const allData = Object.values({
          ...rest,
          created_at: dayjs(created_at).format('MM/DD/YYYY'),
        });
        console.log('daaasdf', allData);
        return allData;
      }),
      margin, // Define margins
      theme: 'grid', // Optional: "striped", "grid", or "plain"
      tableWidth: 'auto', // Dynamically adjusts table width
      styles: {
        fontSize: 10,
      },
      columnStyles: {
        // Adjust specific columns (optional)
        0: { cellWidth: 'auto' }, // Fixed width for the first column (ID)
        1: { cellWidth: 'auto' }, // Auto-scale the "Description" column
        2: { cellWidth: 'auto' }, // Auto-scale the "Description" column
      },
    });
    doc.save(`${dayjs().format('MM-DD-YYYY')}-${snakeCase(title)}.pdf`);
  };

  return (
    <Button
      size="small"
      startIcon={<DownloadOutlined />}
      variant="outlined"
      onClick={handleDownload}
    >
      Download PDF
    </Button>
  );
}
