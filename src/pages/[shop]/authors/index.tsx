import Card from '@/components/common/card';
import ShopLayout from '@/components/layouts/shop';
import {
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import Search from '@/components/common/search';
import LinkButton from '@/components/ui/link-button';
import { useAuthorsQuery } from '@/graphql/authors.graphql';
import { useState } from 'react';
import { LIMIT } from '@/utils/constants';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AuthorPaginator, QueryAuthorsOrderByColumn, SortOrder } from '__generated__/__types__';
import AuthorList from '@/components/author/author-list';
import { Routes } from '@/config/routes';
import { Config } from '@/config';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';

export default function Authors() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    locale,
    query: { shop },
  } = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const { permissions } = getAuthCredentials();
  const { data: myShop } = useMyShopsQuery();
  const { data: shopData, loading: fetchingShop } = useShopQuery({
    variables: {
      slug: shop as string,
    },
  });
  const shopId = shopData?.shop?.id!;
  const { data, loading, error, refetch } = useAuthorsQuery({
    variables: {
      language: locale,
      first: LIMIT,
      orderBy: [
        {
          column: QueryAuthorsOrderByColumn.CreatedAt,
          order: SortOrder.Desc,
        },
      ],
      page: 1,
    },
    fetchPolicy: 'network-only',
  });

  if (loading || fetchingShop)
    return <Loader text={t('common:text-loading')} />;
  if (
    !hasAccess(adminOnly, permissions) &&
    !myShop?.me?.shops?.map((shop: any) => shop.id).includes(shopId) &&
    myShop?.me?.managed_shop?.id != shopId
  ) {
    router.replace(Routes.dashboard);
  }
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
            {t('common:text-authors')}
          </h1>
        </div>

        <div className="flex flex-col items-center w-full space-y-4 xl:w-1/2 md:flex-row md:space-y-0 ms-auto">
          <Search onSearch={handleSearch} />

          {locale === Config.defaultLanguage && (
            <LinkButton
              href={`/${shop}${Routes.author.create}`}
              className="w-full h-12 md:ms-6 md:w-auto"
            >
              <span>+ {t('form:button-label-add-author')}</span>
            </LinkButton>
          )}
        </div>
      </Card>

      <AuthorList
        authors={data?.authors as AuthorPaginator}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}
Authors.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
Authors.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
