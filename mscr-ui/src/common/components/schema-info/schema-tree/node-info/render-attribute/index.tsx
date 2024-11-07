import { ConstantAttribute } from '@app/common/interfaces/node.interface';
import processHtmlLinks from '@app/common/utils/process-html-links';

export default function RenderAttribute({ attribute }: { attribute: ConstantAttribute }) {
  const valueWithLinks = processHtmlLinks(attribute.value);
  let valueList;
  // Add line breaks between values if multiple
  if (Array.isArray(valueWithLinks)) {
    valueList = [valueWithLinks[0]];
    for (let i = 1; i < valueWithLinks.length; i++) {
      valueList.push(
        <span key={self.crypto.randomUUID()}>
          <br />
          {valueWithLinks[i]}
        </span>
      );
    }
  } else {
    valueList = valueWithLinks;
  }
  return (
    <div
      className="col-12"
      hidden={attribute.name === '@id'}
    >
      <div>{processHtmlLinks(attribute.name)}:</div>
      <div className="attribute-font">{valueList}</div>
    </div>
  );
}
