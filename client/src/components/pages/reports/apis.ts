import axiosConfig from '../../../utils/axiosConfig';

const REPORTS_API = '/api/reports';

export const fetchSalesReports = async ({
  time_period,
  start_date,
  end_date,
  company_id,
}: {
  time_period: string;
  start_date: string;
  end_date: string;
  company_id: string;
}) => {
    const response = await axiosConfig.get(
      `${REPORTS_API}/${time_period}`,
      { params: { start_date, end_date, company_id } }
    );
    return response?.data;
};
