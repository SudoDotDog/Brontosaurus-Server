/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Handlers
 * @description Authenticate
 */

import { IBrontosaurusBody } from "@brontosaurus/core";
import { SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeValue } from "@sudoo/extract";
import Connor, { ErrorCreationFunction } from "connor";
import { getAccountByUsername } from "../controller/account";
import { getApplicationByKey } from "../controller/application";
import { INTERNAL_APPLICATION } from "../interface/application";
import { IAccountModel } from "../model/account";
import { IApplicationModel } from "../model/application";
import { compareGroups, parseBearerAuthorization, Throwable_GetBody, Throwable_MapGroups, Throwable_ValidateToken } from "../util/auth";
import { ERROR_CODE, MODULE_NAME } from "../util/error";

export const createTokenHandler = (): SudooExpressHandler =>
    async (req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> => {

        const authHeader: string | undefined = req.header('authorization');
        const auth: string | null = parseBearerAuthorization(authHeader);

        req.info.token = auth;

        next();
    };

export const createAuthenticateHandler = (): SudooExpressHandler =>
    async (req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> => {

        const token: SafeValue<string> = Safe.value(req.info.token);

        try {

            const application: IApplicationModel = Safe.value(await getApplicationByKey(INTERNAL_APPLICATION.RED)).safe();
            Throwable_ValidateToken(application.secret, application.expire, token.safe());

            req.authenticate = application;
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    };

export const createGroupVerifyHandler = (groups: string[], error: ErrorCreationFunction): SudooExpressHandler =>
    async (req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> => {

        const token: SafeValue<string> = Safe.value(req.info.token);
        const createError: ErrorCreationFunction = Connor.getErrorCreator(MODULE_NAME);

        try {

            const tokenBody: IBrontosaurusBody = Throwable_GetBody(token.safe());

            const account: IAccountModel = Safe.value(await getAccountByUsername(
                Safe.value(tokenBody.username, createError(ERROR_CODE.TOKEN_DOES_NOT_CONTAIN_INFORMATION, 'username')).safe()),
            ).safe();
            const accountGroups: string[] = await Throwable_MapGroups(account.groups);

            if (!compareGroups(accountGroups, groups)) {

                throw error(ERROR_CODE.NOT_ENOUGH_PERMISSION, groups.toString());
            }
            req.valid = true;
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    };
