import { KeyboardEvent, createRef, useEffect, useRef, useState } from 'react';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Button,
  HintText,
  IconListBulleted,
  IconListNumbered,
  IconAttachment,
  IconImage,
  Text,
} from 'suomifi-ui-components';
import DrawerContent from 'yti-common-ui/drawer/drawer-content-wrapper';
import StaticHeader from 'yti-common-ui/drawer/static-header';
import {
  ContentWrapper,
  ControlButton,
  ControlsRow,
  FullWidthTextarea,
  LanguageSelectorBtn,
  LanguageSelectorWrapper,
} from './documentation.styles';
import { useTranslation } from 'next-i18next';
import {
  selectDisplayLang,
  setHasChanges,
  useGetModelQuery,
  useUpdateModelMutation,
} from '@app/common/components/model/model.slice';
import { getLanguageVersion } from '@app/common/utils/get-language-version';
import generatePayload from '../model/generate-payload';
import { translateLanguage } from '@app/common/utils/translation-helpers';
import FormattedDate from 'yti-common-ui/formatted-date';
import { compareLocales } from '@app/common/utils/compare-locals';
import {
  getAddNewLine,
  getCurrentRowNumber,
  getLastValue,
  getRows,
  getSpecialCharacters,
  injectNewLine,
  injectNewListRow,
  injectSpecialCharacters,
  previousCharIsNewLine,
} from './utils';
import useConfirmBeforeLeavingPage from 'yti-common-ui/utils/hooks/use-confirm-before-leaving-page';
import { useStoreDispatch } from '@app/store';
import { useSelector } from 'react-redux';
import { setNotification } from '@app/common/components/notifications/notifications.slice';
import { TEXT_AREA_MAX } from 'yti-common-ui/utils/constants';
import { HeaderRow, StyledSpinner } from '@app/common/components/header';

export default function Documentation({
  modelId,
  languages,
}: {
  modelId: string;
  languages: string[];
}) {
  const { t, i18n } = useTranslation('admin');
  const { enableConfirmation, disableConfirmation } =
    useConfirmBeforeLeavingPage('disabled');
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useStoreDispatch();
  const textAreaRef = createRef<HTMLTextAreaElement>();
  const displayLang = useSelector(selectDisplayLang());
  const [headerHeight, setHeaderHeight] = useState(0);
  const [value, setValue] = useState<{ [key: string]: string }>({});
  const [isEdit, setIsEdit] = useState(false);
  const [userPosted, setUserPosted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(
    languages.sort((a, b) => compareLocales(a, b))[0]
  );
  const [realignCursor, setRealignCursor] = useState({
    still: false,
    align: 0,
  });
  const [selection, setSelection] = useState({
    start: 0,
    end: 0,
  });

  const { data: modelData, refetch } = useGetModelQuery(modelId);
  const [updateModel, result] = useUpdateModelMutation();

  const handleSubmit = () => {
    disableConfirmation();
    dispatch(setHasChanges(false));

    if (!modelData) {
      return;
    }

    setUserPosted(true);

    const payload = generatePayload({ ...modelData, documentation: value });

    updateModel({
      payload: payload,
      prefix: modelData.prefix,
      isApplicationProfile: modelData.type === 'PROFILE',
    });
  };

  const handleCancel = () => {
    setUserPosted(false);
    setIsEdit(false);
    setValue(
      modelData?.documentation
        ? Object.keys(modelData.documentation).length > 0
          ? modelData.documentation
          : modelData.languages.reduce(
              (acc, lang) => ({ ...acc, [lang]: '' }),
              {}
            )
        : {}
    );
    dispatch(setHasChanges(false));
    disableConfirmation();
  };

  const handleUpdate = (data: { [key: string]: string }) => {
    enableConfirmation();
    dispatch(setHasChanges(true));
    setValue(data);
  };

  const handleButtonClick = (key: string) => {
    const addNewLine = getAddNewLine(value[currentLanguage], selection.start);
    const elem = getSpecialCharacters(key, addNewLine);

    handleUpdate({
      ...value,
      [currentLanguage]: injectSpecialCharacters(
        value[currentLanguage],
        selection,
        elem
      ),
    });
  };

  const handleEnterClick = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const rows: string[] = getRows(target.value);
    const currRowNmb = getCurrentRowNumber(target.value, target.selectionStart);

    if (target.selectionStart === 0) {
      // If cursor is at the beginning of the text area allow normal enter key behaviour
      return;
    }

    if (
      rows[currRowNmb - 1].match(/\n?- /) ||
      rows[currRowNmb - 1].match(/\n?[0-9]+\. /)
    ) {
      e.preventDefault();

      if (previousCharIsNewLine(target.value, target.selectionStart)) {
        handleUpdate({
          ...value,
          [currentLanguage]: injectNewLine(rows, currRowNmb),
        });

        setRealignCursor({
          ...realignCursor,
          still: true,
        });

        return;
      }

      const listStart = rows[currRowNmb - 1].match(/\n?- /)
        ? '-'
        : `${getLastValue(rows[currRowNmb - 1])}.`;

      handleUpdate({
        ...value,
        [currentLanguage]: injectNewListRow(rows, currRowNmb, listStart),
      });
      setRealignCursor({
        ...realignCursor,
        align:
          listStart === '-'
            ? 3
            : 3 + getLastValue(rows[currRowNmb - 1]).toString()?.length ?? 0,
      });
    }
  };

  useEffect(() => {
    if (ref.current) {
      setHeaderHeight(ref.current.clientHeight);
    }
  }, [ref]);

  useEffect(() => {
    if (modelData) {
      if (Object.keys(modelData.documentation).length < 1) {
        setValue(
          modelData.languages.reduce(
            (acc, lang) => ({ ...acc, [lang]: '' }),
            {}
          )
        );
      } else {
        setValue(modelData.documentation);
      }

      setCurrentLanguage(
        modelData.languages.includes(i18n.language)
          ? i18n.language
          : [...modelData.languages].sort((a, b) => compareLocales(a, b))[0] ??
              'fi'
      );
    }
  }, [modelData, i18n.language]);

  useEffect(() => {
    if (result.isSuccess) {
      setIsEdit(false);
      setUserPosted(false);
      disableConfirmation();
      refetch();
      dispatch(setNotification('DOCUMENTATION_EDIT'));
    }
  }, [result, refetch, disableConfirmation, dispatch]);

  useEffect(() => {
    if (!textAreaRef.current) {
      return;
    }

    if (realignCursor.still) {
      textAreaRef.current.setSelectionRange(selection.start, selection.start);
      setRealignCursor({ ...realignCursor, still: false });
    }

    if (realignCursor.align > 0) {
      const newPos = selection.start + realignCursor.align;
      textAreaRef.current.setSelectionRange(newPos, newPos);
      setRealignCursor({ ...realignCursor, align: 0 });
    }
  }, [realignCursor, selection.start, textAreaRef]);

  return (
    <>
      <StaticHeader ref={ref}>
        <HeaderRow>
          <Text variant="bold">{t('documentation')}</Text>

          {isEdit ? (
            <div
              style={{
                display: 'flex',
                gap: '15px',
              }}
            >
              <Button onClick={() => handleSubmit()} id="submit-button">
                {userPosted ? (
                  <div role="alert">
                    <StyledSpinner
                      variant="small"
                      text={t('saving')}
                      textAlign="right"
                    />
                  </div>
                ) : (
                  <>{t('save')}</>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleCancel()}
                id="cancel-button"
              >
                {t('cancel-variant')}
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setIsEdit(true)}
              id="edit-button"
            >
              {t('edit')}
            </Button>
          )}
        </HeaderRow>
      </StaticHeader>

      {renderView()}
      {renderEdit()}
    </>
  );

  function renderView() {
    if (isEdit) {
      return <></>;
    }

    return (
      <DrawerContent height={headerHeight} spaced>
        <div>
          {t('updated')}: <FormattedDate date={modelData?.modified} />
          {modelData?.modifier.name ? `, ${modelData.modifier.name}` : ''}
        </div>
        <div>
          <ReactMarkdown remarkPlugins={[remarkGfm]} unwrapDisallowed={false}>
            {getLanguageVersion({
              data: modelData?.documentation,
              lang: displayLang ?? i18n.language,
            }) !== ''
              ? getLanguageVersion({
                  data: modelData?.documentation,
                  lang: displayLang ?? i18n.language,
                  appendLocale: true,
                })
              : ''}
          </ReactMarkdown>
        </div>
      </DrawerContent>
    );
  }

  function renderEdit() {
    if (!isEdit) {
      return <></>;
    }

    return (
      <DrawerContent height={headerHeight} spaced>
        <LanguageSelectorWrapper>
          {modelData &&
            [...modelData.languages]
              .sort((a, b) => compareLocales(a, b))
              .map((lang) => (
                <LanguageSelectorBtn
                  key={lang}
                  variant="secondaryNoBorder"
                  $active={currentLanguage === lang}
                  onClick={() => setCurrentLanguage(lang)}
                  id="language-selector-button"
                >
                  {translateLanguage(lang, t)}
                </LanguageSelectorBtn>
              ))}
        </LanguageSelectorWrapper>

        <ContentWrapper>
          <div>
            {/* First 3 buttons use chars instead of Icons because they aren't available yet */}
            <ControlsRow>
              <div>
                <ControlButton
                  onClick={() => handleButtonClick('bold')}
                  id="bold-button"
                >
                  B
                </ControlButton>
                <ControlButton
                  onClick={() => handleButtonClick('italic')}
                  id="italic-button"
                >
                  I
                </ControlButton>
                <ControlButton
                  onClick={() => handleButtonClick('quote')}
                  id="quote-button"
                >
                  ``
                </ControlButton>
                <ControlButton
                  onClick={() => handleButtonClick('listBulleted')}
                  id="list-bulleted-button"
                >
                  <IconListBulleted />
                </ControlButton>
                <ControlButton
                  onClick={() => handleButtonClick('listNumbered')}
                  id="list-numbered-button"
                >
                  <IconListNumbered />
                </ControlButton>
                <ControlButton
                  onClick={() => handleButtonClick('link')}
                  id="link-button"
                >
                  <IconAttachment />
                </ControlButton>
                <ControlButton
                  onClick={() => handleButtonClick('image')}
                  id="image-button"
                >
                  <IconImage />
                </ControlButton>
              </div>
              <HintText>
                {value[currentLanguage]?.length ?? 0} / 5000 {t('characters')}
              </HintText>
            </ControlsRow>

            <FullWidthTextarea
              ref={textAreaRef}
              labelText=""
              labelMode="hidden"
              value={value[currentLanguage] ?? ''}
              onChange={(e) =>
                handleUpdate({
                  ...value,
                  [currentLanguage]: e.target.value ?? '',
                })
              }
              onKeyUp={(e) =>
                setSelection({
                  start: (e.target as HTMLTextAreaElement).selectionStart ?? 0,
                  end: (e.target as HTMLTextAreaElement).selectionEnd ?? 0,
                })
              }
              onClickCapture={(e) =>
                setSelection({
                  start: (e.target as HTMLTextAreaElement).selectionStart,
                  end: (e.target as HTMLTextAreaElement).selectionEnd,
                })
              }
              onKeyDown={(e) => e.key === 'Enter' && handleEnterClick(e)}
              id="documentation-textarea"
              maxLength={TEXT_AREA_MAX}
            />
          </div>

          <div>
            <div>
              <Text variant="bold" smallScreen>
                {t('preview')}
              </Text>
            </div>
            <ReactMarkdown remarkPlugins={[remarkGfm]} unwrapDisallowed={false}>
              {value[currentLanguage]}
            </ReactMarkdown>
          </div>
        </ContentWrapper>
      </DrawerContent>
    );
  }
}
