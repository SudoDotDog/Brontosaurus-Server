/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Red_Account
 * @description Register
 */

import { Basics } from "@brontosaurus/definition";
import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { isString } from "util";
import { createUnsavedAccount, isAccountDuplicatedByUsername } from "../../../controller/account";
import { createAuthenticateHandler, createGroupVerifyHandler, createTokenHandler } from "../../../handlers/handlers";
import { basicHook } from "../../../handlers/hook";
import { INTERNAL_USER_GROUP } from "../../../interface/group";
import { IAccountModel } from "../../../model/account";
import { BrontosaurusRoute } from "../../../routes/basic";
import { ERROR_CODE } from "../../../util/error";

export type RegisterRouteBody = {

    username: string;
    password: string;
    infos: Record<string, Basics>;
};

export class RegisterRoute extends BrontosaurusRoute {

    public readonly path: string = '/account/register';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(createTokenHandler(), '/account/register - TokenHandler'),
        basicHook.wrap(createAuthenticateHandler(), '/account/register - AuthenticateHandler'),
        basicHook.wrap(createGroupVerifyHandler([INTERNAL_USER_GROUP.SUPER_ADMIN], this._error), '/account/register - GroupVerifyHandler'),
        basicHook.wrap(this._registerHandler.bind(this), '/account/register - Register', true),
    ];

    private async _registerHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<RegisterRouteBody> = Safe.extract(req.body as RegisterRouteBody, this._error(ERROR_CODE.INSUFFICIENT_INFORMATION));

        try {

            const username: string = body.directEnsure('username');
            const password: string = body.directEnsure('password');

            const infoLine: any = body.direct('infos');
            const infos: Record<string, Basics> = isString(infoLine)
                ? JSON.parse(infoLine)
                : infoLine;

            const isDuplicated: boolean = await isAccountDuplicatedByUsername(username);

            if (isDuplicated) {
                throw this._error(ERROR_CODE.DUPLICATE_ACCOUNT, username);
            }

            const account: IAccountModel = createUnsavedAccount(username, password, [], infos);
            await account.save();

            res.agent.add('account', account.id);
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
