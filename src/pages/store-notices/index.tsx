import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import StoreNoticeList from '@/components/store-notice/store-notice-list';
import LinkButton from '@/components/ui/link-button';
import { useStoreNoticesQuery } from '@/graphql/store-notice.graphql';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { LIMIT } from '@/utils/constants';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminAndOwnerOnly } from '@/utils/auth-utils';
import { Routes } from '@/config/routes';
import { Config } from '@/config';

export default function StoreNotices() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error, refetch } = useStoreNoticesQuery({
    variables: {
      language: locale,
      first: LIMIT,
      orderBy: 'effective_from',
      sortedBy: 'DESC',
      page: 1,
    },
    fetchPolicy: 'network-only',
  });
  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    refetch({
      text: `%${searchText}%`,
      page: 1,
    });
  }

  function handlePagination(current: number) {
    refetch({
      text: `%${searchTerm}%`,
      page: current,
    });
  }

  return (
    <>
      <Card className="flex flex-col items-center mb-8 xl:flex-row">
        <div className="mb-4 md:w-1/4 xl:mb-0">
          <h1 className="text-xl font-semibold text-heading">
            {t('form:input-label-store-notices')}
          </h1>
        </div>

        <div className="flex flex-col items-center w-full space-y-4 xl:w-1/2 md:flex-row md:space-y-0 ms-auto">
          <Search onSearch={handleSearch} />

          {locale === Config.defaultLanguage && (
            <LinkButton
              href={`${Routes.storeNotice.create}`}
              className="w-full h-12 md:ms-6 md:w-auto"
            >
              <span>+ {t('form:button-label-add-store-notice')}</span>
            </LinkButton>
          )}
        </div>
      </Card>

      <StoreNoticeList
        // @ts-ignore
        storeNotices={data?.storeNotices}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}
StoreNotices.authenticate = {
  permissions: adminAndOwnerOnly,
};
StoreNotices.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});
