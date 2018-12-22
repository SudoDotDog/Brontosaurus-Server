/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Handlers
 * @description Authenticate
 */

import { BrontosaurusToken } from "@brontosaurus/core";
import { SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract, SafeValue } from "@sudoo/extract";
import { getApplicationByKey } from "../controller/application";
import { IApplicationModel } from "../model/application";
import { parseBearerAuthorization, Throwable_ValidateToken } from "../util/auth";

export const createTokenHandler = (): SudooExpressHandler => () =>
    async (req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> => {

        const wrappedNext: SudooExpressNextFunction = res.agent.catchAndWrap(next);

        const authHeader: string | undefined = req.header('authorization');
        const auth: string | null = parseBearerAuthorization(authHeader);

        req.info.token = auth;

        wrappedNext();
    };

export const createAuthenticateHandler = (): SudooExpressHandler => () =>
    async (req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> => {

        const wrappedNext: SudooExpressNextFunction = res.agent.catchAndWrap(next);

        const token: SafeValue<string> = Safe.value(req.info.token);
        const body: SafeExtract<{
            applicationKey: string;
        }> = Safe.extract(req.body as {
            applicationKey: string;
        });

        try {

            const application: IApplicationModel = Safe.value(await getApplicationByKey(body.direct('applicationKey'))).safe();
            Throwable_ValidateToken(application.secret, application.expire, token.safe());

            req.authenticate = application;
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            wrappedNext();
        }
    };

export const createGroupVerifyHandler = (groups: string[]): SudooExpressHandler => () =>
    async (req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> => {

        const wrappedNext: SudooExpressNextFunction = res.agent.catchAndWrap(next);

        const token: SafeValue<string> = Safe.value(req.info.token);
        const application: SafeValue<IApplicationModel> = Safe.value(req.authenticate);

        try {

            const validator: BrontosaurusToken = BrontosaurusToken.withSecret(application.safe().secret);

            // TODO
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            wrappedNext();
        }
    };
