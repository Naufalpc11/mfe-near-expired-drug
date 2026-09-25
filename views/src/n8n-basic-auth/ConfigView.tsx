import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Input } from 'alurkerja-ui';

interface FormType {
    setValue: (name: string, value: any) => void;
    register: any;
    control: any;
    watch: any;
    getValues: (name?: string) => any;
}

const extractForm = (allProps: any): FormType | null => {
    if (allProps?.form?.control) return allProps.form;
    if (allProps?.props?.form?.control) return allProps.props.form;
    if (allProps?.control) return allProps as FormType;
    if (allProps?.register && allProps?.setValue) {
        return {
            control: allProps.control,
            register: allProps.register,
            setValue: allProps.setValue,
            watch: allProps.watch,
            getValues: allProps.getValues,
        };
    }
    return null;
};

export default function ConfigView(allProps: any) {
    const externalForm = extractForm(allProps);

    const internalForm = useForm({
        defaultValues: {
            value: {
                base_url: '',
                username: '',
                password: '',
            }
        }
    });

    const form = externalForm || {
        control: internalForm.control,
        register: internalForm.register,
        setValue: internalForm.setValue,
        watch: internalForm.watch,
        getValues: internalForm.getValues,
    };

    const { control } = form;

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Base URL
                </label>
                <Controller
                    name="value.base_url"
                    control={control}
                    render={({ field }) => (
                        <Input
                            placeholder="Enter Base URL (e.g., https://n8n-new.merapi.javan.id)"
                            {...field}
                            value={field.value || ''}
                        />
                    )}
                />
                <p className="text-xs text-gray-500">
                    The base URL for the API (without endpoint paths)
                </p>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Username
                </label>
                <Controller
                    name="value.username"
                    control={control}
                    render={({ field }) => (
                        <Input
                            placeholder="Enter username"
                            {...field}
                            value={field.value || ''}
                        />
                    )}
                />
                <p className="text-xs text-gray-500">
                    Username for Basic Auth authentication
                </p>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Password
                </label>
                <Controller
                    name="value.password"
                    control={control}
                    render={({ field }) => (
                        <Input
                            type="password"
                            placeholder="Enter password"
                            {...field}
                            value={field.value || ''}
                        />
                    )}
                />
                <p className="text-xs text-gray-500">
                    Password for Basic Auth authentication
                </p>
            </div>
        </div>
    );
}
