import { NewTerminologyInfo } from '@app/common/interfaces/new-terminology-info';
import { v4 } from 'uuid';

export const TerminologyDataInitialState: NewTerminologyInfo = {
  contact: '',
  languages: [
    {
      labelText: 'en',
      uniqueItemId: 'en',
      title: '',
      description: '',
      selected: true,
    },
  ],
  infoDomains: [
    {
      groupId: '7f4cb68f-31f6-4bf9-b699-9d72dd110c4c',
      labelText: 'Consumer matters',
      name: 'Consumer matters',
      uniqueItemId: 'f98ed822-18e3-3fa0-b415-d3452c2c64a1',
    },
  ],
  contributors: [
    {
      labelText: 'contributor',
      name: 'mscr',
      organizationId: '7d3a3c00-5a6b-489b-a3ed-63bb58c26a63',
      uniqueItemId: '7d3a3c00-5a6b-489b-a3ed-63bb58c26a63',
    },
  ],
  prefix: [v4().slice(0, 8), true],
  type: 'TERMINOLOGICAL_VOCABULARY',
};
