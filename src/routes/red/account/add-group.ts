/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Red_Account
 * @description Add Group
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe } from '@sudoo/extract';
import { SafeExtract } from "@sudoo/extract/dist/extract";
import { createUnsavedAccount, getAccountByUsername } from "../../../controller/account";
import { createAuthenticateHandler, createGroupVerifyHandler, createTokenHandler } from "../../../handlers/handlers";
import { basicHook } from "../../../handlers/hook";
import { INTERNAL_USER_GROUP } from "../../../interface/group";
import { IAccountModel } from "../../../model/account";
import { BrontosaurusRoute } from "../../../routes/basic";
import { ERROR_CODE } from "../../../util/error";

export type AddGroupBody = {

    username: string;
    group: string;
};

export class AddGroupRoute extends BrontosaurusRoute {

    public readonly path: string = '/account/add-group';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(createTokenHandler(), '/account/add-group - TokenHandler'),
        basicHook.wrap(createAuthenticateHandler(), '/account/add-group - AuthenticateHandler'),
        basicHook.wrap(createGroupVerifyHandler([INTERNAL_USER_GROUP.SUPER_ADMIN], this._error), '/account/add-group - GroupVerifyHandler'),
        basicHook.wrap(this._addGroupHandler.bind(this), '/account/add-group - Add Group', true),
    ];

    private async _addGroupHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<AddGroupBody> = Safe.extract(req.body as AddGroupBody, this._error(ERROR_CODE.INSUFFICIENT_INFORMATION));

        try {

            const username: string = body.direct('username');
            const group: string = body.direct('group');

            const account: IAccountModel = await getAccountByUsername(username); // TODO

            res.agent.add('account', account.id);
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
