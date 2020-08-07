import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useTranslation } from 'next-i18next';
import {
  StoreNoticePaginator,
  SortOrder,
  StoreNotice,
} from '__generated__/__types__';
import { useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import TitleWithSort from '@/components/ui/title-with-sort';
import { Routes } from '@/config/routes';
import LanguageSwitcher from '@/components/ui/lang-action/action';
import { useIsRTL } from '@/utils/locals';
import { useRouter } from 'next/router';
import PriorityColor from '@/components/store-notice/priority-color';
import Badge from '@/components/ui/badge/badge';
import ActionButtons from '@/components/common/action-buttons';
import { NoShop } from '../icons/no-shop';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

type IProps = {
  storeNotices: StoreNoticePaginator | null | undefined;
  onPagination: (current: number) => void;
  refetch: Function;
};

const StoreNoticeList = ({ storeNotices, onPagination, refetch }: IProps) => {
  const { data, paginatorInfo } = storeNotices! ?? {};

  const { t } = useTranslation();
  const router = useRouter();
  const { alignLeft, alignRight } = useIsRTL();
  const [order, setOrder] = useState<SortOrder>(SortOrder.Desc);
  const [column, setColumn] = useState<string>();

  const debouncedHeaderClick = useMemo(
    () =>
      debounce((value) => {
        setColumn(value);
        setOrder(order === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc);
        refetch({
          sortedBy: order === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc,
          orderBy: value,
        });
      }, 500),
    [order]
  );

  const onHeaderClick = (value: string | undefined) => ({
    onClick: () => {
      debouncedHeaderClick(value);
    },
  });

  const columns = [
    {
      title: t('table:table-item-id'),
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      width: 100,
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-notice')}
          ascending={order === SortOrder.Asc && column === 'notice'}
          isActive={column === 'notice'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'notice',
      key: 'notice',
      align: alignLeft,
      ellipsis: true,
      width: 200,
      onHeaderCell: () => onHeaderClick('notice'),
      render: (text: string) => (
        <span className="whitespace-nowrap">{text}</span>
      ),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-description')}
          ascending={order === SortOrder.Asc && column === 'description'}
          isActive={column === 'description'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'description',
      key: 'description',
      align: alignLeft,
      width: 300,
      ellipsis: true,
      onHeaderCell: () => onHeaderClick('description'),
      render: (text: string) => (
        <span className="whitespace-nowrap">{text}</span>
      ),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-type')}
          ascending={order === SortOrder.Asc && column === 'type'}
          isActive={column === 'type'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      width: 140,
      onHeaderCell: () => onHeaderClick('type'),
      render: (text: string) => {
        const typeText: string = text.replace(/_/g, ' ');
        const finalResult: string =
          typeText.charAt(0).toUpperCase() + typeText.slice(1);
        return <span className="whitespace-nowrap">{finalResult}</span>;
      },
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-effective-from')}
          ascending={order === SortOrder.Asc && column === 'effective_from'}
          isActive={column === 'effective_from'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'effective_from',
      key: 'effective_from',
      align: 'center',
      width: 130,
      onHeaderCell: () => onHeaderClick('effective_from'),
      render: (effective_from: string) => (
        <span className="whitespace-nowrap">
          {dayjs()?.to(dayjs?.utc(effective_from)?.tz(dayjs?.tz?.guess()))}
        </span>
      ),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-expired-at')}
          ascending={order === SortOrder.Asc && column === 'expired_at'}
          isActive={column === 'expired_at'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'expired_at',
      key: 'expired_at',
      align: 'center',
      width: 130,
      onHeaderCell: () => onHeaderClick('expired_at'),
      render: (expired_date: string) => (
        <span className="whitespace-nowrap">
          {dayjs()?.to(dayjs?.utc(expired_date)?.tz(dayjs?.tz?.guess()))}
        </span>
      ),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-issued-by')}
          ascending={order === SortOrder.Asc && column === 'creator_role'}
          isActive={column === 'creator_role'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'creator_role',
      key: 'creator_role',
      align: 'center',
      width: 100,
      onHeaderCell: () => onHeaderClick('creator_role'),
      render: (text: string) => (
        <span className="whitespace-nowrap">{text}</span>
      ),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-priority')}
          ascending={order === SortOrder.Asc && column === 'priority'}
          isActive={column === 'priority'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'priority',
      key: 'priority',
      align: 'center',
      width: 120,
      onHeaderCell: () => onHeaderClick('priority'),
      render: (text: string) => (
        <Badge
          text={text}
          className="font-medium uppercase"
          color={PriorityColor(text)}
        />
      ),
    },
    {
      title: t('table:table-item-actions'),
      key: 'actions',
      align: alignRight,
      width: 150,
      render: (data: StoreNotice) => {
        if (router?.asPath !== '/') {
          return (
            <>
              <LanguageSwitcher
                slug={data?.id}
                record={data}
                deleteModalView="DELETE_STORE_NOTICE"
                routes={Routes?.storeNotice}
              />
            </>
          );
        } else {
          return (
            <ActionButtons
              id={data?.id}
              detailsUrl={Routes?.storeNotice?.details(data?.id)}
              customLocale={router?.locale}
            />
          );
        }
      },
    },
  ];

  return (
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          // @ts-ignore
          columns={columns}
          emptyText={() => (
            <div className="flex flex-col items-center py-6">
              <div className="relative w-72 sm:h-80 sm:w-96">
                <NoShop />
              </div>
              <div className="pt-6 text-sm font-semibold">
                {t('table:empty-table-data')}
              </div>
            </div>
          )}
          data={data}
          rowKey="id"
          scroll={{ x: 1000 }}
        />
      </div>

      {!!paginatorInfo.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo.total}
            current={paginatorInfo.currentPage}
            pageSize={paginatorInfo.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default StoreNoticeList;
