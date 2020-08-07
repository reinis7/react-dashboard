import { Fragment } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/layouts/navigation/top-navbar';
import { getAuthCredentials, hasAccess } from '@/utils/auth-utils';
import { siteSettings } from '@/settings/site.settings';
import SidebarItem from '@/components/layouts/navigation/sidebar-item';
import { useTranslation } from 'next-i18next';
import MobileNavigation from '@/components/layouts/navigation/mobile-navigation';

const ShopLayout: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    query: { shop },
    locale,
  } = router;

  const { permissions: currentUserPermissions } = getAuthCredentials();

  const SidebarItemMap = () => (
    <Fragment>
      {siteSettings.sidebarLinks.shop.map(
        ({ href, label, icon, permissions }) => {
          if (!hasAccess(permissions, currentUserPermissions)) return null;
          return (
            <SidebarItem
              key={label}
              href={href(shop?.toString()!)}
              label={t(label)}
              icon={icon}
            />
          );
        }
      )}
    </Fragment>
  );

  const dir = locale === 'ar' || locale === 'he' ? 'rtl' : 'ltr';

  return (
    <div
      className="flex flex-col min-h-screen transition-colors duration-150 bg-gray-100"
      dir={dir}
    >
      <Navbar />
      <MobileNavigation>
        <SidebarItemMap />
      </MobileNavigation>

      <div className="flex flex-1 pt-20">
        <aside className="fixed bottom-0 hidden h-full px-4 overflow-y-auto bg-white shadow w-72 xl:w-76 lg:block start-0 pt-22">
          <div className="flex flex-col py-3 space-y-6">
            <SidebarItemMap />
          </div>
        </aside>
        <main className="w-full lg:ps-72 xl:ps-76">
          <div className="h-full p-5 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
export default ShopLayout;
