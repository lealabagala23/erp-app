import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SalesReport } from '../components/pages/reports/types';
import { Company } from '../components/auth/types';
import toUpper from 'lodash/toUpper';
import dayjs from 'dayjs';
import { formatCurrency } from './auth';
import { Order } from '../components/pages/generate-sales/types';

export const generateSalesReportPDF = (
  report: SalesReport,
  timePeriod: string,
  activeCompany: Company | null,
) => {
  // eslint-disable-next-line
  const doc = new jsPDF() as any;

  // Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(
    `${toUpper(activeCompany?.company_name)} ${toUpper(timePeriod)} SALES REPORT`,
    14,
    20,
  );
  doc.text(
    `${dayjs(report.start_date).format('MMMM D, YYYY')} - ${dayjs(report.end_date).format('MMMM D, YYYY')}`,
    14,
    28,
  );
  doc.text('Report Summary', 14, 44);

  const paymentColumns = [
    { header: 'TOTAL ORDER COUNT', dataKey: 'order_count' },
    { header: 'ITEM CANCELLATIONS', dataKey: 'item_cancellations' },
    { header: 'TOTAL SALES', dataKey: 'total_sales' },
    { header: 'NET SALES', dataKey: 'net_sales' },
  ];

  const paymentRows = [
    {
      order_count: report.order_count,
      item_cancellations: report.cancelled_qty,
      total_sales: formatCurrency(report.total_sales),
      net_sales: formatCurrency(report.net_sales),
    },
  ];

  doc.autoTable({
    columns: paymentColumns,
    body: paymentRows,
    startY: 50,
    theme: 'grid',
    headStyles: { fillColor: [39, 60, 117], halign: 'center', fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      total_sales: { halign: 'right' },
      net_sales: { halign: 'right' },
    },
  });

  doc.text('List of Transactions', 14, 80);

  const columns = [
    { header: 'DATE', dataKey: 'date' },
    { header: 'ACCOUNT NAME', dataKey: 'account_name' },
    { header: 'INVOICE NO.', dataKey: 'invoice_number' },
    { header: 'AMOUNT', dataKey: 'amount' },
    { header: 'DISCOUNT', dataKey: 'discount' },
    { header: 'AMOUNT SALE', dataKey: 'amount_sale' },
  ];

  const rows = report.orders.filter(({ net_total = 0 }: Order) => net_total !== 0).map(
    ({
      created_at,
      invoice_number,
      customer_id,
      sub_total = 0,
      net_total = 0,
    }: Order) => ({
      date: dayjs(created_at).format('MM-DD-YYYY'),
      // eslint-disable-next-line
      account_name: (customer_id as any)?.customer_name || '',
      invoice_number,
      amount: formatCurrency(sub_total),
      discount: formatCurrency(sub_total - net_total),
      amount_sale: formatCurrency(net_total),
    }),
  );

  doc.autoTable({
    columns,
    body: rows,
    startY: 86,
    theme: 'grid',
    headStyles: { fillColor: [39, 60, 117], fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      amount: { halign: 'right' },
      discount: { halign: 'right' },
      amount_sale: { halign: 'right' },
    },
  });

  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};
