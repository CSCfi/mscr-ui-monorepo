import { Container } from '@mui/system';
import { SearchScreenWrapper } from './search-screen.styles';
import { useBreakpoints } from 'yti-common-ui/media-query';
import { useState, useContext } from 'react';
import { SearchContext } from '@app/pages/[homepage]';
import { Button } from 'suomifi-ui-components';
import SearchFilterBar from '@app/common/components/search-filter-bar';
import SearchResults from '@app/common/components/search-results';

// export default function SearchScreen(toggleDisplayFunction: () => {}) {
export default function SearchScreen() {
  const { breakpoint } = useBreakpoints();

  const { isSearchScreenVisible, setSearchScreenVisible } =
    useContext(SearchContext);

  const toggleVisibility = () => {
    setSearchScreenVisible(!isSearchScreenVisible);
  };

  //   const [searchResults, setSearchResults] = useState([]);
  const [searchResults, setSearchResults] = useState(data);

  const fetchData = () => {
    // fetch('http://localhost:9004/datamodel-api/v2/frontend/mscrSearch')
    // fetch('http://127.0.0.1:9004/datamodel-api/v2/frontend/mscrSearch')
    fetch('http://127.0.0.1:9004/datamodel-api/v2/frontend/mscrSearch')
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setSearchResults(data);
      });
  };

  return (
    <SearchScreenWrapper $breakpoint={breakpoint}>
      <Button
        style={{
          top: '0px',
          right: '0px',
          position: 'absolute',
          //   display: 'flex',
          //   flexDirection: 'row-reverse',
        }}
        onClick={toggleVisibility}
      >
        toggle visibility
      </Button>
      <Button style={{ position: 'absolute' }} onClick={fetchData}>
        Fetch data
      </Button>
      <SearchFilterBar searchResults={searchResults} />
      <SearchResults searchResults={searchResults} />
    </SearchScreenWrapper>
  );
}

const data = {
  took: 2,
  timed_out: false,
  _shards: {
    total: 1,
    successful: 1,
    skipped: 0,
    failed: 0,
  },
  hits: {
    total: {
      value: 8,
      relation: 'eq',
    },
    max_score: 1,
    hits: [
      {
        _index: 'models_v2',
        _id: 'urn%3AIAMNOTAPID%3Ae6d55117-1117-4192-9c4f-6d1ef4f9ddf0',
        _score: 1,
        _source: {
          id: 'urn:IAMNOTAPID:e6d55117-1117-4192-9c4f-6d1ef4f9ddf0',
          label: {
            en: 'Biology schema',
          },
          status: 'INCOMPLETE',
          modified: '2023-06-22T06:48:04.906Z',
          created: '2023-06-22T06:48:04.906Z',
          contentModified: '2023-06-22T06:48:04.906Z',
          type: 'SCHEMA',
          prefix: 'urn:IAMNOTAPID:e6d55117-1117-4192-9c4f-6d1ef4f9ddf0',
          comment: {
            en: 'Biology description',
          },
          contributor: ['7d3a3c00-5a6b-489b-a3ed-63bb58c26a63'],
          isPartOf: [],
          language: ['en'],
        },
      },
      {
        _index: 'models_v2',
        _id: 'urn%3AIAMNOTAPID%3A62ae6e1d-a38a-487f-bfc4-29e7fd35cc16',
        _score: 1,
        _source: {
          id: 'urn:IAMNOTAPID:62ae6e1d-a38a-487f-bfc4-29e7fd35cc16',
          label: {
            en: 'Mechanics schema',
          },
          status: 'VALID',
          modified: '2023-06-22T14:18:06.563Z',
          created: '2023-06-22T14:18:06.563Z',
          contentModified: '2023-06-22T14:18:06.563Z',
          type: 'SCHEMA',
          prefix: 'urn:IAMNOTAPID:62ae6e1d-a38a-487f-bfc4-29e7fd35cc16',
          comment: {
            en: 'Mechanics description',
          },
          contributor: ['7d3a3c00-5a6b-489b-a3ed-63bb58c26a63'],
          isPartOf: [],
          language: ['en'],
        },
      },
      {
        _index: 'models_v2',
        _id: 'urn%3AIAMNOTAPID%3A35d37410-5b1c-428c-98c7-f97539f991fd',
        _score: 1,
        _source: {
          id: 'urn:IAMNOTAPID:35d37410-5b1c-428c-98c7-f97539f991fd',
          label: {
            en: 'Physics schema',
          },
          status: 'VALID',
          modified: '2023-06-22T13:32:29.449Z',
          created: '2023-06-22T13:32:29.449Z',
          contentModified: '2023-06-22T13:32:29.449Z',
          type: 'SCHEMA',
          prefix: 'urn:IAMNOTAPID:35d37410-5b1c-428c-98c7-f97539f991fd',
          comment: {
            en: 'Physics description',
          },
          contributor: ['7d3a3c00-5a6b-489b-a3ed-63bb58c26a63'],
          isPartOf: [],
          language: ['en'],
        },
      },
      {
        _index: 'models_v2',
        _id: 'urn%3AIAMNOTAPID%3A3484146d-f2d2-4552-bfde-e42ec7de0e52',
        _score: 1,
        _source: {
          id: 'urn:IAMNOTAPID:3484146d-f2d2-4552-bfde-e42ec7de0e52',
          label: {
            en: 'Design schema',
          },
          status: 'VALID',
          modified: '2023-06-22T13:25:47.493Z',
          created: '2023-06-22T13:25:47.493Z',
          contentModified: '2023-06-22T13:25:47.493Z',
          type: 'SCHEMA',
          prefix: 'urn:IAMNOTAPID:3484146d-f2d2-4552-bfde-e42ec7de0e52',
          comment: {
            en: 'Design description',
          },
          contributor: ['7d3a3c00-5a6b-489b-a3ed-63bb58c26a63'],
          isPartOf: [],
          language: ['en'],
        },
      },
      {
        _index: 'models_v2',
        _id: 'urn%3AIAMNOTAPID%3A2cae333e-882b-4bad-80dd-762f2d34c6bf',
        _score: 1,
        _source: {
          id: 'urn:IAMNOTAPID:2cae333e-882b-4bad-80dd-762f2d34c6bf',
          label: {
            en: 'Metadata schema',
          },
          status: 'INCOMPLETE',
          modified: '2023-06-16T07:19:57.072Z',
          created: '2023-06-16T07:19:57.072Z',
          contentModified: '2023-06-16T07:19:57.072Z',
          type: 'SCHEMA',
          prefix: 'urn:IAMNOTAPID:2cae333e-882b-4bad-80dd-762f2d34c6bf',
          comment: {
            en: 'Metadata description',
          },
          contributor: ['7d3a3c00-5a6b-489b-a3ed-63bb58c26a63'],
          isPartOf: [],
          language: ['en'],
        },
      },
      {
        _index: 'models_v2',
        _id: 'urn%3AIAMNOTAPID%3A287a3d46-ed7b-454d-a6a5-9765b7c34baa',
        _score: 1,
        _source: {
          id: 'urn:IAMNOTAPID:287a3d46-ed7b-454d-a6a5-9765b7c34baa',
          label: {
            // this is the TITLE
            en: 'Crosswalk schema', // change
          },
          status: 'VALID',
          modified: '2023-06-22T06:48:53.45Z',
          created: '2023-06-22T06:48:53.45Z',
          contentModified: '2023-06-22T06:48:53.45Z',
          type: 'SCHEMA', // for the ICON
          prefix: 'urn:IAMNOTAPID:287a3d46-ed7b-454d-a6a5-9765b7c34baa',
          comment: {
            // this is the DESCRIPTION
            en: 'Crosswalk description', // change
            // + add static FRONTEND ONLY tags/labels
          },
          contributor: ['7d3a3c00-5a6b-489b-a3ed-63bb58c26a63'],
          isPartOf: [],
          language: ['en'],
        },
      },
      {
        _index: 'models_v2',
        _id: 'urn%3AIAMNOTAPID%3A88c905e5-5c0b-4eda-801e-4f26318556bf',
        _score: 1,
        _source: {
          id: 'urn:IAMNOTAPID:88c905e5-5c0b-4eda-801e-4f26318556bf',
          label: {
            en: 'Registry schema',
          },
          status: 'VALID',
          modified: '2023-06-22T14:11:56.546Z',
          created: '2023-06-22T14:11:56.546Z',
          contentModified: '2023-06-22T14:11:56.546Z',
          type: 'SCHEMA',
          prefix: 'urn:IAMNOTAPID:88c905e5-5c0b-4eda-801e-4f26318556bf',
          comment: {
            en: 'Registry description',
          },
          contributor: ['7d3a3c00-5a6b-489b-a3ed-63bb58c26a63'],
          isPartOf: [],
          language: ['en'],
        },
      },
      {
        _index: 'models_v2',
        _id: 'urn%3AIAMNOTAPID%3A9291d5b8-a0fe-4b9c-9b8b-5361034d5377',
        _score: 1,
        _source: {
          id: 'urn:IAMNOTAPID:9291d5b8-a0fe-4b9c-9b8b-5361034d5377',
          label: {
            en: 'The Title',
          },
          status: 'VALID',
          modified: '2023-06-22T13:20:30.403Z',
          created: '2023-06-22T13:20:30.403Z',
          contentModified: '2023-06-22T13:20:30.403Z',
          type: 'SCHEMA',
          prefix: 'urn:IAMNOTAPID:9291d5b8-a0fe-4b9c-9b8b-5361034d5377',
          comment: {
            en: 'The description description description description description',
          },
          contributor: ['7d3a3c00-5a6b-489b-a3ed-63bb58c26a63'],
          isPartOf: [],
          language: ['en'],
        },
      },
    ],
  },
  aggregations: {
    languages: {
      doc_count_error_upper_bound: 0,
      sum_other_doc_count: 0,
      buckets: [
        {
          key: 'en',
          doc_count: 8,
        },
      ],
    },
  },
};
