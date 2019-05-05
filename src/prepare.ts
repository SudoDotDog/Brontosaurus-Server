/**
 * @author WMXPY
 * @namespace Brontosaurus_Server
 * @description Prepare
 */

import { INTERNAL_APPLICATION, INTERNAL_USER_GROUP } from "@brontosaurus/db";
import { createUnsavedAccount } from "@brontosaurus/db/controller/account";
import { createUnsavedApplication } from "@brontosaurus/db/controller/application";
import { createUnsavedGroup } from "@brontosaurus/db/controller/group";
import { addMultiplePreference, getSinglePreference, setSinglePreference } from "@brontosaurus/db/controller/preference";
import { LOG_LEVEL, SudooLog } from "@sudoo/log";
import * as Mongoose from "mongoose";
import { BrontosaurusConfig, readConfigEnvironment } from './util/conf';

const config: BrontosaurusConfig = readConfigEnvironment();

Mongoose.set('useCreateIndex', true);

Mongoose.connect(
    config.database,
    { useNewUrlParser: true },
);

const db: Mongoose.Connection = Mongoose.connection;
db.on('error', console.log.bind(console, 'connection error:'));

const log = SudooLog.create(LOG_LEVEL.DEBUG);

(async () => {

    try {

        const isPrepared = await getSinglePreference('prepared');

        if (isPrepared) {

            log.info('already prepared');
            return;
        }

        log.info('start');

        const adminGroup = createUnsavedGroup(INTERNAL_USER_GROUP.SUPER_ADMIN);
        const selfGroup = createUnsavedGroup(INTERNAL_USER_GROUP.SELF_CONTROL);

        await adminGroup.save();
        await selfGroup.save();

        log.debug('add group');

        const redApplication = createUnsavedApplication(INTERNAL_APPLICATION.RED, INTERNAL_APPLICATION.RED, 3600000, INTERNAL_APPLICATION.RED);
        const portalApplication = createUnsavedApplication(INTERNAL_APPLICATION.PORTAL, INTERNAL_APPLICATION.PORTAL, 3600000, INTERNAL_APPLICATION.PORTAL);

        await redApplication.save();
        await portalApplication.save();

        log.debug('add application');

        const adminUser = createUnsavedAccount(
            'admin',
            'admin',
            [
                adminGroup._id,
                selfGroup._id,
            ],
            {},
            {
                tag: "Default",
            },
        );

        const testUser = createUnsavedAccount(
            'test',
            'test',
            [
                selfGroup._id,
            ],
            {},
            {
                tag: "Default",
            },
        );

        await adminUser.save();
        await testUser.save();

        log.debug('add user');

        await setSinglePreference('prepared', true);
        await addMultiplePreference('registerInfo', {
            name: 'Email',
            type: 'string',
        });
        await addMultiplePreference('registerInfo', {
            name: 'Phone',
            type: 'number',
        });

        log.debug('set preference');
    } catch (err) {

        log.error(err);
    } finally {

        await db.close();
        log.info('complete');
    }
})();
