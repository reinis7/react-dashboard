import { StoreNoticeType } from '__generated__/__types__';
import * as yup from 'yup';

const typeArr = [
  StoreNoticeType.AllShop.toLocaleLowerCase(),
  StoreNoticeType.AllVendor.toLocaleLowerCase(),
];

export const storeNoticeValidationSchema = yup.object().shape({
  priority: yup.object().nullable().required('form:error-priority-required'),
  notice: yup.string().required('form:error-notice-title-required'),
  description: yup.string().required('form:error-notice-description-required'),
  effective_from: yup.date().required('form:error-active-date-required'),
  expired_at: yup
    .date()
    .required('form:error-expire-date-required')
    .when('effective_from', (effective_from, schema) => {
      if (effective_from) {
        const dayAfter = new Date(effective_from.getTime() + 86400000);

        return schema.min(dayAfter, 'End date has to be after than start date');
      }

      return schema;
    }),
  received_by: yup.array().when('type', (type, schema) => {
    if ((type && !typeArr.includes(type.value)) || schema.min() === 0) {
      return yup
        .array()
        .min(1, 'form:error-received-by-required')
        .typeError('form:error-received-by-required');
    }
    return yup.array().notRequired();
  }),
});
