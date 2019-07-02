/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Application
 */

import { ApplicationController, ApplicationOthersConfig, IApplicationModel, InformationController, PreferenceController } from "@brontosaurus/db";
import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from '@sudoo/extract';
import { basicHook } from "../../handlers/hook";
import { ERROR_CODE } from "../../util/error";
import { BrontosaurusRoute } from "../basic";

export type ApplicationRouteBody = {

    readonly applicationKey: string;
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

            const otherInformation: ApplicationOthersConfig = await InformationController.getApplicationOtherInformationByApplication(application);

            const accountName: string | null = await PreferenceController.getSinglePreference('accountName');
            const systemName: string | null = await PreferenceController.getSinglePreference('systemName');

            res.agent.add('name', application.name)
                .addIfExist('avatar', otherInformation.avatar)
                .addIfExist('background', otherInformation.backgroundImage)
                .addIfExist('privacy', otherInformation.privacyPolicy)
                .addIfExist('help', otherInformation.helpLink)
                .addIfExist('accountName', accountName)
                .addIfExist('systemName', systemName);
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
