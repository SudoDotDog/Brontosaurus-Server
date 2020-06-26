/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Reset
 * @description Reset
 */

import { AccountNamespaceMatch, IAccountModel, INamespaceModel, MatchController, MATCH_FAILS_REASON } from "@brontosaurus/db";
import { createStringedBodyVerifyHandler, ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { SudooLog } from "@sudoo/log";
import { HTTP_RESPONSE_CODE } from "@sudoo/magic";
import { createStrictMapPattern, createStringPattern, Pattern } from "@sudoo/pattern";
import { fillStringedResult, StringedResult } from "@sudoo/verify";
import { RESET_TOKEN_ATTEMPT_CONSUME } from "../../declare/attempt";
import { autoHook } from "../../handlers/hook";
import { buildNotMatchReason, ERROR_CODE, NOT_MATCH_REASON } from "../../util/error";
import { BrontosaurusRoute } from "../basic";

const bodyPattern: Pattern = createStrictMapPattern({

    username: createStringPattern(),
    namespace: createStringPattern(),
    resetToken: createStringPattern(),
});

export type ResetResetRouteBody = {

    readonly username: string;
    readonly namespace: string;
    readonly resetToken: string;
};

export class ResetResetRoute extends BrontosaurusRoute {

    public readonly path: string = '/reset/reset';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        autoHook.wrap(createStringedBodyVerifyHandler(bodyPattern), 'Body Verify'),
        autoHook.wrap(this._resetResetHandler.bind(this), 'Reset Password'),
    ];

    private async _resetResetHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: ResetResetRouteBody = req.body;

        try {

            const verify: StringedResult = fillStringedResult(req.stringedBodyVerify);

            if (!verify.succeed) {
                throw this._error(ERROR_CODE.REQUEST_DOES_MATCH_PATTERN, verify.invalids[0]);
            }

            const matched: AccountNamespaceMatch = await MatchController.getAccountNamespaceMatchByUsernameAndNamespace(body.username, body.namespace);

            if (matched.succeed === false) {

                switch (matched.reason) {
                    case MATCH_FAILS_REASON.ACCOUNT_NOT_FOUND: {

                        SudooLog.global.error(buildNotMatchReason(NOT_MATCH_REASON.ACCOUNT_NOT_FOUND, body.username, body.namespace));
                        throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH, body.username, body.namespace);
                    }
                    case MATCH_FAILS_REASON.NAMESPACE_NOT_FOUND: {

                        SudooLog.global.error(buildNotMatchReason(NOT_MATCH_REASON.NAMESPACE_NOT_FOUND, body.username, body.namespace));
                        throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH, body.username, body.namespace);
                    }
                }
            }

            const account: IAccountModel = matched.account;
            const namespaceInstance: INamespaceModel = matched.namespace;

            if (account.attemptPoints <= 0) {
                throw this._error(ERROR_CODE.OUT_OF_ATTEMPT, account.username, namespaceInstance.namespace);
            }

            const tokenMatched: boolean = account.verifyResetToken(body.resetToken);

            if (!tokenMatched) {

                account.useAttemptPoint(RESET_TOKEN_ATTEMPT_CONSUME);
                await account.save();
                throw this._error(ERROR_CODE.TOKEN_DOES_NOT_MATCH, account.username, namespaceInstance.namespace);
            }

            if (!account.active) {
                throw this._error(ERROR_CODE.INACTIVE_ACCOUNT, account.username, namespaceInstance.namespace);
            }

            await account.save();

            res.agent.add('valid', true);
            res.agent.add('username', account.username);
        } catch (err) {

            res.agent.fail(HTTP_RESPONSE_CODE.UNAUTHORIZED, err);
        } finally {
            next();
        }
    }
}
