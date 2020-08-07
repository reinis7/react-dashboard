import Input from '@/components/ui/input';
import { Controller, useForm } from 'react-hook-form';
import { DatePicker } from '@/components/ui/date-picker';
import Button from '@/components/ui/button';
import TextArea from '@/components/ui/text-area';
import {
  useCreateStoreNoticeMutation,
  useUpdateStoreNoticeMutation,
  useStoreNoticeReceiverQuery,
} from '@/graphql/store-notice.graphql';
import { getErrorMessage } from '@/utils/form-error';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import Label from '@/components/ui/label';
import Router, { useRouter } from 'next/router';
import ValidationError from '@/components/ui/form-validation-error';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import SelectInput from '@/components/ui/select-input';
import { yupResolver } from '@hookform/resolvers/yup';
import { storeNoticeValidationSchema } from './store-notice-validation-schema';
import { StoreNotice, StoreNoticeType } from '__generated__/__types__';
import { Routes } from '@/config/routes';
import { Config } from '@/config';
import { getAuthCredentials } from '@/utils/auth-utils';
import NoticeReceivedByInput from './store-notice-received-input';
import { find } from 'lodash';

type user = {
  id: number;
  name: string;
};
type shop = {
  id: number;
  name: string;
};
type FormValues = {
  priority: { name: string; value: string };
  notice: string;
  description: string;
  effective_from: string;
  expired_at: string;
  type: { name: string; value: string };
  received_by: user[] | shop[];
};

const priorityType = [
  { name: 'High', value: 'high' },
  { name: 'Medium', value: 'medium' },
  { name: 'Low', value: 'low' },
];

type IProps = {
  initialValues?: StoreNotice | null;
};
export default function CreateOrUpdateStoreNoticeForm({
  initialValues,
}: IProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { permissions } = getAuthCredentials();

  let noticeTypes: any = [];
  let superAdmin = permissions?.includes('super_admin');
  const noticeReceived =
    initialValues?.shops || initialValues?.users
      ? //@ts-ignore
        initialValues?.shops.concat(initialValues?.users)
      : [];

  if (superAdmin) {
    noticeTypes = [
      { name: 'All Vendor', value: 'all_vendor' },
      { name: 'Specific Vendor', value: 'specific_vendor' },
    ];
  } else {
    noticeTypes = [
      { name: 'All Shop', value: 'all_shop' },
      { name: 'Specific Shop', value: 'specific_shop' },
    ];
  }

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    // @ts-ignore
    defaultValues: initialValues
      ? {
          ...initialValues,
          effective_from: new Date(initialValues.effective_from!),
          expired_at: new Date(initialValues.expired_at!),
          priority: initialValues?.priority
            ? priorityType?.find(
                (priority) => priority.value === initialValues?.priority!
              )
            : { name: '', value: '' },
          type: initialValues?.type
            ? noticeTypes &&
              noticeTypes?.find(
                (type: any) => type.value === initialValues.type!
              )
            : { name: '', value: '' },
          received_by: noticeReceived ? noticeReceived : [],
        }
      : {
          priority: priorityType[0],
        },
    resolver: yupResolver(storeNoticeValidationSchema),
  });

  const [createStoreNotice, { loading: creating }] =
    useCreateStoreNoticeMutation();
  const [updateStoreNotice, { loading: updating }] =
    useUpdateStoreNoticeMutation();

  const noticeType = watch('type');
  const { data } = useStoreNoticeReceiverQuery({
    variables: {
      type: noticeType?.value,
    },
  });
  let shopIndexFind: any = find(
    data?.storeNoticeReceiver,
    (x: any) => x.slug === router.query.shop
  );

  const [effective_from, expired_at] = watch(['effective_from', 'expired_at']);
  const isTranslateStoreNotice = router.locale !== Config.defaultLanguage;

  const onSubmit = async (values: FormValues) => {
    const inputValues = {
      priority: values.priority.value,
      notice: values.notice,
      description: values.description,
      type: superAdmin ? values.type?.value : 'specific_shop',
      effective_from: new Date(effective_from).toISOString(),
      expired_at: new Date(expired_at).toISOString(),
      received_by: superAdmin
        ? values.received_by?.map((r) => Number(r.id))
        : [Number(shopIndexFind?.id)],
    };

    try {
      if (!initialValues) {
        await createStoreNotice({
          variables: {
            input: {
              ...inputValues,
            },
          },
        });
        const generateRedirectUrl = router.query.shop
          ? `/${router.query.shop}${Routes.storeNotice.list}`
          : Routes.storeNotice.list;

        await router.push(generateRedirectUrl, undefined, {
          locale: Config.defaultLanguage,
        });

        toast.success(t('common:successfully-created'));
      } else {
        const { data } = await updateStoreNotice({
          variables: {
            input: {
              ...inputValues,
              id: initialValues.id,
            },
          },
        });

        if (data) {
          const generateRedirectUrl = router.query.shop
            ? `/${router.query.shop}${Routes.storeNotice.list}`
            : Routes.storeNotice.list;
          await Router.replace(
            `${generateRedirectUrl}/${data.updateStoreNotice?.id}/edit`,
            undefined,
            {
              locale: router.locale,
            }
          );
          toast.success(t('common:successfully-updated'));
        }
      }
    } catch (error) {
      const serverErrors = getErrorMessage(error);
      Object.keys(serverErrors?.validation).forEach((field: any) => {
        setError(field.split('.')[1], {
          type: 'manual',
          message: serverErrors?.validation[field][0],
        });
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-wrap my-5 sm:my-8">
        <Description
          title={t('form:input-label-description')}
          details={`${
            initialValues
              ? t('form:item-description-edit')
              : t('form:item-description-add')
          } ${t('form:store-notice-form-info-help-text')}`}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5 "
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5">
            <Label>{t('form:input-label-priority')}</Label>
            <SelectInput
              name="priority"
              getOptionLabel={(option: any) => option.name}
              getOptionValue={(option: any) => option.value}
              control={control}
              options={priorityType}
            />
            <ValidationError
              //@ts-ignore
              message={t(errors.priority?.message!)}
            />
          </div>
          <Input
            label={`${t('form:input-title')}*`}
            {...register('notice')}
            error={t(errors.notice?.message!)}
            variant="outline"
            className="mb-5"
            disabled={isTranslateStoreNotice}
          />

          <TextArea
            label={`${t('form:input-label-description')}*`}
            {...register('description')}
            error={t(errors.description?.message!)}
            variant="outline"
            className="mb-5"
            disabled={isTranslateStoreNotice}
          />

          <div className="flex flex-col mb-6 sm:flex-row">
            <div className="w-full p-0 mb-5 sm:mb-0 sm:w-1/2 sm:pe-2">
              <Label>{`${t('form:store-notice-active-from')}*`}</Label>

              <Controller
                control={control}
                name="effective_from"
                render={({ field: { onChange, onBlur, value } }) => (
                  //@ts-ignore
                  <DatePicker
                    dateFormat="dd/MM/yyyy"
                    onChange={onChange}
                    onBlur={onBlur}
                    selected={value}
                    selectsStart
                    minDate={new Date()}
                    maxDate={expired_at}
                    startDate={effective_from}
                    endDate={expired_at}
                    className="border border-border-base"
                    disabled={isTranslateStoreNotice}
                  />
                )}
              />
              <ValidationError message={t(errors.effective_from?.message!)} />
            </div>
            <div className="w-full p-0 sm:w-1/2 sm:ps-2">
              <Label>{`${t('form:store-notice-expire-at')}*`}</Label>

              <Controller
                control={control}
                name="expired_at"
                render={({ field: { onChange, onBlur, value } }) => (
                  //@ts-ignore
                  <DatePicker
                    dateFormat="dd/MM/yyyy"
                    onChange={onChange}
                    onBlur={onBlur}
                    selected={value}
                    selectsEnd
                    startDate={effective_from}
                    endDate={expired_at}
                    minDate={effective_from}
                    className="border border-border-base"
                    disabled={isTranslateStoreNotice}
                  />
                )}
              />
              <ValidationError message={t(errors.expired_at?.message!)} />
            </div>
          </div>
          {superAdmin && (
            <>
              <div className="mb-0">
                <Label>{t('form:input-label-type')}</Label>
                <SelectInput
                  name="type"
                  control={control}
                  getOptionLabel={(option: any) => option.name}
                  getOptionValue={(option: any) => option.value}
                  options={noticeTypes}
                  defaultValue={noticeTypes[0]}
                />

                <ValidationError //@ts-ignore
                  message={t(errors.type?.message)}
                />
              </div>
              {noticeType &&
                (noticeType.value ==
                  StoreNoticeType.SpecificVendor.toLowerCase() ||
                  noticeType.value ===
                    StoreNoticeType.SpecificShop.toLowerCase()) && (
                  <NoticeReceivedByInput
                    className="mt-5"
                    control={control}
                    setValue={setValue}
                    //@ts-ignore
                    error={t(errors.received_by?.message!)}
                  />
                )}
            </>
          )}
        </Card>
      </div>
      <div className="mb-4 text-end">
        {initialValues && (
          <Button
            variant="outline"
            onClick={router.back}
            className="me-4"
            type="button"
          >
            {t('form:button-label-back')}
          </Button>
        )}

        <Button loading={updating || creating}>
          {initialValues
            ? t('form:button-label-update-store-notice')
            : t('form:button-label-add-store-notice')}
        </Button>
      </div>
    </form>
  );
}
