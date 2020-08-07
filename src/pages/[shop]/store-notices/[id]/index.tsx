import Layout from '@/components/layouts/owner';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useStoreNoticeQuery } from '@/graphql/store-notice.graphql';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import {
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { IosArrowLeft } from '@/components/icons/ios-arrow-left';
import { useMyShopsQuery, useShopQuery } from '@/graphql/shops.graphql';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const OwnerStoreNoticePage = () => {
  const { query, locale } = useRouter();
  const { t } = useTranslation();
  const router = useRouter();
  const { permissions } = getAuthCredentials();
  const { data: myShop } = useMyShopsQuery();
  const { data: shopData } = useShopQuery({
    variables: {
      slug: query.shop as string,
    },
  });
  const shopId = shopData?.shop?.id!;
  const { data, loading, error } = useStoreNoticeQuery({
    variables: {
      id: query.id as string,
      language: locale,
    },
    fetchPolicy: 'network-only',
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  let classes = {
    title: 'font-semibold',
    content: 'text-sm font-normal text-[#212121]',
  };

  if (
    !hasAccess(adminOnly, permissions) &&
    !myShop?.me?.shops?.map((shop: any) => shop.id).includes(shopId) &&
    myShop?.me?.managed_shop?.id != shopId
  ) {
    router.replace(Routes.dashboard);
  }

  return (
    <div className="px-8 py-10 bg-white rounded shadow">
      <div className="mb-5">
        <Link
          href={`${Routes?.dashboard}?tab=2`}
          className="flex items-center font-bold no-underline transition-colors duration-200 text-accent ms-1 hover:text-accent-hover hover:underline focus:text-accent-700 focus:no-underline focus:outline-none"
        >
          <IosArrowLeft height={12} width={15} className="mr-2.5" />
          {t('common:text-back-to-home')}
        </Link>
      </div>
      <h3 className="mb-6 text-[22px] font-bold">
        {data?.storeNotice?.notice}
      </h3>

      <p className="mb-6 text-[15px] leading-[1.75em] text-[#5A5A5A]">
        {data?.storeNotice?.description}
      </p>

      <ul className={`space-y-3.5 ${classes?.content}`}>
        <li>
          <strong className={classes?.title}>
            {t('notice-active-date')}:{' '}
          </strong>
          {dayjs(data?.storeNotice?.effective_from).format('DD MMM YYYY')}
        </li>
        <li>
          <strong className={classes?.title}>
            {t('notice-expire-date')}:{' '}
          </strong>
          {dayjs(data?.storeNotice?.expired_at).format('DD MMM YYYY')}
        </li>
        <li>
          <strong className={classes?.title}>{t('notice-created-by')}: </strong>
          {data?.storeNotice?.creator_role}
        </li>
      </ul>
    </div>
  );
};

OwnerStoreNoticePage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
OwnerStoreNoticePage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});

export default OwnerStoreNoticePage;
