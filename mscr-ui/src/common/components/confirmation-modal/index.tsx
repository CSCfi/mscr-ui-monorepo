import { useTranslation } from 'next-i18next';
import { Button, ModalFooter, Paragraph, Text } from 'suomifi-ui-components';
import {KeyboardEvent, MouseEvent, useEffect, useState} from 'react';
import { useRouter } from 'next/router';
import { useBreakpoints } from 'yti-common-ui/components/media-query';
import {
  ModalContentSmPadding,
  ModalStyled,
  ModalTitleH1,
} from 'yti-common-ui/components/login-modal/login-modal.styles';
import {CrosswalkConnectionNew} from "@app/common/interfaces/crosswalk-connection.interface";

export default function ConfirmModal(props: { isVisible: boolean; heading: string, text1: string, text2?:string, actionName: string, actionText: string, cancelText: string, performConfirmModalAction: any}) {
  const { isSmall } = useBreakpoints();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(props.isVisible);
    console.log('effect', props)
  }, [props.isVisible]);

  function performAction(isCloseAction: boolean) {
    setVisible(false);
    if (isCloseAction) {
      props.performConfirmModalAction('close');
    } else {
      props.performConfirmModalAction(props.actionName);
    }
  }

  return (
    <>
      <ModalStyled
        appElementId="__next"
        visible={visible}
        variant={isSmall ? 'smallScreen' : 'default'}
        onEscKeyDown={() => setVisible(false)}
        scrollable={false}
      >
        <ModalContentSmPadding>
          <ModalTitleH1 as={'h1'}>{props.heading}</ModalTitleH1>
          <Paragraph>
            <Text>{props.text1}</Text>
          </Paragraph>
          <br />
          {props.text2 && <><Paragraph>
              <Text>{props.text2}</Text>
          </Paragraph><br/></>
          }
        </ModalContentSmPadding>

        <ModalFooter>
          <Button onClick={(e) => performAction(false)} id="to-login-button">
            {props.actionText}
          </Button>
          <Button
            variant="secondaryNoBorder"
            onClick={() => performAction(true)}
            id="cancel-button"
          >
            {props.cancelText}
          </Button>
        </ModalFooter>
      </ModalStyled>
    </>
  );
}
