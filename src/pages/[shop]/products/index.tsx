import Card from '@/components/common/card';
import Search from '@/components/common/search';
import ProductList from '@/components/product/product-list';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useProductsQuery } from '@/graphql/products.graphql';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ShopLayout from '@/components/layouts/shop';
import { useRouter } from 'next/router';
import LinkButton from '@/components/ui/link-button';
import {
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';
import CategoryTypeFilter from '@/components/product/category-type-filter';
import cn from 'classnames';
import { ArrowDown } from '@/components/icons/arrow-down';
import { ArrowUp } from '@/components/icons/arrow-up';
import { useModalAction } from '@/components/ui/modal/modal.context';
import Button from '@/components/ui/button';
import { MoreIcon } from '@/components/icons/more-icon';
import { ProductPaginator, SortOrder } from '__generated__/__types__';
import { QueryProductsOrderByColumn } from '@/types/custom-types';
import { formatSearchParams } from '@/utils/format-search-params';
import { Config } from '@/config';
import { Routes } from '@/config/routes';

export default function ProductsPage() {
  const router = useRouter();
  const {
    locale,
    query: { shop },
  } = useRouter();
  const { permissions } = getAuthCredentials();
  const { data: myShop } = useMyShopsQuery();
  const { data: shopData, loading: fetchingShop } = useShopQuery({
    variables: {
      slug: shop as string,
    },
  });
  const shopId = shopData?.shop?.id!;
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [visible, setVisible] = useState(false);
  const { openModal } = useModalAction();

  const toggleVisible = () => {
    setVisible((v) => !v);
  };

  function handleImportModal() {
    openModal('EXPORT_IMPORT_PRODUCT', shopId);
  }

  const { data, loading, error, refetch } = useProductsQuery({
    skip: !Boolean(shopId),
    variables: {
      language: locale,
      first: 10,
      search: formatSearchParams({
        shop_id: shopId,
      }),
      orderBy: QueryProductsOrderByColumn.CREATED_AT,
      sortedBy: SortOrder.Desc,
      page: 1,
    },
    fetchPolicy: 'network-only',
  });

  if (loading || fetchingShop)
    return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    refetch({
      search: formatSearchParams({
        name: searchText,
      }),
      page: 1,
    });
  }

  function handlePagination(current: any) {
    refetch({
      search: formatSearchParams({
        name: searchTerm,
      }),
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
      <Card className="flex flex-col mb-8">
        <div className="flex flex-col items-center w-full md:flex-row">
          <div className="mb-4 md:w-1/4 md:mb-0">
            <h1 className="text-lg font-semibold text-heading">
              {t('form:input-label-products')}
            </h1>
          </div>

          <div className="flex flex-col items-center w-full md:w-3/4 md:flex-row">
            <div className="flex items-center w-full">
              <Search onSearch={handleSearch} />

              {locale === Config.defaultLanguage && (
                <LinkButton
                  href={`/${shop}/products/create`}
                  className="h-12 ms-4 md:ms-6"
                >
                  <span className="hidden md:block">
                    + {t('form:button-label-add-product')}
                  </span>
                  <span className="md:hidden">
                    + {t('form:button-label-add')}
                  </span>
                </LinkButton>
              )}
            </div>

            <Button
              onClick={handleImportModal}
              className="w-full mt-5 md:hidden"
            >
              {t('common:text-export-import')}
            </Button>

            <button
              className="flex items-center mt-5 text-base font-semibold text-accent md:ms-5 md:mt-0 whitespace-nowrap"
              onClick={toggleVisible}
            >
              {t('common:text-filter')}{' '}
              {visible ? (
                <ArrowUp className="ms-2" />
              ) : (
                <ArrowDown className="ms-2" />
              )}
            </button>

            <button
              onClick={handleImportModal}
              className="items-center justify-center flex-shrink-0 hidden w-8 h-8 transition duration-300 rounded-full md:flex bg-gray-50 hover:bg-gray-100 ms-5"
            >
              <MoreIcon className="w-3.5 text-body" />
            </button>
          </div>
        </div>

        <div
          className={cn('w-full flex transition', {
            'h-auto visible': visible,
            'h-0 invisible': !visible,
          })}
        >
          <div className="flex flex-col w-full pt-5 mt-5 border-t border-gray-200 md:flex-row md:items-center md:mt-8 md:pt-8">
            <CategoryTypeFilter refetch={refetch} className="w-full" />
          </div>
        </div>
      </Card>

      <ProductList
        products={data?.products as ProductPaginator}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}
ProductsPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
ProductsPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
