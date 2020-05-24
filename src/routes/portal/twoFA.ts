/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description TwoFA
 */

import { AccountNamespaceMatch, ApplicationController, IAccountModel, IApplicationModel, IAttemptModel, INamespaceModel, MATCH_FAILS_REASON, MatchController } from "@brontosaurus/db";
import { createUnsavedAttempt } from "@brontosaurus/db/controller/attempt";
import { IBrontosaurusBody } from "@brontosaurus/definition";
import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { SudooLog } from "@sudoo/log";
import { HTTP_RESPONSE_CODE } from "@sudoo/magic";
import { basicHook } from "../../handlers/hook";
import { AccountHasOneOfApplicationGroups } from "../../util/auth";
import { buildNotMatchReason, ERROR_CODE, NOT_MATCH_REASON } from "../../util/error";
import { buildBrontosaurusBody, createToken } from '../../util/token';
import { BrontosaurusRoute } from "../basic";

export type TwoFARouteBody = {

    readonly username: string;
    readonly namespace: string;
    readonly password: string;
    readonly code: string;
    readonly applicationKey: string;

    readonly platform: string;
    readonly userAgent: string;
};

export class TwoFARoute extends BrontosaurusRoute {

    public readonly path: string = '/twoFA';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(this._twoFAHandler.bind(this), '/twoFA - TwoFA'),
    ];

    private async _twoFAHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<TwoFARouteBody> = Safe.extract(req.body as TwoFARouteBody, this._error(ERROR_CODE.REQUEST_DOES_MATCH_PATTERN));

        try {

            const username: string = body.directEnsure('username');
            const namespace: string = body.directEnsure('namespace');

            const platform: string = body.directEnsure('platform');
            const userAgent: string = body.directEnsure('userAgent');

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

            const passwordMatched: boolean = account.verifyPassword(body.directEnsure('password'));

            if (!passwordMatched) {
                SudooLog.global.error(buildNotMatchReason(NOT_MATCH_REASON.PASSWORD_NOT_MATCHED, account.username, namespaceInstance.namespace));
                throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH, account.username, namespaceInstance.namespace);
            }

            if (!account.active) {
                throw this._error(ERROR_CODE.INACTIVE_ACCOUNT, account.username, namespaceInstance.namespace);
            }

            const code: string = body.directEnsure('code');
            const verifyResult: boolean = account.verifyTwoFA(code);

            if (!verifyResult) {

                // tslint:disable-next-line: no-magic-numbers
                account.useAttemptPoint(5);
                await account.save();

                throw this._error(ERROR_CODE.TWO_FA_DOES_NOT_MATCH, account.username);
            }

            const application: IApplicationModel | null = await ApplicationController.getApplicationByKey(body.directEnsure('applicationKey'));

            if (!application) {
                throw this._error(ERROR_CODE.APPLICATION_KEY_NOT_FOUND);
            }

            if (!application.portalAccess) {
                throw this._error(ERROR_CODE.APPLICATION_HAS_NO_PORTAL_ACCESS);
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

            const attempt: IAttemptModel = createUnsavedAttempt({
                account: account._id,
                succeed: true,
                platform,
                userAgent,
                source: req.ip,
                proxySources: req.ips,
                application: application._id,
            });

            await attempt.save();

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
