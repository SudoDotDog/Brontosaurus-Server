/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Red_Account
 * @description Self Edit
 */

import { Basics } from "@brontosaurus/definition";
import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { getAccountByUsername } from "../../../controller/account";
import { createAuthenticateHandler, createGroupVerifyHandler, createTokenHandler } from "../../../handlers/handlers";
import { basicHook } from "../../../handlers/hook";
import { INTERNAL_USER_GROUP } from "../../../interface/group";
import { IAccountModel } from "../../../model/account";
import { BrontosaurusRoute } from "../../../routes/basic";
import { ERROR_CODE } from "../../../util/error";
import { parseInfo } from "../../../util/token";

export type AdminEditBody = {

    username: string;
    account: Partial<{
        infos: Record<string, Basics>;
        beacons: Record<string, Basics>;
    }>;
};

export class AdminEditRoute extends BrontosaurusRoute {

    public readonly path: string = '/account/edit/admin';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(createTokenHandler(), '/account/edit/admin - TokenHandler'),
        basicHook.wrap(createAuthenticateHandler(), '/account/edit/admin - AuthenticateHandler'),
        basicHook.wrap(createGroupVerifyHandler([INTERNAL_USER_GROUP.SUPER_ADMIN], this._error), '/account/edit/admin - GroupVerifyHandler'),
        basicHook.wrap(this._adminEditHandler.bind(this), '/account/edit/admin - Admin Edit', true),
    ];

    private async _adminEditHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<AdminEditBody> = Safe.extract(req.body as AdminEditBody, this._error(ERROR_CODE.INSUFFICIENT_INFORMATION));

        try {

            const username: string = body.directEnsure('username');

            const account: IAccountModel | null = await getAccountByUsername(username);

            if (!account) {
                throw this._error(ERROR_CODE.ACCOUNT_NOT_FOUND, username);
            }

            const update: Partial<{
                infos: Record<string, Basics>;
                beacons: Record<string, Basics>;
            }> = body.direct('account');

            if (update.beacons) {
                const newBeacons: Record<string, Basics> = {
                    ...account.getBeaconRecords(),
                    ...update.beacons,
                };
                account.beacons = parseInfo(newBeacons);
            }

            if (update.infos) {
                const newInfos: Record<string, Basics> = {
                    ...account.getInfoRecords(),
                    ...update.infos,
                };
                account.infos = parseInfo(newInfos);
            }

            await account.save();

            res.agent.add('account', account.username);
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
