import { NewTerminologyInfo } from '@app/common/interfaces/new-terminology-info';
import { v4 } from 'uuid';

export const TerminologyDataInitialState: NewTerminologyInfo = {
  contact: '',
  languages: [
        {
          labelText: 'en',
          uniqueItemId: 'en',
          title: 'en',
          description: '',
          selected: true,
        }    
  ],
  infoDomains: [],
  contributors: [],
  prefix: [v4().slice(0, 8), true],
  type: 'TERMINOLOGICAL_VOCABULARY',
};
