/**
 * @author WMXPY
 * @namespace Brontosaurus_Server
 * @description Prepare
 */

import { AccountController, ApplicationController, GroupController, INTERNAL_APPLICATION, INTERNAL_USER_GROUP, PreferenceController } from "@brontosaurus/db";
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

        const isPrepared = await PreferenceController.getSinglePreference('prepared');

        if (isPrepared) {

            log.info('already prepared');
            return;
        }

        log.info('start');

        const adminGroup = GroupController.createUnsavedGroup(INTERNAL_USER_GROUP.SUPER_ADMIN);
        const selfGroup = GroupController.createUnsavedGroup(INTERNAL_USER_GROUP.SELF_CONTROL);

        await adminGroup.save();
        await selfGroup.save();

        log.debug('add group');

        const redApplication = ApplicationController.createUnsavedApplication(INTERNAL_APPLICATION.RED, INTERNAL_APPLICATION.RED, 3600000, INTERNAL_APPLICATION.RED);
        const portalApplication = ApplicationController.createUnsavedApplication(INTERNAL_APPLICATION.PORTAL, INTERNAL_APPLICATION.PORTAL, 3600000, INTERNAL_APPLICATION.PORTAL);

        await redApplication.save();
        await portalApplication.save();

        log.debug('add application');

        const adminUser = AccountController.createUnsavedAccount(
            'admin',
            'admin',
            undefined,
            [
                adminGroup._id,
                selfGroup._id,
            ],
            {},
            {
                tag: "Default",
            },
        );

        const testUser = AccountController.createUnsavedAccount(
            'test',
            'test',
            undefined,
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

        await PreferenceController.setSinglePreference('prepared', true);
        await PreferenceController.addMultiplePreference('registerInfo', {
            name: 'Email',
            type: 'string',
        });
        await PreferenceController.addMultiplePreference('registerInfo', {
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
