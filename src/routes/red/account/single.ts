/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Red_Account
 * @description Single
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from "@sudoo/extract";
import { getAccountByUsername } from "../../../controller/account";
import { createAuthenticateHandler, createGroupVerifyHandler, createTokenHandler } from "../../../handlers/handlers";
import { basicHook } from "../../../handlers/hook";
import { INTERNAL_USER_GROUP } from "../../../interface/group";
import { IAccountModel } from "../../../model/account";
import { Throwable_MapGroups } from "../../../util/auth";
import { ERROR_CODE } from "../../../util/error";
import { BrontosaurusRoute } from "../../basic";

export type SingleAccountBody = {

    username: string;
};

export class SingleAccountRoute extends BrontosaurusRoute {

    public readonly path: string = '/account/single';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(createTokenHandler(), '/account/single - TokenHandler'),
        basicHook.wrap(createAuthenticateHandler(), '/account/single - AuthenticateHandler'),
        basicHook.wrap(createGroupVerifyHandler([INTERNAL_USER_GROUP.SUPER_ADMIN], this._error), '/account/single - GroupVerifyHandler'),
        basicHook.wrap(this._singleAccountHandler.bind(this), '/account/single - Single', true),
    ];

    private async _singleAccountHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<SingleAccountBody> = Safe.extract(req.body as SingleAccountBody, this._error(ERROR_CODE.INSUFFICIENT_INFORMATION));

        try {

            const username: string = body.direct('username');
            if (typeof username !== 'string') {
                throw this._error(ERROR_CODE.REQUEST_FORMAT_ERROR, 'username', 'string', (username as any).toString());
            }

            const account: IAccountModel | null = await getAccountByUsername(username);
            if (!account) {
                throw this._error(ERROR_CODE.ACCOUNT_NOT_FOUND, username);
            }

            const accountGroups: string[] = await Throwable_MapGroups(account.groups);

            res.agent.add('account', {
                username: account.username,
                groups: accountGroups,
                infos: account.getInfoRecords(),
                beacons: account.getBeaconRecords(),
            });
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
