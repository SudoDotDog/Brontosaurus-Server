/**
 * @author WMXPY
 * @namespace Brontosaurus_Server_Controller
 * @description Preference
 */

import { Preferences } from "../interface/preference";
import { IPreferenceModel, PreferenceModel } from "../model/preference";

export const getSinglePreference = async <N extends keyof Preferences>(name: N): Promise<Preferences[N] | null> => {

    const preference: IPreferenceModel | null = await PreferenceModel.findOne({
        name,
    });

    if (!preference) {
        return null;
    }

    return preference.value;
};

export const getMultiplePreference = async <N extends keyof Preferences>(name: N): Promise<Array<Preferences[N]>> => {

    const preferences: IPreferenceModel[] = await PreferenceModel.find({
        name,
    });

    return preferences.map((model: IPreferenceModel) => model.value);
};

export const setSinglePreference = async <N extends keyof Preferences>(name: N, value: Preferences[N]): Promise<void> => {

    const preference: IPreferenceModel | null = await PreferenceModel.findOne({
        name,
    });
    if (preference) {

        preference.value = value;
        await preference.save();
    } else {

        const newPreference: IPreferenceModel = new PreferenceModel({
            name,
            value,
        });
        await newPreference.save();
    }

    return;
};

