/**
 * @author WMXPY
 * @namespace Brontosaurus_Server
 * @description Prepare
 */

import { LOG_LEVEL, SudooLog } from "@sudoo/log";
import * as Mongoose from "mongoose";
import { createUnsavedAccount } from "./controller/account";
import { createUnsavedApplication } from "./controller/application";
import { createUnsavedGroup } from "./controller/group";
import { addMultiplePreference, getSinglePreference, setSinglePreference } from "./controller/preference";
import { INTERNAL_APPLICATION } from "./interface/application";
import { INTERNAL_USER_GROUP } from "./interface/group";
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

        await adminGroup.save();

        log.debug('add group');

        const redApplication = createUnsavedApplication(INTERNAL_APPLICATION.RED, INTERNAL_APPLICATION.RED, 600000, INTERNAL_APPLICATION.RED);

        await redApplication.save();

        log.debug('add application');

        const adminUser = createUnsavedAccount('admin', 'admin', [adminGroup._id], {
            tag: "default account",
        });

        await adminUser.save();

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
