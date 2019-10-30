/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Retrieve
 */

import { AccountController, ApplicationController, GroupController, IAccountModel, IApplicationModel, IGroupModel, IOrganizationModel, ITagModel, OrganizationController, TagController } from "@brontosaurus/db";
import { IBrontosaurusBody } from "@brontosaurus/definition";
import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { basicHook } from "../../handlers/hook";
import { AccountHasOneOfApplicationGroups } from "../../util/auth";
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

            if (!account.active) {
                throw this._error(ERROR_CODE.INACTIVE_ACCOUNT, account.username);
            }

            if (account.attemptPoints <= 0) {
                throw this._error(ERROR_CODE.OUT_OF_ATTEMPT);
            }

            const passwordMatched: boolean = account.verifyPassword(body.directEnsure('password'));

            if (!passwordMatched) {

                account.useAttemptPoint(20);
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

                if (!application.portalAccess) {
                    throw this._error(ERROR_CODE.APPLICATION_HAS_NO_PORTAL_ACCESS);
                }

                if (!AccountHasOneOfApplicationGroups(application, account)) {
                    throw this._error(ERROR_CODE.APPLICATION_GROUP_NOT_FULFILLED);
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
        const tags: ITagModel[] = await TagController.getTagsByIds(account.tags);

        const displayName: string = account.displayName || account.username;

        if (account.organization) {

            const organization: IOrganizationModel | null = await OrganizationController.getOrganizationById(account.organization);

            if (!organization) {
                throw this._error(ERROR_CODE.ORGANIZATION_NOT_FOUND, account.organization.toHexString());
            }

            const organizationTags: ITagModel[] = await TagController.getTagsByIds(organization.tags);

            return {
                username: account.username,
                displayName,
                mint: account.mint,
                organization: organization.name,
                organizationTags: organizationTags.map((tag: ITagModel) => tag.name),
                email: account.email,
                groups: groups.map((group: IGroupModel) => group.name),
                tags: tags.map((tag: ITagModel) => tag.name),
                infos: account.getInfoRecords(),
                beacons: account.getBeaconRecords(),
            };
        }

        return {
            username: account.username,
            displayName,
            mint: account.mint,
            email: account.email,
            groups: groups.map((group: IGroupModel) => group.name),
            tags: tags.map((tag: ITagModel) => tag.name),
            infos: account.getInfoRecords(),
            beacons: account.getBeaconRecords(),
        };
    }
}
