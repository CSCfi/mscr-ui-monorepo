import Button from '@mui/material/Button';
import {
    CrosswalkConnection, CrosswalkConnectionNew,
    CrosswalkConnectionsNew,
    RenderTree
} from "@app/common/interfaces/crosswalk-connection.interface";
import EastIcon from '@mui/icons-material/East';
import {Dropdown} from "suomifi-ui-components";
import {DropdownItem} from 'suomifi-ui-components';
import {useState, useEffect} from 'react';
import Input from '@mui/material/Input';
import { TextInput } from 'suomifi-ui-components';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {useBreakpoints} from "../../../../../../common-ui/components/media-query";
import { TableCell } from '@mui/material';
import JointListingAccordion from "@app/modules/crosswalk-editor/joint-listing-accordion";

interface CrosswalkDetails {
    crosswalkName: string;
    uri: string;
    pid: string;
    version: string;
    releaseDate: string;
    publisher: string;
    creator: string;
    contributors: string[];
    notes: string;
    description: string;
    keywords: string[];
    [key: string]: string | string[];
}

export default function MetadataAndFiles(props: { crosswalks: CrosswalkConnectionNew[], performMetadataAndFilesAction: any }) {
    let detailsInit: CrosswalkDetails = {
        contributors: [],
        creator: '',
        crosswalkName: '',
        description: '',
        keywords: [],
        notes: '',
        pid: '',
        publisher: '',
        releaseDate: '',
        uri: '',
        version: ''
    }

    const [inputValue, setInputValue] = useState(detailsInit);

    useEffect(() => {
        console.log('INPUT', inputValue);
        console.log('CROSSWALKS', props.crosswalks);
    }, [inputValue, props.crosswalks]);

    const updateValue = (paramName: string, value: any) => {
        let val = value === undefined ? '' : value.toString();
        let details = {...inputValue}
        details[paramName] = val;
        setInputValue(details);
    };

/*    const StyledTableCell = styled(TableCell)(({theme}) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    const StyledTableRow = styled(TableRow)(({theme}) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
        // hide last border
        '&:last-child td, &:last-child th': {
            border: 0,
        },
    }));*/

    return (<>
    <div className='crosswalk-editor mx-2'>
        <h2 className='mt-4 mb-3'>Crosswalk details</h2>
        <div className='row d-flex justify-content-between metadata-and-files-wrap mx-2'>
        <div className='row bg-light-blue'>
            <div className='col-6'>
                <div className='mt-3'>
                <TextInput
                    onChange={(value) => updateValue('crosswalkName', value)}
                    labelText="Crosswalk name"
                    value={inputValue.crosswalkName.toString()}
                />
                </div>
                <div className='mt-2'>
                <TextInput
                    onChange={(value) => updateValue('uri', value)}
                    labelText="Uri"
                    value={inputValue.uri.toString()}
                />
                </div>
                <div className='my-3'>PID:<span>{inputValue.pid}</span></div>
                <div className='my-3'>Version:<span>{inputValue.version}</span></div>
                <div className='my-3'> Release date:<span>{inputValue.releaseDate}</span></div>
                <div className='my-3'>Publisher:<span>{inputValue.publisher}</span></div>
                <div className='my-3'>Creator:<span>{inputValue.creator}</span></div>
                <div className='my-3'>Contributors:<span>{inputValue.contributors}</span></div>
            </div>

            <div className='col-6'>
                <div className='mt-3'>
                <TextInput
                    onChange={(value) => updateValue('notes', value)}
                    labelText="Notes"
                    value={inputValue.notes.toString()}
                />
            </div>
                <div className='mt-2'>
                <TextInput
                    onChange={(value) => updateValue('description', value)}
                    labelText="Description"
                    value={inputValue.description.toString()}
                />
            </div>
                <div className='mt-2'>
                <TextInput
                    onChange={(value) => updateValue('keywords', value)}
                    labelText="Keywords"
                    value={inputValue.keywords.toString()}
                />
            </div>
            </div>
        </div>
        </div>
        <h2 className='mt-4 mb-3'>Files</h2>
        <div className='row d-flex justify-content-between metadata-and-files-wrap mx-2'>
            <br/>

            <div>TABLE HERE</div>
        </div>
        <h2 className='mt-4 mb-3'>Crosswalk summary</h2>
        <div className='row d-flex justify-content-between metadata-and-files-wrap mx-2'>
                <JointListingAccordion crosswalkJoints={props.crosswalks} viewOnlyMode={true}
                                       performAccordionAction={null}></JointListingAccordion>
        </div>
    </div>
    </>)
}