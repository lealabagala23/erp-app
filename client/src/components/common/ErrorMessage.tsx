import React from 'react';
import { FieldError } from 'react-hook-form';

type IProps = {
  error?: FieldError;
};

const ErrorMessage = ({ error }: IProps) => {
  return <>{error?.message || null}</>;
};

export default ErrorMessage;
