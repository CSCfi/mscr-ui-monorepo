import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useStoreDispatch } from '@app/store';
import { useSelector } from 'react-redux';
import {
  selectSelectedTab,
  setSelectedTab,
} from '@app/common/components/content-view/content-view.slice';
import { useTranslation } from 'next-i18next';
import { Type } from '@app/common/interfaces/search.interface';
import { TabIndex, TabText, MscrTabs } from '@app/common/interfaces/tabmenu';
import { ReactNode } from 'react';

interface TabPanel {
  tabIndex: TabIndex;
  tabText: TabText;
  content: ReactNode;
}

interface TabMenuProps {
  contentType: Type;
  isRemoved?: boolean;
  tabPanels: TabPanel[];
}

export default function Tabmenu({
  contentType,
  isRemoved,
  tabPanels,
}: TabMenuProps) {
  const { t } = useTranslation('common');
  const dispatch = useStoreDispatch();
  const selectedTab = useSelector(selectSelectedTab());
  const translations = {
    'SCHEMA.metadata-and-files-tab': t('tabs.metadata-and-files'),
    'CROSSWALK.metadata-and-files-tab': t('tabs.metadata-and-files'),
    'SCHEMA.content-and-editor-tab': t('tabs.schema.content-and-editor-tab'),
    'CROSSWALK.content-and-editor-tab': t(
      'tabs.crosswalk.content-and-editor-tab'
    ),
    'SCHEMA.history-tab': t('tabs.history-tab'),
    'CROSSWALK.history-tab': t('tabs.history-tab'),
  };

  function customTabProps(tab: TabText) {
    const index = MscrTabs[tab];
    return {
      id: `simple-tab-tab-${index}`,
      'aria-controls': `simple-tab-tabpanel-${index}`,
      label: translations[`${contentType}.${tab}`],
    };
  }

  const handleChange = (event: React.SyntheticEvent, newValue: TabIndex) => {
    dispatch(setSelectedTab(newValue));
  };

  return (
    <>
      <Tabs
        value={selectedTab}
        onChange={handleChange}
        aria-label={t('tabs.label')}
      >
        <Tab {...customTabProps('metadata-and-files-tab')} />
        {!isRemoved && <Tab {...customTabProps('content-and-editor-tab')} />}
        {!isRemoved && <Tab {...customTabProps('history-tab')} />}
      </Tabs>
      {tabPanels.map((tab) => {
        return (
          <div
            key={tab.tabIndex}
            role="tabpanel"
            hidden={selectedTab !== tab.tabIndex}
            id={`simple-tab-tabpanel-${tab.tabIndex}`}
            aria-labelledby={`simple-tab-tab-${tab.tabIndex}`}
          >
            {selectedTab === tab.tabIndex && tab.content}
          </div>
        );
      })}
    </>
  );
}
