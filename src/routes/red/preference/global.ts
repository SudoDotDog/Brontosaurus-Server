/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Red_Preference
 * @description Global
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { isArray } from "util";
import { setSinglePreference } from "../../../controller/preference";
import { createAuthenticateHandler, createGroupVerifyHandler, createTokenHandler } from "../../../handlers/handlers";
import { basicHook } from "../../../handlers/hook";
import { INTERNAL_USER_GROUP } from "../../../interface/group";
import { BrontosaurusRoute } from "../../../routes/basic";
import { ERROR_CODE } from "../../../util/error";

export type GlobalPreferenceRouteBody = {

    globalAvatar: string;
    backgroundImages: string[];
};

export class GlobalPreferenceRoute extends BrontosaurusRoute {

    public readonly path: string = '/preference/global';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(createTokenHandler(), '/preference/global - TokenHandler'),
        basicHook.wrap(createAuthenticateHandler(), '/preference/global - AuthenticateHandler'),
        basicHook.wrap(createGroupVerifyHandler([INTERNAL_USER_GROUP.SUPER_ADMIN], this._error), '/preference/global - GroupVerifyHandler'),
        basicHook.wrap(this._preferenceGlobalHandler.bind(this), '/preference/global - Global', true),
    ];

    private async _preferenceGlobalHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<GlobalPreferenceRouteBody> = Safe.extract(req.body as GlobalPreferenceRouteBody, this._error(ERROR_CODE.INSUFFICIENT_INFORMATION));

        try {

            const globalAvatar: string = body.direct('globalAvatar');
            const backgroundImages: string[] = body.direct('backgroundImages');

            if (!isArray(backgroundImages)) {
                throw this._error(ERROR_CODE.REQUEST_DOES_MATCH_PATTERN);
            }

            await setSinglePreference('globalAvatar', globalAvatar.toString());
            await setSinglePreference('backgroundImages', backgroundImages.map((value: any) => value.toString()));

            res.agent.add('status', 'done');
        } catch (err) {

            res.agent.fail(400, err);
        } finally {

            next();
        }
    }
}
