export type ModalState = {
  key: string;
  title: string;
  percent: number;
  message?: string;
  status: 'active' | 'error' | 'complete';
}