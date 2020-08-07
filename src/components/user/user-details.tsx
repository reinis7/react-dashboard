import Image from 'next/image';
import { CheckMarkFill } from '@/components/icons/checkmark-circle-fill';
import { CloseFillIcon } from '@/components/icons/close-fill';
import { useMeQuery } from '@/graphql/me.graphql';
import { useTranslation } from 'next-i18next';
import Link from '@/components/ui/link';
import Loader from '@/components/ui/loader/loader';
import { siteSettings } from '@/settings/site.settings';
import { Routes } from '@/config/routes';

const UserDetails: React.FC = () => {
  const { t } = useTranslation('common');
  const { data, loading } = useMeQuery();
  if (loading) return <Loader text={t('text-loading')} />;

  return (
    <div className="flex h-full flex-col items-center p-5">
      <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-gray-200">
        <Image
          src={data?.me?.profile?.avatar?.thumbnail ?? siteSettings?.avatar?.placeholder}
          fill
          sizes="(max-width: 768px) 100vw"
          alt={data?.me?.name!}
        />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-heading">{data?.me?.name!}</h3>
      <p className="mt-1 text-sm text-muted">{data?.me?.email!}</p>
      {!data?.me?.profile! ? (
        <p className="mt-0.5 text-sm text-muted">
          {t('text-add-your')}{' '}
          <Link href={Routes.profileUpdate} className="text-accent underline">
            {t('authorized-nav-item-profile')}
          </Link>
        </p>
      ) : (
        <>
          <p className="mt-0.5 text-sm text-muted">{data?.me?.profile.contact}</p>
        </>
      )}
      <div className="mt-6 flex items-center justify-center rounded border border-gray-200 px-3 py-2 text-sm text-body-dark">
        {data?.me?.is_active ? (
          <CheckMarkFill width={16} className="text-accent me-2" />
        ) : (
          <CloseFillIcon width={16} className="text-red-500 me-2" />
        )}
        {data?.me?.is_active ? 'Enabled' : 'Disabled'}
      </div>
    </div>
  );
};
export default UserDetails;
