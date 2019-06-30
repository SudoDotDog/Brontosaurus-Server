/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description TwoFA
 */

import { AccountController, ApplicationController, GroupController, IAccountModel, IApplicationModel, IGroupModel, IOrganizationModel, OrganizationController } from "@brontosaurus/db";
import { IBrontosaurusBody } from "@brontosaurus/definition";
import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { basicHook } from "../../handlers/hook";
import { ERROR_CODE } from "../../util/error";
import { createToken } from '../../util/token';
import { BrontosaurusRoute } from "../basic";

export type TwoFARouteBody = {

    readonly username: string;
    readonly password: string;
    readonly code: string;
    readonly applicationKey: string;
};

export class TwoFARoute extends BrontosaurusRoute {

    public readonly path: string = '/twoFA';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(this._twoFAHandler.bind(this), '/twoFA - TwoFA', true),
    ];

    private async _twoFAHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<TwoFARouteBody> = Safe.extract(req.body as TwoFARouteBody, this._error(ERROR_CODE.REQUEST_DOES_MATCH_PATTERN));

        try {

            const username: string = body.directEnsure('username');
            const account: IAccountModel | null = await AccountController.getAccountByUsername(username);

            if (!account) {
                throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH);
            }

            if (!account.active) {
                throw this._error(ERROR_CODE.INACTIVE_ACCOUNT, account.username);
            }

            if (account.attemptPoints <= 0) {
                throw this._error(ERROR_CODE.OUT_OF_ATTEMPT);
            }

            const passwordMatched: boolean = account.verifyPassword(body.directEnsure('password'));

            if (!passwordMatched) {
                throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH);
            }

            const code: string = body.directEnsure('code');
            const verifyResult: boolean = account.verifyTwoFA(code);

            if (!verifyResult) {

                account.useAttemptPoint(5);
                await account.save();

                throw this._error(ERROR_CODE.TWO_FA_DOES_NOT_MATCH);
            }

            const application: IApplicationModel | null = await ApplicationController.getApplicationByKey(body.directEnsure('applicationKey'));

            if (!application) {
                throw this._error(ERROR_CODE.APPLICATION_KEY_NOT_FOUND);
            }

            account.resetAttempt();
            await account.save();

            const object: IBrontosaurusBody = await this._buildBrontosaurusBody(account);
            const token: string = createToken(object, application);

            res.agent.add('limbo', account.limbo);
            res.agent.add('needTwoFA', Boolean(account.twoFA));
            res.agent.add('token', token);
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }

    private async _buildBrontosaurusBody(account: IAccountModel): Promise<IBrontosaurusBody> {

        const groups: IGroupModel[] = await GroupController.getGroupsByIds(account.groups);

        if (account.organization) {

            const organization: IOrganizationModel | null = await OrganizationController.getOrganizationById(account.organization);

            if (!organization) {
                throw this._error(ERROR_CODE.ORGANIZATION_NOT_FOUND, account.organization.toHexString());
            }

            return {
                username: account.username,
                mint: account.mint,
                organization: organization.name,
                groups: groups.map((group: IGroupModel) => group.name),
                infos: account.getInfoRecords(),
                beacons: account.getBeaconRecords(),
            };
        }

        return {
            username: account.username,
            mint: account.mint,
            groups: groups.map((group: IGroupModel) => group.name),
            infos: account.getInfoRecords(),
            beacons: account.getBeaconRecords(),
        };
    }
}
