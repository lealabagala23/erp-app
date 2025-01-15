import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  CompanyBankDetails,
  Order,
} from '../components/pages/generate-sales/types';
import { toUpper } from 'lodash';
import dayjs from 'dayjs';

export const generateBillingPDF = (order: Order & CompanyBankDetails) => {
  // eslint-disable-next-line
  const doc = new jsPDF() as any;
  const accountName = toUpper(order.bank_account_name);

  // Set the x-coordinate to the right edge of the page
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(accountName, 14, 20);
  doc.text('BILLING STATEMENT', pageWidth - 20, 20, { align: 'right' });

  doc.setFontSize(12);
  doc.text('Make all checks payable to', 14, 32);
  doc.text(accountName, 14, 38);
  doc.text(order.bank_name, 14, 50);
  doc.text(`Account Name: ${accountName}`, 14, 56);
  doc.text(`Account No: ${order.bank_account_number}`, 14, 62);

  doc.setFont('Helvetica', 'normal');
  doc.text(`To: ${toUpper(order.customer_name)}`, pageWidth - 20, 32, {
    align: 'right',
  });
  const multilineAddress = doc.splitTextToSize(
    toUpper(order.billing_address),
    70,
  );
  doc.text(multilineAddress || '', pageWidth - 20, 50, { align: 'right' });

  const paymentColumns = [
    { header: 'SALESPERSON', dataKey: 'salesperson' },
    { header: 'PAYMENT TERMS', dataKey: 'payment_terms' },
    { header: 'DUE DATE', dataKey: 'due_date' },
  ];

  const paymentRows = [
    {
      salesperson: 'LUIGI HENDERSEN TE',
      payment_terms: '30',
      due_date: dayjs(order.min_created_at).format('MM-DD-YYYY'),
    },
  ];

  doc.autoTable({
    columns: paymentColumns,
    body: paymentRows,
    startY: 70,
    theme: 'grid',
    headStyles: { fillColor: [39, 60, 117], halign: 'center', fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'center' },
      2: { halign: 'center' },
    },
  });

  const columns = [
    { header: 'SALES INVOICE NO.', dataKey: 'sales_invoice_no' },
    { header: 'DESCRIPTION', dataKey: 'description' },
    { header: 'UNIT PRICE', dataKey: 'unit_price' },
    { header: 'AMOUNT', dataKey: 'amount' },
  ];

  const rows = [
    {
      sales_invoice_no: '0342',
      description: '6 Vials Paclitaxel',
      unit_price: '12,000',
      amount: '12,000',
    },
  ];

  doc.autoTable({
    columns,
    body: rows,
    startY: 90,
    theme: 'grid',
    headStyles: { fillColor: [39, 60, 117], fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
    //   sales_invoice_no: { cellWidth: 30 },
      description: { cellWidth: 100 },
    //   unit_price: { cellWidth: 70 },
    //   amount: { cellWidth: 30 },
    },
  });

  // Convert the PDF to a Blob
  const pdfBlob = doc.output('blob');

  // Create a URL for the Blob and open it in a new tab
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};
