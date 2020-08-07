import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';

// import Image from 'next/image';
import { useMyShopsQuery } from '@/graphql/shops.graphql';
import ShopCard from '@/components/shop/shop-card';
// import NoShopSvg from '../../../../public/no-shop.svg';
import { NoShop } from '@/components/icons/no-shop';
import { adminOnly, getAuthCredentials, hasAccess } from '@/utils/auth-utils';

const ShopList = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useMyShopsQuery();
  const { permissions } = getAuthCredentials();
  let permission = hasAccess(adminOnly, permissions);

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;
  return (
    <>
      {permission ? (
        <div className="border-b border-dashed border-border-base mb-5 sm:mb-8 pb-8">
          <h1 className="text-lg font-semibold text-heading">
            {t('common:sidebar-nav-item-my-shops')}
          </h1>
        </div>
      ) : (
        ''
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 3xl:grid-cols-4 gap-5">
        {data?.me?.shops?.map((myShop: any, idx: number) => (
          <ShopCard shop={myShop} key={idx} />
        ))}
      </div>

      {!data?.me?.managed_shop && !data?.me?.shops?.length ? (
        <div className="flex flex-col items-center w-full p-10">
          <div className="relative h-auto min-h-[180px] w-[300px] sm:min-h-[370px] sm:w-[490px]">
            <NoShop />
          </div>
          <span className="mt-6 text-lg font-semibold text-center text-body-dark sm:mt-10">
            {t('common:text-no-shop')}
          </span>
        </div>
      ) : null}
      {!!data?.me?.managed_shop ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5">
          <ShopCard shop={data?.me?.managed_shop} />
        </div>
      ) : null}
    </>
  );
};

export default ShopList;
