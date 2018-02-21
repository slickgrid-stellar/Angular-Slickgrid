import { Column, Formatter } from './../models/index';
import { TranslateService } from '@ngx-translate/core';

export const translateFormatter: Formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any) => {
  const params = columnDef.params || {};
  if (!params.i18n || !(params.i18n instanceof TranslateService)) {
    throw new Error(`The translate formatter requires the ngx-translate "TranslateService" to be provided as a column params.
    For example: this.columnDefinitions = [{ id: title, field: title, formatter: Formatters.translate, params: { i18n: this.translateService }`);
  }

  // make sure the value is a string (for example a boolean value would throw an error)
  if (typeof value !== 'string') {
    value = value + '';
  }

  return value ? params.i18n.instant(value) : '';
};
