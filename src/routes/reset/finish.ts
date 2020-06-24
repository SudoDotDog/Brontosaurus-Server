/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Reset
 * @description Finish
 */

import { AccountNamespaceMatch, IAccountModel, INamespaceModel, MatchController, MATCH_FAILS_REASON, PASSWORD_VALIDATE_RESPONSE, validatePassword } from "@brontosaurus/db";
import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { SudooLog } from "@sudoo/log";
import { HTTP_RESPONSE_CODE } from "@sudoo/magic";
import { RESET_TOKEN_ATTEMPT_CONSUME } from "../../declare/attempt";
import { autoHook } from "../../handlers/hook";
import { buildNotMatchReason, ERROR_CODE, NOT_MATCH_REASON } from "../../util/error";
import { BrontosaurusRoute } from "../basic";

export type ResetFinishRouteBody = {

    readonly username: string;
    readonly namespace: string;
    readonly resetToken: string;
    readonly newPassword: string;
};

export class ResetFinishRoute extends BrontosaurusRoute {

    public readonly path: string = '/reset/finish';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        autoHook.wrap(this._resetFinishHandler.bind(this), 'Reset Finish'),
    ];

    private async _resetFinishHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<ResetFinishRouteBody> = Safe.extract(req.body as ResetFinishRouteBody, this._error(ERROR_CODE.REQUEST_DOES_MATCH_PATTERN));

        try {

            const username: string = body.directEnsure('username');
            const namespace: string = body.directEnsure('namespace');
            const resetToken: string = body.directEnsure('resetToken');
            const matched: AccountNamespaceMatch = await MatchController.getAccountNamespaceMatchByUsernameAndNamespace(username, namespace);

            if (matched.succeed === false) {

                switch (matched.reason) {
                    case MATCH_FAILS_REASON.ACCOUNT_NOT_FOUND: {

                        SudooLog.global.error(buildNotMatchReason(NOT_MATCH_REASON.ACCOUNT_NOT_FOUND, username, namespace));
                        throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH, username, namespace);
                    }
                    case MATCH_FAILS_REASON.NAMESPACE_NOT_FOUND: {

                        SudooLog.global.error(buildNotMatchReason(NOT_MATCH_REASON.NAMESPACE_NOT_FOUND, username, namespace));
                        throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH, username, namespace);
                    }
                }
            }

            const account: IAccountModel = matched.account;
            const namespaceInstance: INamespaceModel = matched.namespace;

            if (account.attemptPoints <= 0) {
                throw this._error(ERROR_CODE.OUT_OF_ATTEMPT, account.username, namespaceInstance.namespace);
            }

            const tokenMatched: boolean = account.verifyResetToken(resetToken);

            if (!tokenMatched) {

                account.useAttemptPoint(RESET_TOKEN_ATTEMPT_CONSUME);
                await account.save();
                throw this._error(ERROR_CODE.TOKEN_DOES_NOT_MATCH, account.username, namespaceInstance.namespace);
            }

            if (!account.active) {
                throw this._error(ERROR_CODE.INACTIVE_ACCOUNT, account.username, namespaceInstance.namespace);
            }

            const newPassword: string = body.directEnsure('newPassword');

            const validateResult: PASSWORD_VALIDATE_RESPONSE = validatePassword(newPassword);

            if (validateResult !== PASSWORD_VALIDATE_RESPONSE.OK) {
                if (validateResult !== PASSWORD_VALIDATE_RESPONSE.ONLY_KEYBOARD_CHARACTER_AVAILABLE) {
                    throw this._error(ERROR_CODE.INVALID_PASSWORD, validateResult);
                }
                throw this._error(ERROR_CODE.WIRED_PASSWORD, validateResult);
            }

            account.setPassword(newPassword, 'change');
            account.limbo = false;
            account.clearResetTokens();
            account.resetAttempt();
            await account.save();

            res.agent.add('succeed', true);
        } catch (err) {

            res.agent.fail(HTTP_RESPONSE_CODE.UNAUTHORIZED, err);
        } finally {
            next();
        }
    }
}
