/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Red_Account
 * @description Self Edit
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { getAccountByUsername } from "../../../controller/account";
import { createAuthenticateHandler, createGroupVerifyHandler, createTokenHandler } from "../../../handlers/handlers";
import { basicHook } from "../../../handlers/hook";
import { INTERNAL_USER_GROUP } from "../../../interface/group";
import { IAccountModel } from "../../../model/account";
import { BrontosaurusRoute } from "../../../routes/basic";
import { ERROR_CODE } from "../../../util/error";

export type SelfEditBody = {

    username: string;
    password: string;
};

export class SelfEditRoute extends BrontosaurusRoute {

    public readonly path: string = '/account/self-edit';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(createTokenHandler(), '/account/self-edit - TokenHandler'),
        basicHook.wrap(createAuthenticateHandler(), '/account/self-edit - AuthenticateHandler'),
        basicHook.wrap(createGroupVerifyHandler([INTERNAL_USER_GROUP.SELF_AWARENESS], this._error), '/account/self-edit - GroupVerifyHandler'),
        basicHook.wrap(this._addGroupHandler.bind(this), '/account/self-edit - Self Edit', true),
    ];

    private async _addGroupHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<SelfEditBody> = Safe.extract(req.body as SelfEditBody, this._error(ERROR_CODE.INSUFFICIENT_INFORMATION));

        try {

            const username: string = body.direct('username');

            // TODO
            const account: IAccountModel | null = await getAccountByUsername(username);

            if (!account) {
                throw this._error(ERROR_CODE.ACCOUNT_NOT_FOUND, username);
            }

            res.agent.add('account', account.id);
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
