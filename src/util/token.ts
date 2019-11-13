/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Token
 */

import { BrontosaurusSign } from "@brontosaurus/core";
import { GroupController, IAccountModel, IApplicationModel, IGroupModel, INFOS_SPLITTER, IOrganizationModel, ITagModel, OrganizationController, TagController } from "@brontosaurus/db";
import { Basics, IBrontosaurusBody, IBrontosaurusHeader } from "@brontosaurus/definition";
import { _Map } from "@sudoo/bark/map";
import { SafeObject } from "@sudoo/extract";
import { ObjectID } from "bson";

export type SafeToken = {

    readonly header: SafeObject<IBrontosaurusHeader>;
    readonly body: SafeObject<IBrontosaurusBody>;
};

export const createToken = (body: IBrontosaurusBody, application: IApplicationModel): string => {

    const sign: BrontosaurusSign = BrontosaurusSign.create(application.key, body, {
        public: application.publicKey,
        private: application.privateKey,
    });
    const token: string = sign.token(Date.now() + application.expire);

    return token;
};

export const parseInfo = (infoRecord: Record<string, Basics>): string[] => {

    return _Map.keys(infoRecord).map((key: string) => `${key}${INFOS_SPLITTER}${infoRecord[key]}`);
};

export const filterGroups = (applicationRequires: ObjectID[], accountGroups: ObjectID[]): ObjectID[] => {

    const result: ObjectID[] = [];
    outer: for (const each of applicationRequires) {
        for (const group of accountGroups) {
            if (each.equals(group)) {
                result.push(group);
                continue outer;
            }
        }
    }
    return result;
};

export const buildBrontosaurusBody = async (account: IAccountModel, application: IApplicationModel): Promise<IBrontosaurusBody | null> => {

    const filteredGroups: ObjectID[] = filterGroups(application.requires, account.groups);
    const groups: IGroupModel[] = await GroupController.getGroupsByIds(filteredGroups);
    const tags: ITagModel[] = await TagController.getTagsByIds(account.tags);

    const displayName: string = account.displayName || account.username;

    if (account.organization) {

        const organization: IOrganizationModel | null = await OrganizationController.getOrganizationById(account.organization);

        if (!organization) {
            return null;
        }

        const organizationTags: ITagModel[] = await TagController.getTagsByIds(organization.tags);

        return {
            username: account.username,
            displayName,
            mint: account.mint,
            organization: organization.name,
            organizationTags: organizationTags.map((tag: ITagModel) => tag.name),
            email: account.email,
            groups: groups.map((group: IGroupModel) => group.name),
            tags: tags.map((tag: ITagModel) => tag.name),
            infos: account.getInfoRecords(),
            beacons: account.getBeaconRecords(),
        };
    }

    return {
        username: account.username,
        displayName,
        mint: account.mint,
        email: account.email,
        groups: groups.map((group: IGroupModel) => group.name),
        tags: tags.map((tag: ITagModel) => tag.name),
        infos: account.getInfoRecords(),
        beacons: account.getBeaconRecords(),
    };
};
