/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Retrieve
 */

import { AccountController, ApplicationController, GroupController, IAccountModel, IApplicationModel, IGroupModel, IOrganizationModel, OrganizationController } from "@brontosaurus/db";
import { IBrontosaurusBody } from "@brontosaurus/definition";
import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { basicHook } from "../../handlers/hook";
import { ERROR_CODE } from "../../util/error";
import { createToken } from '../../util/token';
import { BrontosaurusRoute } from "../basic";

export type RetrieveRouteBody = {

    readonly username: string;
    readonly password: string;
    readonly applicationKey: string;
};

export class RetrieveRoute extends BrontosaurusRoute {

    public readonly path: string = '/retrieve';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(this._retrieveHandler.bind(this), '/retrieve - Retrieve', true),
    ];

    private async _retrieveHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<RetrieveRouteBody> = Safe.extract(req.body as RetrieveRouteBody, this._error(ERROR_CODE.REQUEST_DOES_MATCH_PATTERN));

        try {

            const account: IAccountModel | null = await AccountController.getAccountByUsername(body.directEnsure('username'));

            if (!account) {
                throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH);
            }

            if (account.attemptLeft <= 0) {
                throw this._error(ERROR_CODE.OUT_OF_ATTEMPT);
            }

            const passwordMatched: boolean = account.verifyPassword(body.directEnsure('password'));

            if (!passwordMatched) {
                account.attemptLeft = account.attemptLeft - 1;
                await account.save();
                throw this._error(ERROR_CODE.PASSWORD_DOES_NOT_MATCH);
            }

            res.agent.add('limbo', Boolean(account.limbo));
            res.agent.add('needTwoFA', Boolean(account.twoFA));

            if (account.limbo || account.twoFA) {

                res.agent.add('token', null);
            } else {

                const application: IApplicationModel | null = await ApplicationController.getApplicationByKey(body.directEnsure('applicationKey'));

                if (!application) {
                    throw this._error(ERROR_CODE.APPLICATION_KEY_NOT_FOUND);
                }

                const object: IBrontosaurusBody = await this._buildBrontosaurusBody(account);
                const token: string = createToken(object, application);

                account.resetAttempt();
                await account.save();

                res.agent.add('token', token);
            }
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
