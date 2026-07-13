export interface ItemResponseDto {
  id: string;
  tenantCode: string;
  departmentCode?: string;
  name: string;
  version: number;
  editable: boolean;
}
