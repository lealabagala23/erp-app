import { PDFDocument, PDFFont, PDFPage, rgb } from 'pdf-lib';
import * as fontkit from 'fontkit'; // Import FontKit
import { Fontkit } from 'pdf-lib/cjs/types/fontkit';
import { Order } from '../components/pages/generate-sales/types';
import dayjs from 'dayjs';
import { Product } from '../components/pages/inventory/types';
import { formatCurrency } from './auth';

function truncateStringSafe(str: string, maxLength: number): string {
  if (maxLength <= 3) {
    return str.length > 0 ? '...' : '';
  }
  return str.length <= maxLength ? str : str.slice(0, maxLength - 3) + '...';
}

const drawPaymentType = (
  firstPage: PDFPage,
  customFont: PDFFont,
  order: Order,
) => {
  const { height } = firstPage.getSize();
  const text: string = '✓';
  firstPage.drawText(text, {
    x: 52,
    y: height - (order?.payment_type === 'cash' ? 234 : 250),
    size: 14,
    font: customFont,
    color: rgb(0, 0, 0),
  });
};

const drawInvoiceNumber = (
  firstPage: PDFPage,
  customFont: PDFFont,
  order: Order,
) => {
  const { height } = firstPage.getSize();
  const text: string = `${order?.invoice_number || ''}`;
  firstPage.drawText(text, {
    x: 390,
    y: height - 210,
    size: 10,
    font: customFont,
    color: rgb(0, 0, 0),
  });
};

const drawDate = (firstPage: PDFPage, customFont: PDFFont, order: Order) => {
  const { height } = firstPage.getSize();
  const text: string = `${dayjs(order?.created_at || '').format('MMMM d, YYYY')}`;
  firstPage.drawText(text, {
    x: 380,
    y: height - 242,
    size: 10,
    font: customFont,
    color: rgb(0, 0, 0),
  });
};

const drawNameTinAddress = (
  firstPage: PDFPage,
  customFont: PDFFont,
  order: Order,
) => {
  const { height } = firstPage.getSize();
  const { customer_id, tin, billing_address } = order;

  const texts: string[] = [
    // eslint-disable-next-line
    (customer_id as any)?.customer_name,
    tin,
    billing_address,
  ];

  texts.forEach((text, key) =>
    firstPage.drawText(text, {
      x: 135,
      y: height - (288 + 23 * key),
      size: 10,
      font: customFont,
      color: rgb(0, 0, 0),
    }),
  );
};

const drawOrderItems = (
  firstPage: PDFPage,
  customFont: PDFFont,
  order: Order,
) => {
  const { width, height } = firstPage.getSize();
  const { order_items } = order;

  (order_items || []).forEach((item, key) => {
    const { product_id, quantity, unit_price, total_price } = item;
    const { product_name, product_description, product_unit } =
      product_id as Product;
    const texts = [
      truncateStringSafe(
        `${product_name} ${product_description} ${product_unit}`,
        55,
      ),
      `${quantity}`,
      formatCurrency(unit_price),
      formatCurrency(total_price),
    ];
    const getXAddend = (key: number, text: string) => {
      switch (key) {
        case 0:
          return 0;
        case 1:
          return 272;
        case 2:
          return width - 250 + (10 - text.length) * 4;
        default:
          return width - 150 + (10 - text.length) * 4;
      }
    };

    texts.forEach((text, key2) =>
      firstPage.drawText(text, {
        x: 42 + getXAddend(key2 as number, text),
        y: height - (380 + 18 * key),
        size: 8,
        font: customFont,
        color: rgb(0, 0, 0),
      }),
    );
  });
};

const drawTotalSales = (
  firstPage: PDFPage,
  customFont: PDFFont,
  order: Order,
) => {
  const { width, height } = firstPage.getSize();
  const { order_items, total_amount = 0 } = order;
  const total = (order_items || []).reduce(
    (accum, item) => item.total_price + accum,
    0,
  );
  const totalSales: string = `${formatCurrency(total)}`;
   
  const lessDiscount = `${formatCurrency(total_amount - total)}`;

  const texts = [totalSales, lessDiscount, formatCurrency(total_amount || 0)];
  texts.forEach((text, key2) =>
    firstPage.drawText(text, {
      x: 42 + (width - 160 + (10 - text.length) * 6),
      y: height - 555 - key2 * 57,
      size: 10,
      font: customFont,
      color: rgb(0, 0, 0),
    }),
  );
};

const drawSCDetails = (
  firstPage: PDFPage,
  customFont: PDFFont,
  order: Order,
) => {
  const { width, height } = firstPage.getSize();
  const { customer_id } = order;
  // eslint-disable-next-line
  const text: string = `${(customer_id as any)?.customer_details?.discount_card_number || ''}`;

  firstPage.drawText(text, {
    x: 42 + (width - 160 + (10 - text.length) * 6),
    y: height - 707,
    size: 10,
    font: customFont,
    color: rgb(0, 0, 0),
  });
};

const drawInitiator = (
    firstPage: PDFPage,
    customFont: PDFFont,
    order: Order,
  ) => {
    const { height } = firstPage.getSize();
    const { initiator_id } = order;
    // eslint-disable-next-line
    const text: string = `${(initiator_id as any)?.first_name} ${(initiator_id as any)?.last_name}`;
  
    firstPage.drawText(text, {
      x: 75 ,
      y: height - 715,
      size: 10,
      font: customFont,
      color: rgb(0, 0, 0),
    });
  };

export const modifyPdf = async (
  input: RequestInfo | URL,
  order: Order,
): Promise<void> => {
  try {
    const existingPdfBytes: ArrayBuffer = await fetch(input).then((res) =>
      res.arrayBuffer(),
    );

    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const fontKitInstance = fontkit;
    pdfDoc.registerFontkit(fontKitInstance as unknown as Fontkit);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const fontBytes = await fetch('/fonts/DejaVuSans.ttf').then((res) =>
      res.arrayBuffer(),
    );
    const customFont = await pdfDoc.embedFont(fontBytes);

    drawPaymentType(firstPage, customFont, order);
    drawInvoiceNumber(firstPage, customFont, order);
    drawDate(firstPage, customFont, order);
    drawNameTinAddress(firstPage, customFont, order);
    drawOrderItems(firstPage, customFont, order);
    drawTotalSales(firstPage, customFont, order);
    drawSCDetails(firstPage, customFont, order);
    drawInitiator(firstPage, customFont, order)

    const pdfBytes: Uint8Array = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    // eslint-disable-next-line
    link.download = `Invoice-${order.invoice_number || ''}-${(order.customer_id as any)?.customer_name}.pdf`;
    link.click();
  } catch (error) {
    console.error('Error modifying the PDF:', error);
  }
};
