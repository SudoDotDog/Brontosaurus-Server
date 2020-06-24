/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Retrieve
 */

import { AccountNamespaceMatch, ApplicationController, IAccountModel, IApplicationModel, IAttemptModel, INamespaceModel, MatchController, MATCH_FAILS_REASON } from "@brontosaurus/db";
import { IBrontosaurusBody } from "@brontosaurus/definition";
import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { SudooLog } from "@sudoo/log";
import { HTTP_RESPONSE_CODE } from "@sudoo/magic";
import { autoHook } from "../../handlers/hook";
import { saveAttemptByObjects } from "../../util/attempt";
import { AccountHasOneOfApplicationGroups } from "../../util/auth";
import { buildNotMatchReason, ERROR_CODE, NOT_MATCH_REASON } from "../../util/error";
import { validateRedirection } from "../../util/redirection";
import { buildBrontosaurusBody, createToken } from '../../util/token';
import { BaseAttemptBody, BrontosaurusRoute } from "../basic";

export type RetrieveRouteBody = {

    readonly username: string;
    readonly namespace: string;
    readonly password: string;
    readonly applicationKey: string;
} & BaseAttemptBody;

export class RetrieveRoute extends BrontosaurusRoute {

    public readonly path: string = '/retrieve';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        autoHook.wrap(this._retrieveHandler.bind(this), 'Retrieve'),
    ];

    private async _retrieveHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<RetrieveRouteBody> = Safe.extract(req.body as RetrieveRouteBody, this._error(ERROR_CODE.REQUEST_DOES_MATCH_PATTERN));

        try {

            const username: string = body.directEnsure('username');
            const namespace: string = body.directEnsure('namespace');

            const target: string = body.directEnsure('target');
            const platform: string = body.directEnsure('platform');

            const applicationKey: string = body.directEnsure('applicationKey');

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

            const password: string = body.directEnsure('password');

            const passwordMatched: boolean = account.verifyPassword(password);
            const applicationOrTemporaryPasswordMatched: boolean = account.verifySpecialPasswords(password);

            if (!passwordMatched && !applicationOrTemporaryPasswordMatched) {

                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                account.useAttemptPoint(20);
                await account.save();
                SudooLog.global.error(buildNotMatchReason(NOT_MATCH_REASON.PASSWORD_NOT_MATCHED, account.username, namespaceInstance.namespace));
                throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH, account.username, namespaceInstance.namespace);
            }

            if (!account.active) {
                throw this._error(ERROR_CODE.INACTIVE_ACCOUNT, account.username, namespaceInstance.namespace);
            }

            if (applicationOrTemporaryPasswordMatched) {

                res.agent.add('limbo', false);
                res.agent.add('needTwoFA', false);

                const application: IApplicationModel | null = await ApplicationController.getApplicationByKey(applicationKey);

                if (!application) {
                    throw this._error(ERROR_CODE.APPLICATION_KEY_NOT_FOUND);
                }

                if (!application.portalAccess) {
                    throw this._error(ERROR_CODE.APPLICATION_HAS_NO_PORTAL_ACCESS);
                }

                if (!validateRedirection(application, target)) {
                    throw this._error(ERROR_CODE.UNTRUSTED_REDIRECTION);
                }

                if (!AccountHasOneOfApplicationGroups(application, account)) {
                    throw this._error(ERROR_CODE.APPLICATION_GROUP_NOT_FULFILLED);
                }

                const object: IBrontosaurusBody | null = await buildBrontosaurusBody(account, namespaceInstance, application, ['SPECIAL_PASSWORD']);

                if (!object) {
                    throw this._error(ERROR_CODE.ORGANIZATION_NOT_FOUND, (account.organization as any).toHexString());
                }

                const attempt: IAttemptModel = await saveAttemptByObjects({
                    account,
                    application,
                    request: req,
                    platform,
                    target,
                });

                const token: string = createToken(attempt.identifier, object, application);

                res.agent.add('token', token);
            } else {

                res.agent.add('limbo', Boolean(account.limbo));
                res.agent.add('needTwoFA', Boolean(account.twoFA));

                if (account.limbo || account.twoFA) {

                    res.agent.add('token', null);
                } else {

                    const application: IApplicationModel | null = await ApplicationController.getApplicationByKey(applicationKey);

                    if (!application) {
                        throw this._error(ERROR_CODE.APPLICATION_KEY_NOT_FOUND);
                    }

                    if (!application.portalAccess) {
                        throw this._error(ERROR_CODE.APPLICATION_HAS_NO_PORTAL_ACCESS);
                    }

                    if (!validateRedirection(application, target)) {
                        throw this._error(ERROR_CODE.UNTRUSTED_REDIRECTION);
                    }

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
                        platform,
                        target,
                    });

                    const token: string = createToken(attempt.identifier, object, application);

                    account.resetAttempt();
                    await account.save();

                    res.agent.add('token', token);
                }
            }
        } catch (err) {

            res.agent.fail(HTTP_RESPONSE_CODE.UNAUTHORIZED, err);
        } finally {
            next();
        }
    }
}
