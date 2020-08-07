import Card from '@/components/common/card';
import Search from '@/components/common/search';
import ManufacturerList from '@/components/manufacturer/manufacturer-list';
import LinkButton from '@/components/ui/link-button';
import { useManufacturersQuery } from '@/graphql/manufacturers.graphql';
import { useState } from 'react';

import { LIMIT } from '@/utils/constants';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ShopLayout from '@/components/layouts/shop';
import {
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { useRouter } from 'next/router';
import {
  ManufacturerPaginator,
  QueryManufacturersOrderByColumn,
  SortOrder,
} from '__generated__/__types__';
import { Routes } from '@/config/routes';
import { Config } from '@/config';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';

export default function Manufacturers() {
  const { t } = useTranslation();
  const {
    locale,
    query: { shop },
  } = useRouter();
  const router = useRouter();
  const { query } = useRouter();
  const { permissions } = getAuthCredentials();
  const { data: myShop } = useMyShopsQuery();
  const { data: shopData } = useShopQuery({
    variables: {
      slug: query.shop as string,
    },
  });
  const shopId = shopData?.shop?.id!;
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error, refetch } = useManufacturersQuery({
    variables: {
      language: locale,
      first: LIMIT,
      orderBy: [
        {
          column: QueryManufacturersOrderByColumn.CreatedAt,
          order: SortOrder.Desc,
        },
      ],
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

  if (
    !hasAccess(adminOnly, permissions) &&
    !myShop?.me?.shops?.map((shop: any) => shop.id).includes(shopId) &&
    myShop?.me?.managed_shop?.id != shopId
  ) {
    router.replace(Routes.dashboard);
  }

  return (
    <>
      <Card className="flex flex-col items-center mb-8 xl:flex-row">
        <div className="mb-4 md:w-1/3 xl:mb-0">
          <h1 className="text-xl font-semibold text-heading">
            {t('common:text-manufacturers-publications')}
          </h1>
        </div>

        <div className="flex flex-col items-center w-full space-y-4 xl:w-2/3 md:flex-row md:space-y-0 ms-auto">
          <Search onSearch={handleSearch} />

          {locale === Config.defaultLanguage && (
            <LinkButton
              href={`/${shop}${Routes.manufacturer.create}`}
              className="w-full h-12 md:ms-6 md:w-auto"
            >
              <span>
                + {t('form:button-label-add-manufacturer-publication')}
              </span>
            </LinkButton>
          )}
        </div>
      </Card>

      <ManufacturerList
        manufacturers={data?.manufacturers as ManufacturerPaginator}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}
Manufacturers.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
Manufacturers.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
