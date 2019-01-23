/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Red_Account
 * @description All
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from "@sudoo/extract";
import { isNumber } from "util";
import { getAccountsByPage, getTotalAccountPages } from "../../../controller/account";
import { createAuthenticateHandler, createGroupVerifyHandler, createTokenHandler } from "../../../handlers/handlers";
import { basicHook } from "../../../handlers/hook";
import { INTERNAL_USER_GROUP } from "../../../interface/group";
import { IAccountModel } from "../../../model/account";
import { BrontosaurusRoute } from "../../../routes/basic";
import { ERROR_CODE } from "../../../util/error";

export type AllAccountBody = {

    page: number;
};

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

        const body: SafeExtract<AllAccountBody> = Safe.extract(req.body as AllAccountBody, this._error(ERROR_CODE.INSUFFICIENT_INFORMATION));

        try {

            const page: number = body.direct('page');
            if (!isNumber(page) || page < 0) {

                throw this._error(ERROR_CODE.REQUEST_FORMAT_ERROR, 'page', 'number', (page as any).toString());
            }

            const limit: number = 10;

            const pages: number = await getTotalAccountPages(limit);
            const accounts: IAccountModel[] = await getAccountsByPage(limit, Math.floor(page));

            const parsed = accounts.map((account: IAccountModel) => ({
                username: account.username,
                groups: account.groups.length,
                infos: account.getInfoRecords(),
            }));

            res.agent.add('accounts', parsed);
            res.agent.add('pages', Math.ceil(pages));
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
