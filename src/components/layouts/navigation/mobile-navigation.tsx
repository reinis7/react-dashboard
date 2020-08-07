import { useUI } from '@/contexts/ui.context';
import DrawerWrapper from '@/components/ui/drawer-wrapper';
import Drawer from '@/components/ui/drawer';

const MobileNavigation: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { displaySidebar, closeSidebar } = useUI();

  return (
    <Drawer open={displaySidebar} onClose={closeSidebar} variant="left">
      <DrawerWrapper onClose={closeSidebar}>
        <div className="flex flex-col p-5 space-y-6">{children}</div>
      </DrawerWrapper>
    </Drawer>
  );
};
export default MobileNavigation;
