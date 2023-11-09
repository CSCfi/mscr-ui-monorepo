import {
    CrosswalkConnection, CrosswalkConnectionNew,
    CrosswalkConnectionsNew
} from "@app/common/interfaces/crosswalk-connection.interface";

export default function validateMapping(input: CrosswalkConnectionNew) {
    let validationErrors: string[] = [];
    if (input.source.type === input.target.type) {

    }
    else {
        validationErrors.push('Type mismatch');
    }
    return validationErrors;
}
