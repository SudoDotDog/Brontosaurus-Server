/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Red_Account
 * @description Add Group
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { getAccountByUsername } from "../../../controller/account";
import { getGroupByName } from "../../../controller/group";
import { createAuthenticateHandler, createGroupVerifyHandler, createTokenHandler } from "../../../handlers/handlers";
import { basicHook } from "../../../handlers/hook";
import { INTERNAL_USER_GROUP } from "../../../interface/group";
import { IAccountModel } from "../../../model/account";
import { IGroupModel } from "../../../model/group";
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

            const username: string = body.directEnsure('username');
            const groupName: string = body.directEnsure('group');

            const account: IAccountModel | null = await getAccountByUsername(username);
            const group: IGroupModel | null = await getGroupByName(groupName);

            if (!account) {
                throw this._error(ERROR_CODE.ACCOUNT_NOT_FOUND, username);
            }

            if (!group) {
                throw this._error(ERROR_CODE.GROUP_NOT_FOUND, groupName);
            }

            account.addGroup(group._id);

            await account.save();

            res.agent.add('account', account.id);
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
