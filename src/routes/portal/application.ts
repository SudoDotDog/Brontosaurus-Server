/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Application
 */

import { ApplicationController, ApplicationOthersConfig, IApplicationModel, InformationController, PreferenceController } from "@brontosaurus/db";
import { createStringedBodyVerifyHandler, ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { HTTP_RESPONSE_CODE } from "@sudoo/magic";
import { createMapPattern, createStringPattern, Pattern } from "@sudoo/pattern";
import { fillStringedResult, StringedResult } from "@sudoo/verify";
import { autoHook } from "../../handlers/hook";
import { ERROR_CODE } from "../../util/error";
import { BrontosaurusRoute } from "../basic";

const bodyPattern: Pattern = createMapPattern({
    applicationKey: createStringPattern(),
}, {
    strict: true,
});

export type ApplicationRouteBody = {

    readonly applicationKey: string;
};

export class ApplicationRoute extends BrontosaurusRoute {

    public readonly path: string = '/application';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        autoHook.wrap(createStringedBodyVerifyHandler(bodyPattern), 'Body Verify'),
        autoHook.wrap(this._applicationHandler.bind(this), 'Application'),
    ];

    private async _applicationHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: ApplicationRouteBody = req.body;

        try {

            const verify: StringedResult = fillStringedResult(req.stringedBodyVerify);

            if (!verify.succeed) {
                throw this._error(ERROR_CODE.REQUEST_DOES_MATCH_PATTERN, verify.invalids[0]);
            }

            const application: IApplicationModel | null = await ApplicationController.getApplicationByKey(body.applicationKey);

            if (!application) {
                throw this._error(ERROR_CODE.APPLICATION_KEY_NOT_FOUND);
            }

            if (!application.portalAccess) {
                throw this._error(ERROR_CODE.APPLICATION_HAS_NO_PORTAL_ACCESS);
            }

            const otherInformation: ApplicationOthersConfig = await InformationController.getApplicationOtherInformationByApplication(application);

            const accountName: string | null = await PreferenceController.getSinglePreference('accountName');
            const systemName: string | null = await PreferenceController.getSinglePreference('systemName');
            const entryPage: string | null = await PreferenceController.getSinglePreference('entryPage');
            const indexPage: string | null = await PreferenceController.getSinglePreference('indexPage');

            res.agent.add('name', application.name)
                .add('redirections', application.redirections)
                .add('iFrameProtocol', application.iFrameProtocol)
                .add('postProtocol', application.postProtocol)
                .add('alertProtocol', application.alertProtocol)
                .add('noneProtocol', application.noneProtocol)
                .addIfExist('indexPage', indexPage)
                .addIfExist('entryPage', entryPage)
                .addIfExist('favicon', otherInformation.favicon)
                .addIfExist('avatar', otherInformation.avatar)
                .addIfExist('background', otherInformation.backgroundImage)
                .addIfExist('privacy', otherInformation.privacyPolicy)
                .addIfExist('help', otherInformation.helpLink)
                .addIfExist('accountName', accountName)
                .addIfExist('systemName', systemName);
        } catch (err) {

            res.agent.fail(HTTP_RESPONSE_CODE.BAD_REQUEST, err);
        } finally {
            next();
        }
    }
}
