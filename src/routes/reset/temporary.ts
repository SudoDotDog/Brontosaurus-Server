/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Reset
 * @description Temporary
 */

import { AccountNamespaceMatch, ApplicationController, IAccountModel, IApplicationModel, INamespaceModel, MatchController, MATCH_FAILS_REASON, PreferenceController } from "@brontosaurus/db";
import { IResetModel } from "@brontosaurus/db/model/reset";
import { createStringedBodyVerifyHandler, ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { SudooLog } from "@sudoo/log";
import { TIME_IN_MILLISECONDS } from "@sudoo/magic";
import { createStringPattern, Pattern } from "@sudoo/pattern";
import { fillStringedResult, StringedResult } from "@sudoo/verify";
import { sentEmailAgent, SentEmailOption } from "../../agent/email";
import { autoHook } from "../../handlers/hook";
import { compareEmail } from "../../util/email";
import { buildNotMatchReason, ERROR_CODE, NOT_MATCH_REASON } from "../../util/error";
import { saveResetByObjects } from "../../util/reset";
import { BaseAttemptBody, BrontosaurusRoute, extendAttemptBodyPattern } from "../basic";

const bodyPattern: Pattern = extendAttemptBodyPattern({

    username: createStringPattern(),
    namespace: createStringPattern(),
    email: createStringPattern(),
    applicationKey: createStringPattern(),
});

export type ResetTemporaryRouteBody = {

    readonly username: string;
    readonly namespace: string;
    readonly email: string;
    readonly applicationKey: string;
} & BaseAttemptBody;

export class ResetTemporaryRoute extends BrontosaurusRoute {

    public readonly path: string = '/reset/temporary';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        autoHook.wrap(createStringedBodyVerifyHandler(bodyPattern), 'Body Verify'),
        autoHook.wrap(this._resetTemporaryHandler.bind(this), 'Reset Temporary'),
    ];

    private async _resetTemporaryHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: ResetTemporaryRouteBody = req.body;

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
            const application: IApplicationModel | null = await ApplicationController.getApplicationByKey(body.applicationKey);

            if (!application) {
                throw this._error(ERROR_CODE.APPLICATION_NOT_FOUND, body.applicationKey);
            }

            if (!account.active) {
                throw this._error(ERROR_CODE.INACTIVE_ACCOUNT, account.username, namespaceInstance.namespace);
            }

            const emailCompareResult: boolean = compareEmail(account.email, body.email);
            if (!emailCompareResult) {

                const failedReset: IResetModel = await saveResetByObjects({
                    account,
                    application,
                    request: req,
                    platform: body.platform,
                    target: body.target,
                    succeed: false,
                    emailUsed: body.email,
                });

                await failedReset.save();
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

            const reset: IResetModel = await saveResetByObjects({
                account,
                application,
                request: req,
                platform: body.platform,
                target: body.target,
                succeed: true,
                emailUsed: body.email,
            });

            await reset.save();

            const now: number = Date.now();
            const dueDate: Date = new Date(now + TIME_IN_MILLISECONDS.MONTH);
            const resetToken: string = account.generateResetToken(dueDate);

            const result: boolean = await this._sentEmail(mailerTransport, {
                from: mailerSourceResetPassword,
                to: body.email,
                subject: 'Temporary Password',
                html: this._createHtmlContent(body.username, resetToken),
                text: this._createTextContent(body.username, resetToken),
            });

            if (!result) {
                throw this._error(ERROR_CODE.EMAIL_SEND_FAILED, 'Result');
            }

            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            account.attemptPoints = Math.min(100, account.attemptPoints + 50);

            await account.save();
        } catch (err) {

            SudooLog.global.warning(`Reset Password Not Match Username: ${String(body.username)}, Namespace: ${String(body.namespace)}, Email: ${String(body.email)}`);
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
