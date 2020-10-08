import {exit} from "process";
import {readProject} from "../project/read";
import {update} from "../project/update";

export function cliUpdate(path: string, options: object): void {
    readProject(path)
        .then(update)
        .catch(reason => {
            if (!!reason && reason.message) {
                console.error(reason.message);
            } else {
                console.error(reason);
            }
            exit(1);
        });
}
