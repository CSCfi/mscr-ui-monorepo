import { useTranslation } from 'next-i18next';
import GenericTable from '@app/common/components/generic-table';
import * as React from 'react';
import { SchemaFileData } from '@app/common/interfaces/schema.interface';
import { FilesRow } from '@app/common/interfaces/crosswalk.interface';
import { useEffect, useState } from 'react';
import router from 'next/router';

export enum DownloadTypes {
  'CROSSWALK',
  'GENERATED_SCHEMA',
  'ORIGINAL_CROSSWALK',
  'ORIGINAL_SCHEMA',
  'SCHEMA_FILES',
  'CROSSWALK_FILES',
}

const BASEURL = '/datamodel-api/v2';

export default function MetadataFilesTable({
  filesRowInput,
  pid,
  crosswalkData,
  canEdit,
}: {
  filesRowInput?: SchemaFileData[] | undefined;
  crosswalkData?: any | undefined;
  pid?: string | undefined;
  canEdit: boolean;
}) {
  const { t } = useTranslation('common');
  const lang = router.locale ?? 'en';

  const [autoGeneratedFilesTable, setAutoGeneratedFilesTable] = useState<
    FilesRow[]
  >([]);

  useEffect(() => {
    generateFilesData(crosswalkData);
  }, [crosswalkData]);

  const [uploadedFilesTable, setUploadedFilesTable] = useState<FilesRow[]>([]);

  function generateDownloadUrl(
    fileType: DownloadTypes,
    pid: string,
    fileId?: string,
  ) {
    switch (fileType) {
      case DownloadTypes.CROSSWALK: {
        return BASEURL + '/crosswalk/' + pid + '/mapping';
      }
      case DownloadTypes.GENERATED_SCHEMA: {
        return BASEURL + '/schema/' + pid + '/internal';
      }
      case DownloadTypes.ORIGINAL_CROSSWALK: {
        return BASEURL + '/crosswalk/' + pid + '/original';
      }
      case DownloadTypes.ORIGINAL_SCHEMA: {
        return BASEURL + '/schema/' + pid + '/original';
      }
      case DownloadTypes.SCHEMA_FILES: {
        return (
          BASEURL + '/schema/' + pid + '/files/' + fileId + '?download=true'
        );
      }
      case DownloadTypes.CROSSWALK_FILES: {
        return (
          BASEURL + '/crosswalk/' + pid + '/files/' + fileId + '?download=true'
        );
      }
      default: {
        return '';
      }
    }
  }

  function generateDownloadLink(url: string) {
    return <a href={url}>Download</a>;
  }

  function generateFilesData(crosswalkData: any) {
    const autoGeneratedTable: FilesRow[] = [];
    const uploadedFilesTable: FilesRow[] = [];
    if (crosswalkData?.format) {
      if (crosswalkData.format === 'MSCR') {
        autoGeneratedTable.push({
          name: crosswalkData?.label[lang] ? crosswalkData?.label[lang] : '',
          added: crosswalkData?.created ? crosswalkData.created : '',
          format: 'MSCR',
          file: crosswalkData?.pid
            ? generateDownloadLink(
                generateDownloadUrl(
                  DownloadTypes.CROSSWALK,
                  crosswalkData?.pid,
                ),
              )
            : '',
        });
      }
      setAutoGeneratedFilesTable(autoGeneratedTable);
    }

    if (crosswalkData?.format && crosswalkData.format !== 'MSCR' && pid) {
      let filesMetadata = [];
      filesMetadata = crosswalkData.fileMetadata;

      filesMetadata.forEach((item: any) => {
        uploadedFilesTable.push({
          name: item?.filename,
          added: crosswalkData?.modified ? crosswalkData?.modified : '',
          format: crosswalkData?.format ? crosswalkData?.format : '',
          file: item?.filename
            ? generateDownloadLink(
                generateDownloadUrl(DownloadTypes.ORIGINAL_CROSSWALK, pid),
              )
            : '',
        });
      });
      /*      uploadedFilesTable.push({
        name: 'Original source schema file',
        added: crosswalkData?.modified ? crosswalkData?.modified : '',
        format: 'N/A',
        file: crosswalkData?.pid ? generateDownloadLink(generateDownloadUrl(crosswalkData?.pid + '_schema.json', DownloadType.GENERATED_SCHEMA)) : '',
      });*/
      setUploadedFilesTable(uploadedFilesTable);
    }
  }

  let tableRows;
  if (filesRowInput && pid) {
    tableRows = filesRowInput.map(
      (item: {
        filename: any;
        fileID: Number;
        contentType: any;
        size: Number;
      }) => {
        const downloadType = crosswalkData
          ? DownloadTypes.CROSSWALK_FILES
          : DownloadTypes.SCHEMA_FILES;
        const row = {
          filename: item.filename,
          format: item.contentType,
          size: item.size,
          downloadLink: generateDownloadLink(
            generateDownloadUrl(downloadType, pid, item.fileID.toString()),
          ),
        };
        return row;
      },
    );
  }

  return (
    <>
      <div className="crosswalk-editor metadata-and-files-wrap mx-2">
        {filesRowInput && filesRowInput.length > 0 && (
          <GenericTable
            items={tableRows}
            headings={[
              t('metadata.file.name'),
              t('metadata.file.format'),
              t('metadata.file.size'),
              'File',
            ]}
            caption={t('metadata.file.label')}
          ></GenericTable>
        )}
        {autoGeneratedFilesTable.length > 0 && (
          <GenericTable
            items={autoGeneratedFilesTable}
            headings={[]}
            caption={'Auto-generated files'}
          ></GenericTable>
        )}
        <br />
        {uploadedFilesTable.length > 0 && (
          <GenericTable
            items={uploadedFilesTable}
            headings={[]}
            caption={'Uploaded files'}
          ></GenericTable>
        )}
        <br />
      </div>
    </>
  );
}
