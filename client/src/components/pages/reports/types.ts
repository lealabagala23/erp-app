export type GetSalesReportsResponse = {
  startDate: string;
  endDate: string;
  data: {
    id: number;
    date: string;
    totalSales: number;
    transactions: number;
    averageOrderValue: number;
    salesGrowth: number;
    returns: number;
    netSales: number;
  }[];
};
