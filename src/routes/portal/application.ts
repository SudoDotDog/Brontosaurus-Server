/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Application
 */

import { ApplicationController, IApplicationModel, PreferenceController } from "@brontosaurus/db";
import { _Array } from "@sudoo/bark/array";
import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { basicHook } from "../../handlers/hook";
import { ERROR_CODE } from "../../util/error";
import { BrontosaurusRoute } from "../basic";

export type ApplicationRouteBody = {

    applicationKey: string;
};

export class ApplicationRoute extends BrontosaurusRoute {

    public readonly path: string = '/application';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(this._applicationHandler.bind(this), '/application - Application', true),
    ];

    private async _applicationHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<ApplicationRouteBody> = Safe.extract(req.body as ApplicationRouteBody, this._error(ERROR_CODE.REQUEST_DOES_MATCH_PATTERN));

        try {

            const application: IApplicationModel | null = await ApplicationController.getApplicationByKey(body.direct('applicationKey'));

            if (!application) {
                throw this._error(ERROR_CODE.APPLICATION_KEY_NOT_FOUND);
            }

            const backgroundImages: string[] | null = await PreferenceController.getSinglePreference('backgroundImages');

            if (backgroundImages) {
                res.agent.add('background', _Array.sample(backgroundImages));
            }

            if (application.avatar) {
                res.agent.add('avatar', application.avatar);
            } else {
                const globalAvatar: string | null = await PreferenceController.getSinglePreference('globalAvatar');
                res.agent.addIfExist('avatar', globalAvatar);
            }

            const privacyPolicy: string | null = await PreferenceController.getSinglePreference('privacyPolicy');
            res.agent.addIfExist('privacy', privacyPolicy);

            res.agent.addIfExist('help', application.help);
            res.agent.add('name', application.name);
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
