/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description TwoFA
 */

import { AccountNamespaceMatch, ApplicationController, IAccountModel, IApplicationModel, IAttemptModel, INamespaceModel, MatchController, MATCH_FAILS_REASON } from "@brontosaurus/db";
import { IBrontosaurusBody } from "@brontosaurus/definition";
import { createStringedBodyVerifyHandler, ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { SudooLog } from "@sudoo/log";
import { HTTP_RESPONSE_CODE } from "@sudoo/magic";
import { createStringPattern, Pattern } from "@sudoo/pattern";
import { fillStringedResult, StringedResult } from "@sudoo/verify";
import { TWO_FA_ATTEMPT_CONSUME } from "../../declare/attempt";
import { autoHook } from "../../handlers/hook";
import { saveAttemptByObjects } from "../../util/attempt";
import { AccountHasOneOfApplicationGroups } from "../../util/auth";
import { buildNotMatchReason, ERROR_CODE, NOT_MATCH_REASON } from "../../util/error";
import { validateRedirection } from "../../util/redirection";
import { buildBrontosaurusBody, createToken } from '../../util/token';
import { BaseAttemptBody, BrontosaurusRoute, extendAttemptBodyPattern } from "../basic";

const bodyPattern: Pattern = extendAttemptBodyPattern({

    username: createStringPattern(),
    namespace: createStringPattern(),
    password: createStringPattern(),
    code: createStringPattern(),
    applicationKey: createStringPattern(),
});

export type TwoFARouteBody = {

    readonly username: string;
    readonly namespace: string;
    readonly password: string;
    readonly code: string;
    readonly applicationKey: string;
} & BaseAttemptBody;

export class TwoFARoute extends BrontosaurusRoute {

    public readonly path: string = '/twoFA';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        autoHook.wrap(createStringedBodyVerifyHandler(bodyPattern), 'Body Verify'),
        autoHook.wrap(this._twoFAHandler.bind(this), 'TwoFA'),
    ];

    private async _twoFAHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: TwoFARouteBody = req.body;

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

            const passwordMatched: boolean = account.verifyPassword(body.password);

            if (!passwordMatched) {
                SudooLog.global.error(buildNotMatchReason(NOT_MATCH_REASON.PASSWORD_NOT_MATCHED, account.username, namespaceInstance.namespace));
                throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH, account.username, namespaceInstance.namespace);
            }

            if (!account.active) {
                throw this._error(ERROR_CODE.INACTIVE_ACCOUNT, account.username, namespaceInstance.namespace);
            }

            const verifyResult: boolean = account.verifyTwoFA(body.code);

            if (!verifyResult) {

                account.useAttemptPoint(TWO_FA_ATTEMPT_CONSUME);
                await account.save();

                throw this._error(ERROR_CODE.TWO_FA_DOES_NOT_MATCH, account.username);
            }

            const application: IApplicationModel | null = await ApplicationController.getApplicationByKey(body.applicationKey);

            if (!application) {
                throw this._error(ERROR_CODE.APPLICATION_KEY_NOT_FOUND);
            }

            if (!application.active) {
                throw this._error(ERROR_CODE.APPLICATION_INACTIVE)
            }

            if (!application.portalAccess) {
                throw this._error(ERROR_CODE.APPLICATION_HAS_NO_PORTAL_ACCESS);
            }

            if (!validateRedirection(application, body.target)) {
                throw this._error(ERROR_CODE.UNTRUSTED_REDIRECTION);
            }

            account.resetAttempt();
            await account.save();

            if (!AccountHasOneOfApplicationGroups(application, account)) {
                throw this._error(ERROR_CODE.APPLICATION_GROUP_NOT_FULFILLED);
            }

            const object: IBrontosaurusBody | null = await buildBrontosaurusBody(account, namespaceInstance, application);

            if (!object) {
                throw this._error(ERROR_CODE.ORGANIZATION_NOT_FOUND, (account.organization as any).toHexString());
            }

            const attempt: IAttemptModel = await saveAttemptByObjects({
                account,
                application,
                request: req,
                platform: body.platform,
                target: body.target,
            });

            const token: string = createToken(attempt.identifier, object, application);

            res.agent.add('limbo', account.limbo);
            res.agent.add('needTwoFA', Boolean(account.twoFA));
            res.agent.add('token', token);
        } catch (err) {

            res.agent.fail(HTTP_RESPONSE_CODE.UNAUTHORIZED, err);
        } finally {
            next();
        }
    }
}
