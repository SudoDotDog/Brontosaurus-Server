/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Account
 * @description Validate
 */

import { BrontosaurusToken } from "@brontosaurus/core";
import { IAccountModel, IApplicationModel } from "@brontosaurus/db";
import { getAccountByUsername } from "@brontosaurus/db/controller/account";
import { getApplicationByKey } from "@brontosaurus/db/controller/application";
import { IBrontosaurusBody } from "@brontosaurus/definition";
import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { basicHook } from "../../handlers/hook";
import { Throwable_ValidateToken } from "../../util/auth";
import { ERROR_CODE } from "../../util/error";
import { BrontosaurusRoute } from "../basic";

export type AccountValidateRouteBody = {

    token: string;
};

export class AccountValidateRoute extends BrontosaurusRoute {

    public readonly path: string = '/validate';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(this._portalHandler.bind(this), '/validate - Validate', true),
    ];

    private async _portalHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<AccountValidateRouteBody> = Safe.extract(req.body as AccountValidateRouteBody);

        try {

            const token: string = body.direct('token');
            const applicationKey: string | null = BrontosaurusToken.key(token);

            if (!applicationKey) {
                throw this._error(ERROR_CODE.APPLICATION_KEY_NOT_FOUND);
            }

            const application: IApplicationModel = Safe.value(await getApplicationByKey(applicationKey)).safe();
            const brontosaurus: IBrontosaurusBody = Throwable_ValidateToken(application.secret, application.expire, token);

            const account: IAccountModel | null = await getAccountByUsername(brontosaurus.username);

            if (!account) {
                throw this._error(ERROR_CODE.ACCOUNT_NOT_FOUND, brontosaurus.username);
            }

            if (account.mint !== brontosaurus.mint) {
                throw this._error(ERROR_CODE.ACCOUNT_MINT_NOT_VALID);
            }

            res.agent.add('validate', true);
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
