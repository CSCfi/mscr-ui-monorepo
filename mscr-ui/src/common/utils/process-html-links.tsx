import { IconLinkExternal } from 'suomifi-icons';

// Takes a string or an array of primitive values and swaps urls to link elements
export default function processHtmlLinks(
  input: string | Array<string | number | boolean> | undefined
) {
  const inputArray = typeof input == 'string' ? [input] : input;
  if (!inputArray) return undefined;
  const output: Array<JSX.Element | string | number | boolean> = inputArray.map(
    (inputPart) => {
      if (
        typeof inputPart == 'string' &&
        (inputPart.startsWith('http://') || inputPart.startsWith('https://'))
      ) {
        return (
          <a key={inputPart} href={inputPart} target="_blank" rel="noreferrer">
            {inputPart} <IconLinkExternal />
          </a>
        );
      } else {
        return inputPart;
      }
    }
  );

  if (typeof input == 'string') {
    return output[0];
  } else {
    return output;
  }
}
