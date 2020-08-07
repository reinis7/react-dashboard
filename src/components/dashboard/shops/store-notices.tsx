import ErrorMessage from '@/components/ui/error-message';
import { useTranslation } from 'next-i18next';
import { useStoreNoticesQuery } from '@/graphql/store-notice.graphql';
import { NetworkStatus } from '@apollo/client';
import { useRouter } from 'next/router';
import StoreNoticeCard from '@/components/store-notice/store-notice-card';
import Button from '@/components/ui/button';
import NotFound from '@/components/ui/not-found';
import { LIMIT } from '@/utils/constants';

const useStoreNoticesLoadMoreQuery = () => {
  const { locale } = useRouter();

  const {
    data,
    loading: isLoading,
    error,
    fetchMore,
    networkStatus,
  } = useStoreNoticesQuery({
    variables: {
      language: locale,
      first: LIMIT,
      orderBy: 'effective_from',
      sortedBy: 'ASC',
      page: 1,
    },
    notifyOnNetworkStatusChange: true,
  });

  function handleLoadMore() {
    if (data?.storeNotices?.paginatorInfo.hasMorePages) {
      fetchMore({
        variables: {
          page: data?.storeNotices?.paginatorInfo?.currentPage + 1,
        },
      });
    }
  }

  return {
    storeNotices: data?.storeNotices?.data ?? [],
    paginatorInfo: data?.storeNotices?.paginatorInfo,
    isLoading,
    error,
    isLoadingMore: networkStatus === NetworkStatus.fetchMore,
    loadMore: handleLoadMore,
    hasNextPage: Boolean(data?.storeNotices?.paginatorInfo?.hasMorePages),
  };
};

function StoreNotices() {
  const { t } = useTranslation();
  const {
    storeNotices,
    loadMore,
    isLoading,
    isLoadingMore,
    error,
    hasNextPage,
  } = useStoreNoticesLoadMoreQuery();

  if (!isLoading && !storeNotices?.length)
    return (
      <div className="w-full min-h-full px-4 pt-6 pb-8 lg:p-8">
        <NotFound text="text-notice-not-found" className="w-7/12 mx-auto" />
      </div>
    );
  if (error) return <ErrorMessage message={error?.message} />;

  return (
    <>
      <div className="space-y-5">
        {storeNotices?.map((notice: any, idx: number) => (
          <StoreNoticeCard noticeData={notice} key={idx} />
        ))}
      </div>
      {hasNextPage && (
        <div className="grid mt-8 place-content-center md:mt-10">
          <Button onClick={loadMore} loading={isLoadingMore}>
            {t('common:text-load-more')}
          </Button>
        </div>
      )}
    </>
  );
}

export default StoreNotices;
