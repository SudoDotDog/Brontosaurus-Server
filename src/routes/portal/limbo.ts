/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Limbo
 */

import { AccountController, ApplicationController, IAccountModel, IApplicationModel, PASSWORD_VALIDATE_RESPONSE, validatePassword } from "@brontosaurus/db";
import { IBrontosaurusBody } from "@brontosaurus/definition";
import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { HTTP_RESPONSE_CODE } from "@sudoo/magic";
import { basicHook } from "../../handlers/hook";
import { AccountHasOneOfApplicationGroups } from "../../util/auth";
import { ERROR_CODE } from "../../util/error";
import { buildBrontosaurusBody, createToken } from '../../util/token';
import { BrontosaurusRoute } from "../basic";

export type LimboRouteBody = {

    readonly username: string;
    readonly oldPassword: string;
    readonly newPassword: string;
    readonly applicationKey: string;
};

export class LimboRoute extends BrontosaurusRoute {

    public readonly path: string = '/limbo';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(this._limboHandler.bind(this), '/limbo - Limbo'),
    ];

    private async _limboHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<LimboRouteBody> = Safe.extract(req.body as LimboRouteBody, this._error(ERROR_CODE.REQUEST_DOES_MATCH_PATTERN));

        try {

            const username: string = body.directEnsure('username');
            const account: IAccountModel | null = await AccountController.getAccountByUsername(username);

            if (!account) {
                throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH, username);
            }

            if (account.attemptPoints <= 0) {
                throw this._error(ERROR_CODE.OUT_OF_ATTEMPT, account.username);
            }

            const passwordMatched: boolean = account.verifyPassword(body.directEnsure('oldPassword'));

            if (!passwordMatched) {
                throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH, account.username);
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

            const application: IApplicationModel | null = await ApplicationController.getApplicationByKey(body.directEnsure('applicationKey'));

            if (!application) {
                throw this._error(ERROR_CODE.APPLICATION_KEY_NOT_FOUND);
            }

            if (!application.portalAccess) {
                throw this._error(ERROR_CODE.APPLICATION_HAS_NO_PORTAL_ACCESS);
            }

            account.setPassword(newPassword);
            account.limbo = false;
            account.resetAttempt();
            await account.save();

            if (!AccountHasOneOfApplicationGroups(application, account)) {
                throw this._error(ERROR_CODE.APPLICATION_GROUP_NOT_FULFILLED);
            }

            const object: IBrontosaurusBody | null = await buildBrontosaurusBody(account, application);

            if (!object) {
                throw this._error(ERROR_CODE.ORGANIZATION_NOT_FOUND, (account.organization as any).toHexString());
            }

            const token: string = createToken(object, application);

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
