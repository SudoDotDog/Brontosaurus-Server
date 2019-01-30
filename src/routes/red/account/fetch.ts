/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Red_Account
 * @description Fetch
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from "@sudoo/extract";
import { getSelectedActiveAccountsByPage, getTotalActiveAccountPages } from "../../../controller/account";
import { createAuthenticateHandler, createGroupVerifyHandler, createTokenHandler } from "../../../handlers/handlers";
import { basicHook } from "../../../handlers/hook";
import { INTERNAL_USER_GROUP } from "../../../interface/group";
import { IAccountModel } from "../../../model/account";
import { ERROR_CODE } from "../../../util/error";
import { BrontosaurusRoute } from "../../basic";

export type FetchAccountBody = {

    page: number;
    keyword: string;
};

export class FetchAccountRoute extends BrontosaurusRoute {

    public readonly path: string = '/account/fetch';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(createTokenHandler(), '/account/fetch - TokenHandler'),
        basicHook.wrap(createAuthenticateHandler(), '/account/fetch - AuthenticateHandler'),
        basicHook.wrap(createGroupVerifyHandler([INTERNAL_USER_GROUP.SUPER_ADMIN], this._error), '/account/fetch - GroupVerifyHandler'),
        basicHook.wrap(this._fetchAccountHandler.bind(this), '/account/fetch - All', true),
    ];

    private async _fetchAccountHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<FetchAccountBody> = Safe.extract(req.body as FetchAccountBody, this._error(ERROR_CODE.INSUFFICIENT_INFORMATION));

        try {

            const page: number = body.direct('page');
            if (typeof page !== 'number' || page < 0) {
                throw this._error(ERROR_CODE.REQUEST_FORMAT_ERROR, 'page', 'number', (page as any).toString());
            }

            const keyword: string = body.direct('keyword');
            if (typeof keyword !== 'string') {
                throw this._error(ERROR_CODE.REQUEST_FORMAT_ERROR, 'keyword', 'string', (keyword as any).toString());
            }

            const limit: number = 10;

            const pages: number = await getTotalActiveAccountPages(limit);
            const accounts: IAccountModel[] = await getSelectedActiveAccountsByPage(limit, Math.floor(page), keyword);

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
