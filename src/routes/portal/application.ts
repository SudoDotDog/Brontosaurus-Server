/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Application
 */

import { _Array } from "@sudoo/bark";
import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { getApplicationByKey } from "../../controller/application";
import { getSinglePreference } from "../../controller/preference";
import { basicHook } from "../../handlers/hook";
import { IApplicationModel } from "../../model/application";
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

            const application: IApplicationModel | null = await getApplicationByKey(body.direct('applicationKey'));

            if (!application) {
                throw this._error(ERROR_CODE.APPLICATION_KEY_NOT_FOUND);
            }

            const backgroundImages: string[] | null = await getSinglePreference('backgroundImages');

            if (backgroundImages) {
                res.agent.add('background', _Array.sample(backgroundImages));
            }

            if (application.avatar) {
                res.agent.add('avatar', application.avatar);
            } else {
                const globalAvatar: string | null = await getSinglePreference('globalAvatar');

                if (globalAvatar) {
                    res.agent.add('avatar', globalAvatar);
                }
            }

            res.agent
                .add('key', application.key)
                .add('name', application.name);
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
