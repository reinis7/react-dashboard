import Badge from '@/components/ui/badge/badge';
import { InfoIcon } from '@/components/icons/info-icon';
import { StoreNoticePriority, StoreNotice } from '__generated__/__types__';
import { useStoreNoticeReadMutation } from '@/graphql/store-notice.graphql';
import PriorityColor from '@/components/store-notice/priority-color';
import { Routes } from '@/config/routes';
import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import { CheckMarkCircle } from '@/components/icons/checkmark-circle';
import { useRouter } from 'next/router';
import { CheckMarkFill } from '@/components/icons/checkmark-circle-fill';
import { getAuthCredentials } from '@/utils/auth-utils';

type NoticeCardProps = {
  noticeData: StoreNotice;
};

const StoreNoticeCard: React.FC<NoticeCardProps> = ({ noticeData }) => {
  const { t } = useTranslation();
  const { permissions } = getAuthCredentials();
  const router = useRouter();
  const { id, notice, is_read, description, priority } = noticeData;
  const [storeNoticeReadMutation] = useStoreNoticeReadMutation();

  const activeUser = permissions?.includes('super_admin')
    ? Routes?.storeNotice?.details(id)
    : '/shops/' + Routes?.storeNotice?.details(id);

  const onClickHandel = () => {
    router.push(activeUser);
    storeNoticeReadMutation({
      variables: {
        input: {
          id: id,
        },
      },
    });
  };

  return (
    <div onClick={onClickHandel} role="button">
      <div
        className={cn('relative', {
          'opacity-70': is_read,
        })}
      >
        <div
          className={cn(
            'relative flex flex-col rounded border-l-4 bg-white py-6 shadow ps-5 pe-10 md:flex-row md:border-l-[5px] md:py-7 md:ps-9 md:pe-14',
            {
              'border-[#61A0FF] bg-[#F2F7FF]':
                StoreNoticePriority.High.toLocaleLowerCase() === priority,
              'border-[#FFAA2C] bg-[#FFFAF4]':
                StoreNoticePriority.Medium.toLocaleLowerCase() === priority,
              'border-[#FFD361] bg-[#FFFBF0]':
                StoreNoticePriority.Low.toLocaleLowerCase() === priority,
            }
          )}
        >
          <div
            className={cn(
              'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white md:h-[70px] md:w-[70px] md:rounded-[20px]',
              PriorityColor(priority)
            )}
          >
            <InfoIcon className="w-8 h-8 md:h-9 md:w-9" />
          </div>

          <div className="mt-4 md:mt-0 md:ms-6 lg:ms-8">
            <h3
              className={`mb-2.5 text-lg  ${
                is_read
                  ? 'font-medium text-heading'
                  : 'font-semibold text-black'
              }`}
            >
              {notice}{' '}
              <Badge
                text={priority}
                color={PriorityColor(priority)}
                className="font-medium uppercase"
              />
            </h3>
            {description && (
              <>
                <p className="mb-2 text-[15px] leading-relaxed text-body">
                  {description.substring(0, 250) + '...'}
                </p>
                <span className="inline-block text-[15px] font-bold text-accent">
                  {t('common:text-read-more')}
                </span>
              </>
            )}
          </div>
        </div>

        <div
          className={`absolute top-10 flex h-8 w-8 items-center justify-center p-1 text-gray-500 transition-colors end-2 md:top-5 md:end-5  ${
            is_read ? 'opacity-60' : 'hover:text-black'
          }`}
        >
          <span className="sr-only">{t('text-close')}</span>
          {is_read ? (
            <CheckMarkFill className="w-5 h-5" />
          ) : (
            <CheckMarkCircle className="w-5 h-5" />
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreNoticeCard;
