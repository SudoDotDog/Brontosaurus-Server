/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Handlers
 * @description Authenticate
 */

import { SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from "@sudoo/extract";

export type AuthenticateHandlerBody = {

    token: string;
};

export const createAuthenticateHandler: SudooExpressHandler = () =>
    async (req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> => {

        const body: SafeExtract<AuthenticateHandlerBody> = Safe.extract(req.body as AuthenticateHandlerBody);

        try {

            const token: string = body.direct('token');
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    };
