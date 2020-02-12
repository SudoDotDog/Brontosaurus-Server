/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Reset
 * @description Reset
 */

import { AccountController, IAccountModel } from "@brontosaurus/db";
import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { HTTP_RESPONSE_CODE } from "@sudoo/magic";
import { basicHook } from "../../handlers/hook";
import { ERROR_CODE } from "../../util/error";
import { BrontosaurusRoute } from "../basic";

export type ResetResetRouteBody = {

    readonly username: string;
    readonly resetToken: string;
};

export class ResetResetRoute extends BrontosaurusRoute {

    public readonly path: string = '/reset/reset';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(this._resetResetHandler.bind(this), '/reset/reset - Reset Password'),
    ];

    private async _resetResetHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<ResetResetRouteBody> = Safe.extract(req.body as ResetResetRouteBody, this._error(ERROR_CODE.REQUEST_DOES_MATCH_PATTERN));

        try {

            const username: string = body.directEnsure('username');
            const resetToken: string = body.directEnsure('resetToken');
            const account: IAccountModel | null = await AccountController.getAccountByUsername(username);

            if (!account) {
                throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH);
            }

            if (account.attemptPoints <= 0) {
                throw this._error(ERROR_CODE.OUT_OF_ATTEMPT);
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
