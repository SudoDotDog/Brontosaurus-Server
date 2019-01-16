/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Red_Preference
 * @description Infos
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { getMultiplePreference } from "../../../controller/preference";
import { createAuthenticateHandler, createGroupVerifyHandler, createTokenHandler } from "../../../handlers/handlers";
import { basicHook } from "../../../handlers/hook";
import { INTERNAL_USER_GROUP } from "../../../interface/group";
import { RegisterInfo } from "../../../interface/preference";
import { BrontosaurusRoute } from "../../../routes/basic";

export class InfosPreferenceRoute extends BrontosaurusRoute {

    public readonly path: string = '/preference/infos';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.GET;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(createTokenHandler(), '/preference/infos - TokenHandler'),
        basicHook.wrap(createAuthenticateHandler(), '/preference/infos - AuthenticateHandler'),
        basicHook.wrap(createGroupVerifyHandler([INTERNAL_USER_GROUP.SUPER_ADMIN], this._error), '/preference/infos - GroupVerifyHandler'),
        basicHook.wrap(this._preferenceGlobalHandler.bind(this), '/preference/infos - Infos', true),
    ];

    private async _preferenceGlobalHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        try {

            const registerInfos: RegisterInfo[] = await getMultiplePreference('registerInfo');

            res.agent.add('registerInfos', registerInfos);
        } catch (err) {

            res.agent.fail(400, err);
        } finally {

            next();
        }
    }
}
