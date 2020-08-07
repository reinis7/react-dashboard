import Card from '@/components/common/card';
import ShopLayout from '@/components/layouts/shop';
import { useState } from 'react';
import Search from '@/components/common/search';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import LinkButton from '@/components/ui/link-button';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  adminAndOwnerOnly,
  adminOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { useRouter } from 'next/router';
import { useStoreNoticesQuery } from '@/graphql/store-notice.graphql';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';
import StoreNoticeList from '@/components/store-notice/store-notice-list';
import { LIMIT } from '@/utils/constants';
import { Config } from '@/config';
import { Routes } from '@/config/routes';

export default function StoreNotice() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const {
    query: { shop },
  } = useRouter();
  const router = useRouter();
  const { permissions } = getAuthCredentials();
  const { data: myShop } = useMyShopsQuery();
  const { data: shopData } = useShopQuery({
    variables: { slug: shop as string },
  });
  const shopId = shopData?.shop?.id!;

  const { data, loading, error, refetch } = useStoreNoticesQuery({
    variables: {
      language: locale,
      first: LIMIT,
      sortedBy: 'DESC',
      page: 1,
      shop_id: shopId,
      orderBy: 'effective_from',
    },
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

  if (
    !hasAccess(adminOnly, permissions) &&
    !myShop?.me?.shops?.map((shop: any) => shop.id).includes(shopId) &&
    myShop?.me?.managed_shop?.id != shopId
  ) {
    router.replace(Routes.dashboard);
  }

  return (
    <>
      <Card className="flex flex-col items-center mb-8 md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/4">
          <h1 className="text-xl font-semibold text-heading">
            {t('form:input-label-store-notices')}
          </h1>
        </div>

        <div className="flex flex-col items-center w-full space-y-4 ms-auto md:w-2/3 md:flex-row md:space-y-0 xl:w-3/4 2xl:w-1/2">
          <Search onSearch={handleSearch} />

          {locale === Config.defaultLanguage && (
            <LinkButton
              href={`/${shop}/store-notices/create`}
              className="w-full h-12 md:w-auto md:ms-6"
            >
              <span className="hidden xl:block">
                + {t('form:button-label-add-store-notice')}
              </span>
              <span className="xl:hidden">+ {t('form:button-label-add')}</span>
            </LinkButton>
          )}
        </div>
      </Card>
      <StoreNoticeList
        //@ts-ignore
        storeNotices={data?.storeNotices}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}

StoreNotice.authenticate = {
  permissions: adminAndOwnerOnly,
};
StoreNotice.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
