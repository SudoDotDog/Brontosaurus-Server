/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Retrieve
 */

import { AccountController, ApplicationController, IAccountModel, IApplicationModel, INamespaceModel, NamespaceController } from "@brontosaurus/db";
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

export type RetrieveRouteBody = {

    readonly username: string;
    readonly namespace: string;
    readonly password: string;
    readonly applicationKey: string;
};

export class RetrieveRoute extends BrontosaurusRoute {

    public readonly path: string = '/retrieve';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(this._retrieveHandler.bind(this), '/retrieve - Retrieve'),
    ];

    private async _retrieveHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<RetrieveRouteBody> = Safe.extract(req.body as RetrieveRouteBody, this._error(ERROR_CODE.REQUEST_DOES_MATCH_PATTERN));

        try {

            const username: string = body.directEnsure('username');
            const namespace: string = body.directEnsure('namespace');
            const account: IAccountModel | null = await AccountController.getAccountByUsername(username);

            if (!account) {
                SudooLog.global.error(buildNotMatchReason(NOT_MATCH_REASON.ACCOUNT_NOT_FOUND, username, namespace));
                throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH, username, namespace);
            }

            const namespaceInstance: INamespaceModel | null = await NamespaceController.getNamespaceByNamespace(namespace);

            if (!namespaceInstance) {
                SudooLog.global.error(buildNotMatchReason(NOT_MATCH_REASON.NAMESPACE_NOT_FOUND, account.username, namespace));
                throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH, account.username, namespace);
            }

            if (account.namespace.toHexString() !== namespaceInstance._id.toString()) {
                SudooLog.global.error(buildNotMatchReason(NOT_MATCH_REASON.NAMESPACE_NOT_MATCHED, account.username, namespaceInstance.namespace));
                throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH, account.username, namespaceInstance.namespace);
            }

            if (account.attemptPoints <= 0) {
                throw this._error(ERROR_CODE.OUT_OF_ATTEMPT, account.username, namespaceInstance.namespace);
            }

            const password: string = body.directEnsure('password');

            const passwordMatched: boolean = account.verifyPassword(password);
            const applicationOrTemporaryPasswordMatched: boolean = account.verifySpecialPasswords(password);

            if (!passwordMatched && !applicationOrTemporaryPasswordMatched) {

                // tslint:disable-next-line: no-magic-numbers
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

                const application: IApplicationModel | null = await ApplicationController.getApplicationByKey(body.directEnsure('applicationKey'));

                if (!application) {
                    throw this._error(ERROR_CODE.APPLICATION_KEY_NOT_FOUND);
                }

                if (!application.portalAccess) {
                    throw this._error(ERROR_CODE.APPLICATION_HAS_NO_PORTAL_ACCESS);
                }

                if (!AccountHasOneOfApplicationGroups(application, account)) {
                    throw this._error(ERROR_CODE.APPLICATION_GROUP_NOT_FULFILLED);
                }

                const object: IBrontosaurusBody | null = await buildBrontosaurusBody(account, application, ['SPECIAL_PASSWORD']);

                if (!object) {
                    throw this._error(ERROR_CODE.ORGANIZATION_NOT_FOUND, (account.organization as any).toHexString());
                }

                const token: string = createToken(object, application);

                res.agent.add('token', token);
            } else {

                res.agent.add('limbo', Boolean(account.limbo));
                res.agent.add('needTwoFA', Boolean(account.twoFA));

                if (account.limbo || account.twoFA) {

                    res.agent.add('token', null);
                } else {

                    const application: IApplicationModel | null = await ApplicationController.getApplicationByKey(body.directEnsure('applicationKey'));

                    if (!application) {
                        throw this._error(ERROR_CODE.APPLICATION_KEY_NOT_FOUND);
                    }

                    if (!application.portalAccess) {
                        throw this._error(ERROR_CODE.APPLICATION_HAS_NO_PORTAL_ACCESS);
                    }

                    if (!AccountHasOneOfApplicationGroups(application, account)) {
                        throw this._error(ERROR_CODE.APPLICATION_GROUP_NOT_FULFILLED);
                    }

                    const object: IBrontosaurusBody | null = await buildBrontosaurusBody(account, application);

                    if (!object) {
                        throw this._error(ERROR_CODE.ORGANIZATION_NOT_FOUND, (account.organization as any).toHexString());
                    }

                    const token: string = createToken(object, application);

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
