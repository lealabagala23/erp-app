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
        const {
          product_name,
          product_description,
          product_unit,
          generic_name,
          purchase_price,
          unit_price,
          created_at,
        } = obj;
        const allData = Object.values({
          product_name,
          product_description,
          product_unit,
          generic_name,
          purchase_price,
          unit_price,
          created_at: dayjs(created_at).format('MM/DD/YYYY'),
        });
        return allData;
      }),
      margin,
      theme: 'grid',
      tableWidth: 'auto',
      styles: {
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' },
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
