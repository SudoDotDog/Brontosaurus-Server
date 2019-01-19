/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Red_Account
 * @description All
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { getAllAccounts } from "../../../controller/account";
import { createAuthenticateHandler, createGroupVerifyHandler, createTokenHandler } from "../../../handlers/handlers";
import { basicHook } from "../../../handlers/hook";
import { INTERNAL_USER_GROUP } from "../../../interface/group";
import { IAccountModel } from "../../../model/account";
import { BrontosaurusRoute } from "../../../routes/basic";

export class AllAccountRoute extends BrontosaurusRoute {

    public readonly path: string = '/account/all';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(createTokenHandler(), '/account/all - TokenHandler'),
        basicHook.wrap(createAuthenticateHandler(), '/account/all - AuthenticateHandler'),
        basicHook.wrap(createGroupVerifyHandler([INTERNAL_USER_GROUP.SUPER_ADMIN], this._error), '/account/all - GroupVerifyHandler'),
        basicHook.wrap(this._allAccountHandler.bind(this), '/account/all - All', true),
    ];

    private async _allAccountHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        try {

            const accounts: IAccountModel[] = await getAllAccounts();

            const parsed = accounts.map((account: IAccountModel) => ({
                username: account.username,
                infos: account.getInfoRecords(),
            }));

            res.agent.add('accounts', parsed);
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
