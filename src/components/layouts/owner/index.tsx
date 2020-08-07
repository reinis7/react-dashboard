import Navbar from '@/components/layouts/navigation/top-navbar';
import OwnerInformation from '@/components/user/user-details';
import MobileNavigation from '@/components/layouts/navigation/mobile-navigation';
import { useRouter } from 'next/router';

const OwnerLayout: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { locale } = useRouter();
  const dir = locale === 'ar' || locale === 'he' ? 'rtl' : 'ltr';
  return (
    <div
      className="flex flex-col min-h-screen transition-colors duration-150 bg-gray-100"
      dir={dir}
    >
      <Navbar />
      <MobileNavigation>
        <OwnerInformation />
      </MobileNavigation>

      <div className="flex flex-1 pt-20">
        <aside className="fixed bottom-0 hidden h-full px-4 overflow-y-auto bg-white shadow w-72 xl:w-76 lg:block start-0 pt-22">
          <OwnerInformation />
        </aside>
        <main className="w-full lg:ps-72 xl:ps-76">
          <div className="h-full p-5 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
export default OwnerLayout;
