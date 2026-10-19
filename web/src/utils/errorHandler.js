import { message } from 'antd';

export const handleApiError = (error, defaultMessage = 'An unexpected error occurred.') => {
  const errorMsg = error.response?.data?.message || defaultMessage;
  message.error(errorMsg);
  return errorMsg;
};