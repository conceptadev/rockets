export interface DataSourceInterface {
  driver: {
    transactionSupport: string;
    options: {
      type: string;
    };
  };
}
