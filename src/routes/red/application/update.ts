/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Red_Application
 * @description Update
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from "@sudoo/extract";
import { ObjectID } from "bson";
import { getApplicationByKey } from "../../../controller/application";
import { createAuthenticateHandler, createGroupVerifyHandler, createTokenHandler } from "../../../handlers/handlers";
import { basicHook } from "../../../handlers/hook";
import { INTERNAL_USER_GROUP } from "../../../interface/group";
import { IApplicationModel } from "../../../model/application";
import { IGroupModel } from "../../../model/group";
import { Throwable_GetGroupsByNames } from "../../../util/auth";
import { ERROR_CODE } from "../../../util/error";
import { BrontosaurusRoute } from "../../basic";

export type UpdateApplicationBody = {

    key: string;
    application: Partial<{
        avatar: string;
        name: string;
        expire: number;
        groups: string[];
    }>;
};

export class UpdateApplicationRoute extends BrontosaurusRoute {

    public readonly path: string = '/application/update';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(createTokenHandler(), '/application/update - TokenHandler'),
        basicHook.wrap(createAuthenticateHandler(), '/application/update - AuthenticateHandler'),
        basicHook.wrap(createGroupVerifyHandler([INTERNAL_USER_GROUP.SUPER_ADMIN], this._error), '/application/update - GroupVerifyHandler'),
        basicHook.wrap(this._updateApplicationHandler.bind(this), '/application/update - Update', true),
    ];

    private async _updateApplicationHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<UpdateApplicationBody> = Safe.extract(req.body as UpdateApplicationBody, this._error(ERROR_CODE.INSUFFICIENT_INFORMATION));

        try {

            const key: string = body.direct('key');
            if (typeof key !== 'string') {
                throw this._error(ERROR_CODE.REQUEST_FORMAT_ERROR, 'key', 'string', (key as any).toString());
            }

            const application: IApplicationModel | null = await getApplicationByKey(key);
            if (!application) {
                throw this._error(ERROR_CODE.APPLICATION_KEY_NOT_FOUND, key);
            }

            const update: Partial<{
                avatar: string;
                name: string;
                expire: number;
                groups: string[];
            }> = body.direct('application');

            if (update.groups && Array.isArray(update.groups)) {

                const applicationGroups: IGroupModel[] = await Throwable_GetGroupsByNames(update.groups);

                const idsGroups: ObjectID[] = applicationGroups.map((group: IGroupModel) => {

                    if (group.name === INTERNAL_USER_GROUP.SUPER_ADMIN || group.name === INTERNAL_USER_GROUP.SELF_CONTROL) {
                        throw this._error(ERROR_CODE.CANNOT_MODIFY_INTERNAL_GROUP);
                    }
                    return group._id;
                });

                application.groups = idsGroups;
            }

            if (update.name && typeof update.name === 'string') {
                application.name = update.name;
            }
            if (update.expire && typeof update.expire === 'number') {
                application.expire = update.expire;
            }
            if (update.avatar && typeof update.avatar === 'string') {
                application.avatar = update.avatar;
            }

            await application.save();

            res.agent.add('application', application.key);
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
