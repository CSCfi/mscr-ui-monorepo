import { FakeableUser } from 'yti-common-ui/interfaces/fakeable-user.interface';
import { default as CommonLayout } from './layout';
import { MscrUser } from '@app/common/interfaces/mscr-user.interface';
import Notification from '@app/common/components/notifications';

interface LayoutProps {
  user?: MscrUser | null;
  fakeableUsers?: FakeableUser[] | null;
  isActionMenu?: boolean;
  children: React.ReactNode;
}

export default function Layout({
  user,
  fakeableUsers,
  isActionMenu,
  children,
}: LayoutProps): React.ReactElement {
  return (
    <CommonLayout
      user={user ?? undefined}
      fakeableUsers={fakeableUsers ?? []}
      isActionMenu={isActionMenu ?? false}
      alerts={<Notification />}
    >
      {children}
    </CommonLayout>
  );
}
