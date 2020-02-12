/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Reset
 * @description Temporary
 */

import { AccountController, IAccountModel } from "@brontosaurus/db";
import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { SudooLog } from "@sudoo/log";
import { TIME_IN_MILLISECONDS } from "@sudoo/magic";
import { basicHook } from "../../handlers/hook";
import { ERROR_CODE } from "../../util/error";
import { BrontosaurusRoute } from "../basic";

export type ResetTemporaryRouteBody = {

    readonly username: string;
    readonly email: string;
};

export class ResetTemporaryRoute extends BrontosaurusRoute {

    public readonly path: string = '/reset/temporary';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(this._resetTemporaryHandler.bind(this), '/reset/temporary - Reset Temporary'),
    ];

    private async _resetTemporaryHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<ResetTemporaryRouteBody> = Safe.extract(req.body as ResetTemporaryRouteBody, this._error(ERROR_CODE.REQUEST_DOES_MATCH_PATTERN));

        try {

            const username: string = body.directEnsure('username');
            const email: string = body.directEnsure('email');
            const account: IAccountModel | null = await AccountController.getAccountByUsername(username);

            if (!account) {
                throw this._error(ERROR_CODE.ACCOUNT_NOT_FOUND);
            }

            if (!account.active) {
                throw this._error(ERROR_CODE.INACTIVE_ACCOUNT, account.username);
            }

            if (account.email === email) {

                // SendEmail
                const now: number = Date.now();
                const dueDate: Date = new Date(now + TIME_IN_MILLISECONDS.MONTH);
                const resetToken: string = account.generateResetToken(dueDate);
                // tslint:disable-next-line: no-magic-numbers
                account.addAttemptPoint(50);
                console.log(resetToken, dueDate);
            }

            await account.save();
        } catch (err) {

            SudooLog.global.warning(`Reset Password Not Match Username: ${String(req.body.username)}, Email: ${String(req.body.email)}`);
        } finally {
            res.agent.add('finish', 'finish');
            next();
        }
    }
}
