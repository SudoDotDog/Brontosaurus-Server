/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Handlers
 * @description Authenticate
 */

import { IBrontosaurusBody } from "@brontosaurus/core";
import { SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract, SafeValue } from "@sudoo/extract";
import { ErrorCreationFunction } from "connor";
import { getAccountByUsername } from "../controller/account";
import { getApplicationByKey } from "../controller/application";
import { IAccountModel } from "../model/account";
import { IApplicationModel } from "../model/application";
import { compareGroups, parseBearerAuthorization, Throwable_GetBody, Throwable_MapGroups, Throwable_ValidateToken } from "../util/auth";
import { ERROR_CODE } from "../util/error";

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

export const createGroupVerifyHandler = (groups: string[], error: ErrorCreationFunction): SudooExpressHandler => () =>
    async (req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> => {

        const wrappedNext: SudooExpressNextFunction = res.agent.catchAndWrap(next);

        const token: SafeValue<string> = Safe.value(req.info.token);

        try {

            const tokenBody: IBrontosaurusBody = Throwable_GetBody(token.safe());

            const account: IAccountModel = await getAccountByUsername(Safe.value(tokenBody.username).safe());
            const accountGroups: string[] = await Throwable_MapGroups(account.groups);

            if (!compareGroups(accountGroups, groups)) {

                throw error(ERROR_CODE.NOT_ENOUGH_PERMISSION, groups.toString());
            }

            req.valid = true;
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            wrappedNext();
        }
    };
