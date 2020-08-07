import ReviewList from '@/components/reviews/review-list';
import Card from '@/components/common/card';
import Layout from '@/components/layouts/shop';
import { useState } from 'react';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  adminAndOwnerOnly,
  adminOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { useRouter } from 'next/router';
import { useReviewsQuery } from '@/graphql/reviews.graphql';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';
import {
  QueryReviewsOrderByColumn,
  ReviewPaginator,
  SortOrder,
} from '__generated__/__types__';
import { Routes } from '@/config/routes';

export default function Reviews() {
  const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const router = useRouter();
  const {
    query: { shop },
  } = useRouter();
  const { permissions } = getAuthCredentials();
  const { data: myShop } = useMyShopsQuery();
  const { data: shopData } = useShopQuery({
    variables: { slug: shop as string },
  });
  const shopId = shopData?.shop?.id!;
  const { data, loading, error, refetch } = useReviewsQuery({
    variables: {
      first: 15,
      shop_id: shopId,
      orderBy: [
        {
          column: QueryReviewsOrderByColumn.CreatedAt,
          order: SortOrder.Desc,
        },
      ],
      page,
    },
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handlePagination(current: any) {
    setPage(current);
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
          <h1 className="text-xl font-semibold text-heading">
            {t('form:input-label-reviews')}
          </h1>
        </div>
      </Card>
      <ReviewList
        reviews={data?.reviews as ReviewPaginator}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}
Reviews.authenticate = {
  permissions: adminAndOwnerOnly,
};
Reviews.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
