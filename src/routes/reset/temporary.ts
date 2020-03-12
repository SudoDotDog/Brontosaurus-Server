/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Reset
 * @description Temporary
 */

import { AccountNamespaceMatch, IAccountModel, INamespaceModel, MATCH_FAILS_REASON, MatchController, PreferenceController } from "@brontosaurus/db";
import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { SudooLog } from "@sudoo/log";
import { TIME_IN_MILLISECONDS } from "@sudoo/magic";
import { sentEmailAgent, SentEmailOption } from "../../agent/email";
import { basicHook } from "../../handlers/hook";
import { buildNotMatchReason, ERROR_CODE, NOT_MATCH_REASON } from "../../util/error";
import { BrontosaurusRoute } from "../basic";

export type ResetTemporaryRouteBody = {

    readonly username: string;
    readonly namespace: string;
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
            const namespace: string = body.directEnsure('namespace');
            const email: string = body.directEnsure('email');
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

            if (!account.active) {
                throw this._error(ERROR_CODE.INACTIVE_ACCOUNT, account.username, namespaceInstance.namespace);
            }

            if (account.email !== email) {
                throw this._error(ERROR_CODE.EMAIL_DOES_NOT_MATCH);
            }

            const mailerTransport: any | null = await PreferenceController.getSinglePreference('mailerTransport');
            const mailerSourceResetPassword: string | null = await PreferenceController.getSinglePreference('mailerSourceResetPassword');

            if (!mailerTransport) {
                throw this._error(ERROR_CODE.NEED_CONFIG_MAILER);
            }
            if (!mailerSourceResetPassword) {
                throw this._error(ERROR_CODE.NEED_CONFIG_MAILER);
            }

            const now: number = Date.now();
            const dueDate: Date = new Date(now + TIME_IN_MILLISECONDS.MONTH);
            const resetToken: string = account.generateResetToken(dueDate);

            const result: boolean = await this._sentEmail(mailerTransport, {
                from: mailerSourceResetPassword,
                to: email,
                subject: 'Temporary Password',
                html: this._createHtmlContent(username, resetToken),
                text: this._createTextContent(username, resetToken),
            });

            if (!result) {
                throw this._error(ERROR_CODE.EMAIL_SEND_FAILED, 'Result');
            }

            // tslint:disable-next-line: no-magic-numbers
            account.attemptPoints = Math.min(100, account.attemptPoints + 50);

            await account.save();
        } catch (err) {

            SudooLog.global.warning(`Reset Password Not Match Username: ${String(req.body.username)}, Namespace: ${String(req.body.namespace)}, Email: ${String(req.body.email)}`);
        } finally {
            res.agent.add('finish', 'finish');
            next();
        }
    }

    private async _sentEmail(config: any, options: SentEmailOption): Promise<boolean> {

        try {

            const result: boolean = await sentEmailAgent(config, options);
            return result;
        } catch (err) {

            throw this._error(ERROR_CODE.EMAIL_SEND_FAILED, err.toString());
        }
    }

    private _createHtmlContent(username: string, password: string): string {

        return [
            `<div>Username: <strong>${username}</strong></div>`,
            `<div>Password: <strong>${password}</strong></div>`,
        ].join('\n');
    }

    private _createTextContent(username: string, password: string): string {

        return [
            `Username: ${username}`,
            `Password: ${password}`,
        ].join('\n');
    }
}
