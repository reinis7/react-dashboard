import ActionButtons from '@/components/common/action-buttons';
import { ChatIcon } from '@/components/icons/chat';
import { useCreateConversation } from '@/components/message/data/conversations';
import StatusColor from '@/components/order/status-color';
import Badge from '@/components/ui/badge/badge';
import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import TitleWithSort from '@/components/ui/title-with-sort';
import { formatAddress } from '@/utils/format-address';
import { useIsRTL } from '@/utils/locals';
import usePrice from '@/utils/use-price';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Order } from 'graphql-let/__generated__/__types__';
import debounce from 'lodash/debounce';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import {
  OrderPaginator, SortOrder, UserAddress
} from '__generated__/__types__';

type IProps = {
  orders: OrderPaginator | null | undefined;
  onPagination: (current: number) => void;
  refetch: Function;
};

const OrderList = ({ orders, onPagination, refetch }: IProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { data, paginatorInfo } = orders! ?? {};
  const rowExpandable = (record: any) => record.children?.length;
  const { alignLeft } = useIsRTL();

  const [order, setOrder] = useState<SortOrder>(SortOrder.Desc);
  const [column, setColumn] = useState<string>();
  const [loading, setLoading] = useState<boolean | string | undefined>(false);
  const { createConversation } = useCreateConversation();

  const onSubmit = async (shop_id: string | undefined) => {
    setLoading(shop_id);
    createConversation({
      variables: {
        input: {
          // @ts-ignore
          shop_id,
        },
      },
    });
  };

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
      title: t('table:table-item-tracking-number'),
      dataIndex: 'tracking_number',
      key: 'tracking_number',
      align: 'center',
      width: 150,
    },
    {
      title: t('table:table-item-delivery-fee'),
      dataIndex: 'delivery_fee',
      key: 'delivery_fee',
      align: 'center',
      render: function Render(value: any) {
        const delivery_fee = value ? value : 0;
        const { price } = usePrice({
          amount: delivery_fee,
        });
        return <span>{price}</span>;
      },
    },

    {
      title: (
        <TitleWithSort
          title={t('table:table-item-total')}
          ascending={order === SortOrder.Asc && column === 'total'}
          isActive={column === 'total'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'total',
      key: 'total',
      align: 'center',
      width: 120,
      onHeaderCell: () => onHeaderClick('total'),
      render: function Render(value: any) {
        const { price } = usePrice({
          amount: value,
        });
        return <span className="whitespace-nowrap">{price}</span>;
      },
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-order-date')}
          ascending={order === SortOrder.Asc && column === 'created_at'}
          isActive={column === 'created_at'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      onHeaderCell: () => onHeaderClick('created_at'),
      render: (date: string) => {
        dayjs.extend(relativeTime);
        dayjs.extend(utc);
        dayjs.extend(timezone);
        return (
          <span className="whitespace-nowrap">
            {dayjs.utc(date).tz(dayjs.tz.guess()).fromNow()}
          </span>
        );
      },
    },
    {
      title: t('table:table-item-status'),
      dataIndex: 'order_status',
      key: 'order_status',
      align: alignLeft,
      render: (order_status: string) => (
        <Badge text={t(order_status)} color={StatusColor(order_status)} />
      ),
    },
    {
      title: t('table:table-item-shipping-address'),
      dataIndex: 'shipping_address',
      key: 'shipping_address',
      align: alignLeft,
      render: (shipping_address: UserAddress) => (
        <div>{formatAddress(shipping_address)}</div>
      ),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: 'center',
      width: 100,
      render: (id: string, order: Order) => {
        return (
          <>
            {/* @ts-ignore */}
            {order?.children?.length ? (
              ''
            ) : (
              <>
                {order?.shop?.id ? (
                  <button
                    onClick={() => onSubmit(order?.shop?.id)}
                    disabled={!!loading && loading === order?.shop?.id}
                    className="cursor-pointer text-accent transition-colors duration-300 hover:text-accent-hover"
                  >
                    <ChatIcon width="19" height="20" />
                  </button>
                ) : (
                  ''
                )}
              </>
            )}
            <ActionButtons
              id={id}
              detailsUrl={`${router.asPath}/${id}`}
              customLocale={order.language as string}
            />
          </>
        );
      },
    },
  ];

  return (
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          //@ts-ignore
          columns={columns}
          emptyText={t('table:empty-table-data')}
          data={data}
          rowKey="id"
          scroll={{ x: 1000 }}
          expandable={{
            expandedRowRender: () => '',
            rowExpandable: rowExpandable,
          }}
        />
      </div>

      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={paginatorInfo?.total}
            current={paginatorInfo?.currentPage}
            pageSize={paginatorInfo?.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </>
  );
};

export default OrderList;
