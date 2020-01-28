/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Account
 * @description Validate
 */

import { BrontosaurusToken } from "@brontosaurus/core";
import { AccountController, ApplicationController, IAccountModel, IApplicationModel } from "@brontosaurus/db";
import { IBrontosaurusBody } from "@brontosaurus/definition";
import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { HTTP_RESPONSE_CODE } from "@sudoo/magic";
import { basicHook } from "../../handlers/hook";
import { Throwable_ValidateToken } from "../../util/auth";
import { ERROR_CODE } from "../../util/error";
import { BrontosaurusRoute } from "../basic";

export type AccountValidateRouteBody = {

    readonly token: string;
};

export class AccountValidateRoute extends BrontosaurusRoute {

    public readonly path: string = '/validate';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(this._portalHandler.bind(this), '/validate - Validate'),
    ];

    private async _portalHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<AccountValidateRouteBody> = Safe.extract(req.body as AccountValidateRouteBody);

        try {

            const token: string = body.direct('token');
            const applicationKey: string | null = BrontosaurusToken.key(token);

            if (!applicationKey) {
                throw this._error(ERROR_CODE.APPLICATION_KEY_NOT_FOUND);
            }

            const application: IApplicationModel = Safe.value(await ApplicationController.getApplicationByKey(applicationKey)).safe();
            const brontosaurus: IBrontosaurusBody = Throwable_ValidateToken({
                public: application.publicKey,
                private: application.privateKey,
            }, application.expire, token);

            const account: IAccountModel | null = await AccountController.getAccountByUsername(brontosaurus.username);

            if (!account) {
                throw this._error(ERROR_CODE.ACCOUNT_NOT_FOUND, brontosaurus.username);
            }

            if (!account.active) {
                throw this._error(ERROR_CODE.INACTIVE_ACCOUNT, account.username);
            }

            if (account.mint !== brontosaurus.mint) {
                throw this._error(ERROR_CODE.ACCOUNT_MINT_NOT_VALID);
            }

            res.agent.add('validate', true);
        } catch (err) {

            res.agent.fail(HTTP_RESPONSE_CODE.BAD_REQUEST, err);
        } finally {
            next();
        }
    }
}
