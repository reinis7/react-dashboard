import Card from '@/components/common/card';
import LinkButton from '@/components/ui/link-button';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ShopLayout from '@/components/layouts/shop';
import { useRouter } from 'next/router';
import {
  useMyShopsQuery,
  useShopQuery,
  useStaffsQuery,
} from '@/graphql/shops.graphql';
import StaffList from '@/components/shop/staff-list';
import {
  adminAndOwnerOnly,
  adminOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import ErrorMessage from '@/components/ui/error-message';
import { UserPaginator } from '__generated__/__types__';
import { Routes } from '@/config/routes';

export default function StaffsPage() {
  const {
    query: { shop },
  } = useRouter();
  const router = useRouter();
  const { t } = useTranslation();
  const { permissions } = getAuthCredentials();
  const { data: myShop } = useMyShopsQuery();
  const { data: shopData, loading: fetchingShopId } = useShopQuery({
    variables: {
      slug: shop as string,
    },
  });
  const shopId = shopData?.shop?.id!;
  const { data, loading, error, refetch } = useStaffsQuery({
    skip: !Boolean(shopId),
    variables: {
      shop_id: shopId,
    },
    fetchPolicy: 'network-only',
  });

  if (fetchingShopId || loading)
    return <Loader text={t('common:text-loading')} />;
  if (
    !hasAccess(adminOnly, permissions) &&
    !myShop?.me?.shops?.map((shop: any) => shop.id).includes(shopId) &&
    myShop?.me?.managed_shop?.id != shopId
  ) {
    router.replace(Routes.dashboard);
  }

  if (error) return <ErrorMessage message={error.message} />;

  function handlePagination(current: any) {
    refetch({
      page: current,
    });
  }

  return (
    <>
      <Card className="flex flex-row items-center justify-between mb-8">
        <div className="md:w-1/4">
          <h1 className="text-lg font-semibold text-heading">
            {t('form:text-staff')}
          </h1>
        </div>

        <div className="flex items-center w-3/4 xl:w-2/4 ms-auto">
          <LinkButton href={`/${shop}/staffs/create`} className="h-12 ms-auto">
            <span>+ {t('form:button-label-add-staff')}</span>
          </LinkButton>
        </div>
      </Card>

      <StaffList
        staffs={data?.staffs as UserPaginator}
        onPagination={handlePagination}
        refetch={refetch}
      />
    </>
  );
}
StaffsPage.authenticate = {
  permissions: adminAndOwnerOnly,
};
StaffsPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
