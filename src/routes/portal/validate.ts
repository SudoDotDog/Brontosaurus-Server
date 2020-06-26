/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Account
 * @description Validate
 */

import { BrontosaurusToken } from "@brontosaurus/core";
import { ApplicationController, IAccountModel, IApplicationModel, MatchController } from "@brontosaurus/db";
import { IBrontosaurusBody } from "@brontosaurus/definition";
import { createStringedBodyVerifyHandler, ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe } from '@sudoo/extract';
import { HTTP_RESPONSE_CODE } from "@sudoo/magic";
import { createStrictMapPattern, createStringPattern, Pattern } from "@sudoo/pattern";
import { fillStringedResult, StringedResult } from "@sudoo/verify";
import { autoHook } from "../../handlers/hook";
// eslint-disable-next-line camelcase
import { Throwable_ValidateToken } from "../../util/auth";
import { ERROR_CODE } from "../../util/error";
import { BrontosaurusRoute } from "../basic";

const bodyPattern: Pattern = createStrictMapPattern({
    token: createStringPattern(),
});

export type AccountValidateRouteBody = {

    readonly token: string;
};

export class AccountValidateRoute extends BrontosaurusRoute {

    public readonly path: string = '/validate';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        autoHook.wrap(createStringedBodyVerifyHandler(bodyPattern), 'Body Verify'),
        autoHook.wrap(this._portalHandler.bind(this), 'Validate'),
    ];

    private async _portalHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: AccountValidateRouteBody = req.body;

        try {

            const verify: StringedResult = fillStringedResult(req.stringedBodyVerify);

            if (!verify.succeed) {
                throw this._error(ERROR_CODE.REQUEST_DOES_MATCH_PATTERN, verify.invalids[0]);
            }

            const applicationKey: string | null = BrontosaurusToken.key(body.token);

            if (!applicationKey) {
                throw this._error(ERROR_CODE.APPLICATION_KEY_NOT_FOUND);
            }

            const application: IApplicationModel = Safe.value(await ApplicationController.getApplicationByKey(applicationKey)).safe();
            const brontosaurus: IBrontosaurusBody = Throwable_ValidateToken({
                public: application.publicKey,
                private: application.privateKey,
            }, application.expire, body.token);

            const account: IAccountModel | null = await MatchController.getAccountByUsernameAndNamespaceName(brontosaurus.username, brontosaurus.namespace);

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
