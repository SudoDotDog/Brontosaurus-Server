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
