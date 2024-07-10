import { FakeableUser } from 'yti-common-ui/interfaces/fakeable-user.interface';
import { default as CommonLayout } from './layout';
import { MscrUser } from '@app/common/interfaces/mscr-user.interface';
import Notification from '@app/common/components/notifications';

interface LayoutProps {
  user?: MscrUser | null;
  sideNavigationHidden?: boolean;
  fakeableUsers?: FakeableUser[] | null;
  children: React.ReactNode;
}

export default function Layout({
  user,
  sideNavigationHidden,
  fakeableUsers,
  children,
}: LayoutProps): React.ReactElement {
  return (
    <CommonLayout
      user={user ?? undefined}
      sideNavigationHidden={sideNavigationHidden ?? false}
      fakeableUsers={fakeableUsers ?? []}
      alerts={<Notification />}
    >
      {children}
    </CommonLayout>
  );
}
