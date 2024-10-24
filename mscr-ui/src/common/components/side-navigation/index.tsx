import Link from 'next/link';
import { ActionMenuItem, Heading, RouterLink } from 'suomifi-ui-components';
import { IconChevronDown, IconChevronUp } from 'suomifi-icons';
import { useBreakpoints } from 'yti-common-ui/media-query';
import Tooltip from '@mui/material/Tooltip';
import {
  NavigationHeading,
  SideNavigationWrapper,
  MscrSideNavigationLevel2,
  MscrSideNavigationLevel3,
  PersonalNavigationWrapper,
  MscrSideNavigation,
  MscrSideNavigationLevel1,
  GroupButton,
  ExpanderButton,
  MinimizedNavigationWrapper,
  ExpanderIcon,
  GroupNavIcon,
  MinimizedGroupItem,
  MinimizedGroupList,
  PopoverNavigationMenu,
} from './side-navigation.styles';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { MscrUser } from '@app/common/interfaces/mscr-user.interface';
import getOrganizations from '@app/common/utils/get-organizations';
import { useStoreDispatch } from '@app/store';
import { useSelector } from 'react-redux';
import {
  selectIsSideNavigationMinimized,
  setIsSideNavigationMinimized,
} from '@app/common/components/navigation/navigation.slice';
import { resetContentView } from '@app/common/components/content-view/content-view.slice';
import useUrlState from '@app/common/utils/hooks/use-url-state';

export default function SideNavigationPanel({ user }: { user?: MscrUser }) {
  const { breakpoint } = useBreakpoints();
  const { t } = useTranslation('common');
  const { resetUrlState } = useUrlState();
  const router = useRouter();
  const lang = router.locale ?? '';
  const dispatch = useStoreDispatch();
  const isSidebarMinimized = useSelector(selectIsSideNavigationMinimized());
  const [isFirstPageLoad, setFirstPageLoad] = useState(true);
  const [openGroup, setOpenGroup] = useState([
    router.query['homepage']?.toString() ?? '',
  ]);
  // Paths for now
  const personalSchemasPath = '/personal/schemas';
  const personalCrosswalksPath = '/personal/crosswalks';
  // group urls have the group id instead of 'personal'
  const organizations = getOrganizations(user?.organizations, lang);

  const handleClickMinimizeButton = () => {
    dispatch(setIsSideNavigationMinimized(!isSidebarMinimized));
    setFirstPageLoad(false);
  };

  const handleNavigate = (isPersonal?: boolean) => {
    if (isPersonal) {
      setOpenGroup([]);
    }
    resetUrlState();
    dispatch(resetContentView());
  };

  const handleClickGroup = (groupId: string) => {
    if (router.asPath.startsWith('/' + groupId)) {
      return;
    }
    if (openGroup.includes(groupId)) {
      const newOpenGroup = openGroup.filter((id) => id !== groupId);
      setOpenGroup(newOpenGroup);
      return;
    } else {
      setOpenGroup(openGroup.concat([groupId]));
    }
  };

  const expandedMenu = () => {
    return (
      <MscrSideNavigation
        heading=""
        aria-label={t('workspace.navigation')}
        className={
          !isSidebarMinimized && !isFirstPageLoad
            ? 'sidebar-animate-fadein'
            : isSidebarMinimized
              ? 'sidebar-animate-fadeout'
              : undefined
        }
      >
        <MscrSideNavigationLevel1
          subLevel={1}
          expanded
          content={
            <NavigationHeading variant="h2">
              {t('workspace.personal')}
            </NavigationHeading>
          }
        >
          <PersonalNavigationWrapper>
            <MscrSideNavigationLevel3
              className="personal"
              subLevel={3}
              selected={router.asPath.startsWith(personalCrosswalksPath)}
              content={
                <Link
                  onClick={() => handleNavigate(true)}
                  href={personalCrosswalksPath}
                  passHref
                >
                  <RouterLink>{t('workspace.crosswalks')}</RouterLink>
                </Link>
              }
            />
            <MscrSideNavigationLevel3
              className="personal"
              subLevel={3}
              selected={router.asPath.startsWith(personalSchemasPath)}
              content={
                <Link
                  onClick={() => handleNavigate(true)}
                  href={personalSchemasPath}
                  passHref
                >
                  <RouterLink>{t('workspace.schemas')}</RouterLink>
                </Link>
              }
            />
          </PersonalNavigationWrapper>
        </MscrSideNavigationLevel1>
        <MscrSideNavigationLevel1
          subLevel={1}
          expanded
          content={
            <NavigationHeading variant="h2">
              {t('workspace.group')}
            </NavigationHeading>
          }
        >
          {organizations?.map((group) => (
            <MscrSideNavigationLevel2
              key={group.id}
              subLevel={2}
              selected={openGroup.includes(group.id)}
              className={openGroup.includes(group.id) ? 'group-selected' : ''}
              content={
                <GroupButton onClick={() => handleClickGroup(group.id)}>
                  <Heading variant="h3">{group.label}</Heading>
                  {openGroup.includes(group.id) && <IconChevronUp />}
                  {!openGroup.includes(group.id) && <IconChevronDown />}
                </GroupButton>
              }
            >
              <MscrSideNavigationLevel3
                className="group"
                subLevel={3}
                selected={router.asPath.startsWith(
                  '/' + group.id + '/crosswalks'
                )}
                content={
                  <Link
                    onClick={() => handleNavigate()}
                    href={'/' + group.id + '/crosswalks'}
                    passHref
                  >
                    <RouterLink>{t('workspace.crosswalks')}</RouterLink>
                  </Link>
                }
              />
              <MscrSideNavigationLevel3
                className="group"
                subLevel={3}
                selected={router.asPath.startsWith('/' + group.id + '/schemas')}
                content={
                  <Link
                    onClick={() => handleNavigate()}
                    href={'/' + group.id + '/schemas'}
                    passHref
                  >
                    <RouterLink>{t('workspace.schemas')}</RouterLink>
                  </Link>
                }
              />
            </MscrSideNavigationLevel2>
          ))}
        </MscrSideNavigationLevel1>
      </MscrSideNavigation>
    );
  };

  const minimizedMenu = () => {
    return (
      <div>
        <MinimizedNavigationWrapper
          className={
            isSidebarMinimized && !isFirstPageLoad
              ? 'sidebar-animate-fadein'
              : !isSidebarMinimized
                ? 'sidebar-animate-fadeout'
                : undefined
          }
        >
          <PopoverNavigationMenu
            className="personal"
            buttonText="P"
            iconRight={<IconChevronDown />}
          >
            <ActionMenuItem key="crosswalks">
              <Link
                onClick={() => handleNavigate(true)}
                href={personalCrosswalksPath}
                passHref
              >
                {t('workspace.crosswalks')}
              </Link>
            </ActionMenuItem>
            <ActionMenuItem key="schemas">
              <Link
                onClick={() => handleNavigate(true)}
                href={personalSchemasPath}
                passHref
              >
                {t('workspace.schemas')}
              </Link>
            </ActionMenuItem>
          </PopoverNavigationMenu>
          <GroupNavIcon>
            <p>G</p>
          </GroupNavIcon>
          <MinimizedGroupList>
            {organizations.map((group) => (
              <MinimizedGroupItem key={group.id}>
                <PopoverNavigationMenu
                  className="group"
                  buttonText={group.label.substring(0, 2).toUpperCase()}
                  iconRight={<IconChevronDown />}
                >
                  <ActionMenuItem key={`${group.id}-crosswalks`}>
                    <Link
                      onClick={() => {
                        handleNavigate();
                        setOpenGroup([group.id]);
                      }}
                      href={`/${group.id}/crosswalks`}
                      passHref
                    >
                      {t('workspace.crosswalks')}
                    </Link>
                  </ActionMenuItem>
                  <ActionMenuItem key={`${group.id}-schemas`}>
                    <Link
                      onClick={() => {
                        handleNavigate();
                        setOpenGroup([group.id]);
                      }}
                      href={`/${group.id}/schemas`}
                      passHref
                    >
                      {t('workspace.schemas')}
                    </Link>
                  </ActionMenuItem>
                </PopoverNavigationMenu>
              </MinimizedGroupItem>
            ))}
          </MinimizedGroupList>
        </MinimizedNavigationWrapper>
      </div>
    );
  };

  return (
    <SideNavigationWrapper
      $breakpoint={breakpoint}
      $isSidebarMinimized={isSidebarMinimized}
    >
      {isSidebarMinimized && minimizedMenu()}
      {!isSidebarMinimized && expandedMenu()}
      <Tooltip
        title={
          isSidebarMinimized
            ? t('click-to-expand-sidebar')
            : t('click-to-minimize-sidebar')
        }
        placement="right"
      >
        <ExpanderButton onClick={() => handleClickMinimizeButton()}>
          <ExpanderIcon />
        </ExpanderButton>
      </Tooltip>
    </SideNavigationWrapper>
  );
}
