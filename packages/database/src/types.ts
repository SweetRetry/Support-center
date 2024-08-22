export interface ResponseData<T = any> {
  data: T;
  code: number;
  message: string;
}
