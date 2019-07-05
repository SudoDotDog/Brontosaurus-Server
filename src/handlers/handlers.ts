/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Handlers
 * @description Authenticate
 */

import { SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { parseBearerAuthorization } from "../util/auth";

export const createTokenHandler = (): SudooExpressHandler =>
    async (req: SudooExpressRequest, _: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> => {

        const authHeader: string | undefined = req.header('authorization') || req.header('Authorization');
        const auth: string | null = parseBearerAuthorization(authHeader);

        req.info.token = auth;

        next();
    };
