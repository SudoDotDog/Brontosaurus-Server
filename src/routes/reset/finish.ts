/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Reset
 * @description Finish
 */

import { AccountController, IAccountModel, PASSWORD_VALIDATE_RESPONSE, validatePassword } from "@brontosaurus/db";
import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { HTTP_RESPONSE_CODE } from "@sudoo/magic";
import { basicHook } from "../../handlers/hook";
import { ERROR_CODE } from "../../util/error";
import { BrontosaurusRoute } from "../basic";

export type ResetFinishRouteBody = {

    readonly username: string;
    readonly resetToken: string;
    readonly newPassword: string;
};

export class ResetFinishRoute extends BrontosaurusRoute {

    public readonly path: string = '/reset/finish';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(this._resetFinishHandler.bind(this), '/reset/finish - Reset Finish'),
    ];

    private async _resetFinishHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<ResetFinishRouteBody> = Safe.extract(req.body as ResetFinishRouteBody, this._error(ERROR_CODE.REQUEST_DOES_MATCH_PATTERN));

        try {

            const username: string = body.directEnsure('username');
            const resetToken: string = body.directEnsure('resetToken');
            const account: IAccountModel | null = await AccountController.getAccountByUsername(username);

            if (!account) {
                throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH, username);
            }

            if (account.attemptPoints <= 0) {
                throw this._error(ERROR_CODE.OUT_OF_ATTEMPT, account.username);
            }

            const tokenMatched: boolean = account.verifyResetToken(resetToken);

            if (!tokenMatched) {
                // tslint:disable-next-line: no-magic-numbers
                account.useAttemptPoint(15);
                await account.save();
                throw this._error(ERROR_CODE.TOKEN_DOES_NOT_MATCH);
            }

            if (!account.active) {
                throw this._error(ERROR_CODE.INACTIVE_ACCOUNT, account.username);
            }

            const newPassword: string = body.directEnsure('newPassword');

            const validateResult: PASSWORD_VALIDATE_RESPONSE = validatePassword(newPassword);

            if (validateResult !== PASSWORD_VALIDATE_RESPONSE.OK) {
                if (validateResult !== PASSWORD_VALIDATE_RESPONSE.ONLY_KEYBOARD_CHARACTER_AVAILABLE) {
                    throw this._error(ERROR_CODE.INVALID_PASSWORD, validateResult);
                }
                throw this._error(ERROR_CODE.WIRED_PASSWORD, validateResult);
            }

            account.setPassword(newPassword);
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
