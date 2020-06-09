/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Redirection
 */

import { ApplicationRedirection, IApplicationModel } from "@brontosaurus/db";

export const validateRedirection = (application: IApplicationModel, target: string): boolean => {

    const redirections: ApplicationRedirection[] = application.redirections;
    if (!Array.isArray(redirections)) {
        return false;
    }

    if (redirections.length === 0) {
        return true;
    }

    if (target.toUpperCase().startsWith('IFRAME')) {
        return true;
    }
    if (target.toUpperCase().startsWith('POST')) {
        return true;
    }
    if (target.toUpperCase().startsWith('NONE')) {
        return true;
    }

    try {
        for (const redirection of redirections) {
            const regexp: RegExp = new RegExp(redirection.regexp);
            if (regexp.test(target)) {
                return true;
            }
        }
    } catch (err) {
        return false;
    }

    return false;
};
