/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Red_Group
 * @description Create
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { createUnsavedGroup, isGroupDuplicatedByName } from "../../../controller/group";
import { createAuthenticateHandler, createGroupVerifyHandler, createTokenHandler } from "../../../handlers/handlers";
import { basicHook } from "../../../handlers/hook";
import { INTERNAL_USER_GROUP } from "../../../interface/group";
import { IGroupModel } from "../../../model/group";
import { BrontosaurusRoute } from "../../../routes/basic";
import { ERROR_CODE } from "../../../util/error";

export type CreateGroupRouteBody = {

    name: string;
};

export class CreateGroupRoute extends BrontosaurusRoute {

    public readonly path: string = '/group/create';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(createTokenHandler(), '/group/create - TokenHandler'),
        basicHook.wrap(createAuthenticateHandler(), '/group/create - AuthenticateHandler'),
        basicHook.wrap(createGroupVerifyHandler([INTERNAL_USER_GROUP.SUPER_ADMIN], this._error), '/group/create - GroupVerifyHandler'),
        basicHook.wrap(this._groupCreateHandler.bind(this), '/group/create - Create', true),
    ];

    private async _groupCreateHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<CreateGroupRouteBody> = Safe.extract(req.body as CreateGroupRouteBody, this._error(ERROR_CODE.INSUFFICIENT_INFORMATION));

        try {

            const name: string = body.direct('name');

            const isDuplicated: boolean = await isGroupDuplicatedByName(name);

            if (isDuplicated) {
                throw this._error(ERROR_CODE.DUPLICATE_GROUP, name);
            }

            const group: IGroupModel = createUnsavedGroup(name);
            await group.save();

            res.agent.add('group', group.name);
        } catch (err) {

            res.agent.fail(400, err);
        } finally {

            next();
        }
    }
}
