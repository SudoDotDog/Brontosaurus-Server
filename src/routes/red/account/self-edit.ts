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
import { parseInfo, SafeToken } from "../../../util/token";

export type SelfEditBody = {

    username: string;
    account: Partial<{
        infos: Record<string, Basics>;
    }>;
};

export class SelfEditRoute extends BrontosaurusRoute {

    public readonly path: string = '/account/edit/self';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(createTokenHandler(), '/account/edit/self - TokenHandler'),
        basicHook.wrap(createAuthenticateHandler(), '/account/edit/self - AuthenticateHandler'),
        basicHook.wrap(createGroupVerifyHandler([INTERNAL_USER_GROUP.SELF_CONTROL], this._error), '/account/edit/self - GroupVerifyHandler'),
        basicHook.wrap(this._selfEditHandler.bind(this), '/account/edit/self - Self Edit', true),
    ];

    private async _selfEditHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<SelfEditBody> = Safe.extract(req.body as SelfEditBody, this._error(ERROR_CODE.INSUFFICIENT_INFORMATION));

        try {

            const username: string = body.directEnsure('username');
            const principal: SafeToken = req.principal;

            const tokenUsername: string = principal.body.directEnsure('username', this._error(ERROR_CODE.TOKEN_DOES_NOT_CONTAIN_INFORMATION, 'username'));

            if (username !== tokenUsername) {
                throw this._error(ERROR_CODE.PERMISSION_USER_DOES_NOT_MATCH, username, tokenUsername);
            }

            const account: IAccountModel | null = await getAccountByUsername(username);

            if (!account) {
                throw this._error(ERROR_CODE.ACCOUNT_NOT_FOUND, username);
            }

            const update: Partial<{
                infos: Record<string, Basics>;
            }> = body.direct('account');

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
