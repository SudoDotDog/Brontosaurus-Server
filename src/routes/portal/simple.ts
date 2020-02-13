/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes
 * @description Simple
 */

import { PreferenceController } from "@brontosaurus/db";
import { sample } from "@sudoo/bark/array";
import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { HTTP_RESPONSE_CODE } from "@sudoo/magic";
import { basicHook } from "../../handlers/hook";
import { BrontosaurusRoute } from "../basic";

export class SimpleRoute extends BrontosaurusRoute {

    public readonly path: string = '/simple';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.GET;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(this._simpleHandler.bind(this), '/simple - Simple'),
    ];

    private async _simpleHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        try {

            const indexPage: string | null = await PreferenceController.getSinglePreference('indexPage');
            const entryPage: string | null = await PreferenceController.getSinglePreference('entryPage');
            const favicon: string | null = await PreferenceController.getSinglePreference('globalFavicon');
            const avatar: string | null = await PreferenceController.getSinglePreference('globalAvatar');
            const helpLink: string | null = await PreferenceController.getSinglePreference('globalHelpLink');
            const privacyPolicy: string | null = await PreferenceController.getSinglePreference('globalPrivacyPolicy');

            const accountName: string | null = await PreferenceController.getSinglePreference('accountName');
            const systemName: string | null = await PreferenceController.getSinglePreference('systemName');

            const globalBackgroundImages: string[] | null = await PreferenceController.getSinglePreference('globalBackgroundImages');
            const single: string | null | undefined = globalBackgroundImages ? sample(globalBackgroundImages) : null;

            res.agent.addIfExist('indexPage', indexPage)
                .addIfExist('entryPage', entryPage)
                .addIfExist('favicon', favicon)
                .addIfExist('avatar', avatar)
                .addIfExist('backgroundImage', single)
                .addIfExist('privacy', privacyPolicy)
                .addIfExist('help', helpLink)
                .addIfExist('accountName', accountName)
                .addIfExist('systemName', systemName);
        } catch (err) {

            res.agent.fail(HTTP_RESPONSE_CODE.BAD_REQUEST, err);
        } finally {
            next();
        }
    }
}
