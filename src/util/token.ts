/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Util
 * @description Token
 */

import { BrontosaurusSign } from "@brontosaurus/core";
import { GroupController, IAccountModel, IApplicationModel, IGroupModel, INamespaceModel, INFOS_SPLITTER, IOrganizationModel, ITagModel, OrganizationController, TagController } from "@brontosaurus/db";
import { Basics, IBrontosaurusBody, IBrontosaurusHeader } from "@brontosaurus/definition";
import { _Map } from "@sudoo/bark/map";
import { SafeObject } from "@sudoo/extract";
import { ObjectID } from "bson";

export type SafeToken = {

    readonly header: SafeObject<IBrontosaurusHeader>;
    readonly body: SafeObject<IBrontosaurusBody>;
};

export const createToken = (attempt: string, body: IBrontosaurusBody, application: IApplicationModel): string => {

    const sign: BrontosaurusSign = BrontosaurusSign.create(application.key, body, {
        public: application.publicKey,
        private: application.privateKey,
    });
    const token: string = sign.token(attempt, Date.now() + application.expire);

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

export const filterTags = (applicationTags: ObjectID[], tags: ObjectID[]): ObjectID[] => {

    const result: ObjectID[] = [];
    outer: for (const each of applicationTags) {
        for (const tag of tags) {
            if (each.equals(tag)) {
                result.push(tag);
                continue outer;
            }
        }
    }
    return result;
};

export const buildBrontosaurusBody = async (
    account: IAccountModel,
    namespace: INamespaceModel,
    application: IApplicationModel,
    modifies: string[] = [],
): Promise<IBrontosaurusBody | null> => {

    const filteredGroups: ObjectID[] = filterGroups(application.requires, account.groups);
    const filteredAccountTags: ObjectID[] = filterTags(application.requireTags, account.tags);

    const groups: IGroupModel[] = await GroupController.getGroupsByIds(filteredGroups);
    const tags: ITagModel[] = await TagController.getTagsByIds(filteredAccountTags);

    const displayName: string = account.displayName || account.username;
    const body: IBrontosaurusBody = {
        username: account.username,
        namespace: namespace.namespace,
        avatar: account.avatar,
        displayName,
        mint: account.mint,
        email: account.email,
        phone: account.phone,
        groups: groups.map((group: IGroupModel) => group.name),
        tags: tags.map((tag: ITagModel) => tag.name),
        infos: account.getInfoRecords(),
        beacons: account.getBeaconRecords(),
        modifies,
    };

    if (account.organization) {

        const organization: IOrganizationModel | null = await OrganizationController.getOrganizationById(account.organization);

        if (!organization) {
            return null;
        }

        const filteredOrganizationTags: ObjectID[] = filterTags(application.requireTags, organization.tags);
        const organizationTags: ITagModel[] = await TagController.getTagsByIds(filteredOrganizationTags);

        return {
            ...body,
            organization: organization.name,
            organizationTags: organizationTags.map((tag: ITagModel) => tag.name),
        };
    }

    return body;
};
