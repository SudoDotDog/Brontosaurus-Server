/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Routes_Red_Application
 * @description Fetch
 */

import { ROUTE_MODE, SudooExpressHandler, SudooExpressNextFunction, SudooExpressRequest, SudooExpressResponse } from "@sudoo/express";
import { Safe, SafeExtract } from "@sudoo/extract";
import { isNumber, isString } from "util";
import { getSelectedActiveApplicationsByPage, getTotalActiveApplicationPages } from "../../../controller/application";
import { createAuthenticateHandler, createGroupVerifyHandler, createTokenHandler } from "../../../handlers/handlers";
import { basicHook } from "../../../handlers/hook";
import { INTERNAL_USER_GROUP } from "../../../interface/group";
import { IApplicationModel } from "../../../model/application";
import { ERROR_CODE } from "../../../util/error";
import { BrontosaurusRoute } from "../../basic";

export type FetchApplicationBody = {

    page: number;
    keyword: string;
};

export class FetchApplicationRoute extends BrontosaurusRoute {

    public readonly path: string = '/application/fetch';
    public readonly mode: ROUTE_MODE = ROUTE_MODE.POST;

    public readonly groups: SudooExpressHandler[] = [
        basicHook.wrap(createTokenHandler(), '/application/fetch - TokenHandler'),
        basicHook.wrap(createAuthenticateHandler(), '/application/fetch - AuthenticateHandler'),
        basicHook.wrap(createGroupVerifyHandler([INTERNAL_USER_GROUP.SUPER_ADMIN], this._error), '/application/fetch - GroupVerifyHandler'),
        basicHook.wrap(this._fetchApplicationHandler.bind(this), '/application/fetch - All', true),
    ];

    private async _fetchApplicationHandler(req: SudooExpressRequest, res: SudooExpressResponse, next: SudooExpressNextFunction): Promise<void> {

        const body: SafeExtract<FetchApplicationBody> = Safe.extract(req.body as FetchApplicationBody, this._error(ERROR_CODE.INSUFFICIENT_INFORMATION));

        try {

            const page: number = body.direct('page');
            if (!isNumber(page) || page < 0) {
                throw this._error(ERROR_CODE.REQUEST_FORMAT_ERROR, 'page', 'number', (page as any).toString());
            }

            const keyword: string = body.direct('keyword');
            if (!isString(keyword)) {
                throw this._error(ERROR_CODE.REQUEST_FORMAT_ERROR, 'keyword', 'string', (keyword as any).toString());
            }

            const limit: number = 10;

            const pages: number = await getTotalActiveApplicationPages(limit);
            const applications: IApplicationModel[] = await getSelectedActiveApplicationsByPage(limit, Math.floor(page), keyword);

            const parsed = applications.map((application: IApplicationModel) => ({
                expire: application.expire,
                key: application.key,
                name: application.name,
            }));

            res.agent.add('applications', parsed);
            res.agent.add('pages', Math.ceil(pages));
        } catch (err) {
            res.agent.fail(400, err);
        } finally {
            next();
        }
    }
}
