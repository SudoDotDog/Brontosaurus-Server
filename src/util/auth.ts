/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Auth
 */

import { BrontosaurusToken } from "@brontosaurus/core";
import Connor, { ErrorCreationFunction } from "connor";
import { ERROR_CODE, MODULE_NAME } from "./error";

export const Throwable_ValidateToken = (secret: string, expire: number, tokenString: string): true => {

    const token: BrontosaurusToken = BrontosaurusToken.withSecret(secret);
    const createError: ErrorCreationFunction = Connor.getErrorCreator(MODULE_NAME);

    if (!token.clock(tokenString, expire)) {
        throw createError(ERROR_CODE.TOKEN_EXPIRED);
    }

    if (token.check(tokenString)) {
        throw createError(ERROR_CODE.TOKEN_INVALID);
    }

    return true;
};

export const parseBearerAuthorization = (auth: string | undefined): string | null => {

    if (!auth || auth.length <= 7) {
        return null;
    }

    const splited: string[] = auth.split(' ');
    if (splited.length !== 2) {
        return null;
    }

    const type: string = splited[0];

    if (type.toLowerCase() !== 'bearer') {
        return null;
    }

    const value: string = splited[1];
    return value;
};

