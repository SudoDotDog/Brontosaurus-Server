/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Red_Preference
 * @description Read
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { getSinglePreference } from "../../../controller/preference";
import { createAuthenticateHandler, createGroupVerifyHandler, createTokenHandler } from "../../../handlers/handlers";
import { basicHook } from "../../../handlers/hook";
import { INTERNAL_USER_GROUP } from "../../../interface/group";
import { BrontosaurusRoute } from "../../../routes/basic";

export class ReadPreferenceRoute extends BrontosaurusRoute {

    public readonly path: string = '/preference/read';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.GET;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(createTokenHandler(), '/preference/read - TokenHandler'),
        basicHook.wrap(createAuthenticateHandler(), '/preference/read - AuthenticateHandler'),
        basicHook.wrap(createGroupVerifyHandler([INTERNAL_USER_GROUP.SUPER_ADMIN], this._error), '/preference/read - GroupVerifyHandler'),
        basicHook.wrap(this._preferenceGlobalHandler.bind(this), '/preference/read - Read', true),
    ];

    private async _preferenceGlobalHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        try {

            const globalAvatar: string | null = await getSinglePreference('globalAvatar');
            const backgroundImages: string[] | null = await getSinglePreference('backgroundImages');

            if (globalAvatar) {
                res.agent.add('globalAvatar', globalAvatar);
            }

            if (backgroundImages) {
                res.agent.add('backgroundImages', backgroundImages);
            }
        } catch (err) {

            res.agent.fail(400, err);
        } finally {

            next();
        }
    }
}
