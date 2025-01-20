import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  CompanyBankDetails,
  Order,
} from '../components/pages/generate-sales/types';
import { toUpper } from 'lodash';
import dayjs from 'dayjs';
import { Inventory, Product } from '../components/pages/inventory/types';
import { formatCurrency } from './auth';
import { UserInfo } from '../components/auth/types';

export const generateBillingPDF = (
  order: Order & CompanyBankDetails,
  userInfo: UserInfo | null,
) => {
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

  // eslint-disable-next-line
  let billingRows: any[] = [];

  order.orders.forEach((o) => {
    const newRows = o.order_items?.map((oItem, idx) => {
      const { quantity = 0 } = oItem;
      const {
        product_name,
        product_description,
        product_unit,
        unit_price = 0,
      } = (oItem.product_id || {}) as Product;
      const { batch_number, expiry_date } = (oItem.inventory_id ||
        {}) as Inventory;
      return {
        sales_invoice_no:
          idx === 0
            ? `${o.invoice_number || ''}\n\n${dayjs(o.created_at).format('MM-DD-YYYY')}`
            : '',
        description: `${product_name} ${product_description} (${oItem.quantity} ${product_unit})\n\n
           B No.: ${batch_number || ''}\n
           Exp Date: ${dayjs(expiry_date).format('MM-DD-YYYY')}
        `,
        unit_price: formatCurrency(unit_price),
        amount: formatCurrency(unit_price * quantity),
        amountInt: unit_price * quantity,
      };
    });
    // eslint-disable-next-line
    billingRows = [...billingRows, ...(newRows as any[])];
  });

  billingRows.push({
    sales_invoice_number: '',
    description: '',
    unit_price: 'Grand Total',
    amount: formatCurrency(
      billingRows.reduce((accum, { amountInt }) => accum + amountInt, 0) || 0,
    ),
  });

  doc.autoTable({
    columns,
    body: billingRows,
    startY: 90,
    theme: 'grid',
    headStyles: { fillColor: [39, 60, 117], fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      sales_invoice_no: { halign: 'center' },
      description: { cellWidth: 100 },
      unit_price: { halign: 'right' },
      amount: { halign: 'right' },
    },
    // eslint-disable-next-line
    didParseCell: (data: any) => {
      if (data.row.index === billingRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  const finalY = doc.lastAutoTable.finalY;
  doc.text(
    `Prepared By:\n${userInfo?.first_name} ${userInfo?.last_name}`,
    14,
    finalY + 24,
  );

  doc.text(
    `Concurred By:\nLuigi Hendersen Te`,
    pageWidth - 100,
    finalY + 24,
  );

  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};
