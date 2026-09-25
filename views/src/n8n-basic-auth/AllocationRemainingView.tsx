import React, { useEffect, useState, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface FormType {
    setValue: (name: string, value: any) => void;
    register: any;
    control: any;
    watch: any;
    getValues: (name?: string) => any;
}

interface AllocationData {
    allocation_remaining_days: number;
    allocation_remaining_hours: number;
}

interface ApiResponse {
    status: number;
    message: string;
    data: AllocationData[];
}

interface AddonConfig {
    base_url?: string;
    username?: string;
    password?: string;
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

const extractConfig = (allProps: any): AddonConfig => {
    if (allProps?.config) return allProps.config;
    if (allProps?.props?.config) return allProps.props.config;
    if (allProps?.addonConfig) return allProps.addonConfig;
    if (allProps?.props?.addonConfig) return allProps.props.addonConfig;
    if (allProps?.alurkerjaParams?.configuration) return allProps.alurkerjaParams.configuration;
    if (allProps?.alurkerjaParams?.config) return allProps.alurkerjaParams.config;
    if (allProps?.props?.alurkerjaParams?.configuration) return allProps.props.alurkerjaParams.configuration;
    if (allProps?.props?.alurkerjaParams?.config) return allProps.props.alurkerjaParams.config;
    if (allProps?.props?.item?.config) return allProps.props.item.config;
    if (allProps?.item?.config) return allProps.item.config;
    return {};
};

const extractEmail = (allProps: any): string => {
    if (allProps?.form?.getValues) {
        const email = allProps.form.getValues('email') || allProps.form.getValues('user_email');
        if (email) {
            return email;
        }
    }
    if (allProps?.props?.form?.getValues) {
        const email = allProps.props.form.getValues('email') || allProps.props.form.getValues('user_email');
        if (email) {
            return email;
        }
    }
    if (allProps?.alurkerjaParams?.email) {
        return allProps.alurkerjaParams.email;
    }
    if (allProps?.alurkerjaParams?.initiator) {
        return allProps.alurkerjaParams.initiator;
    }
    if (allProps?.alurkerjaParams?.requestor) {
        return allProps.alurkerjaParams.requestor;
    }
    if (allProps?.alurkerjaParams?.user?.email) {
        return allProps.alurkerjaParams.user?.email;
    }
    if (allProps?.props?.alurkerjaParams?.email) {
        return allProps.props.alurkerjaParams.email;
    }
    if (allProps?.props?.alurkerjaParams?.initiator) {
        return allProps.props.alurkerjaParams.initiator;
    }
    if (allProps?.props?.item?.email) {
        return allProps.props.item.email;
    }
    if (allProps?.item?.email) {
        return allProps.item.email;
    }
    if (allProps?.email) {
        return allProps.email;
    }
    if (allProps?.initiator) {
        return allProps.initiator;
    }
    if (allProps?.requestor) {
        return allProps.requestor;
    }

    return '';
};

export default function AllocationRemainingView(allProps: any) {
    const externalForm = extractForm(allProps);
    const config = extractConfig(allProps);
    const emailFromProps = extractEmail(allProps);

    // Extract configuration with fallback values
    const baseUrl = config.base_url || 'https://n8n-new.merapi.javan.id';
    const apiUrl = `${baseUrl}/webhook/allocation-remaining`;
    const apiUsername = config.username || 'alurkerja';
    const apiPassword = config.password || 'J4v4nLabs123';

    const internalForm = useForm({
        defaultValues: {
            allocation_remaining_days: 0,
            allocation_remaining_hours: 0,
        }
    });

    const form = externalForm || {
        control: internalForm.control,
        register: internalForm.register,
        setValue: internalForm.setValue,
        watch: internalForm.watch,
        getValues: internalForm.getValues,
    };

    const { control, setValue, register, watch } = form;

    const watchedEmail = watch('email') || watch('user_email') || emailFromProps;

    const [remainingDays, setRemainingDays] = useState<number>(0);
    const [remainingHours, setRemainingHours] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const allocationApiUrl = useMemo(() => {
        if (!watchedEmail) return '';
        return `${apiUrl}?email=${encodeURIComponent(watchedEmail)}`;
    }, [watchedEmail]);

    useEffect(() => {
        const fetchAllocation = async () => {
            if (!allocationApiUrl) {
                setError('Email not provided');
                return;
            }

            if (!apiUsername || !apiPassword) {
                setError('Authentication credentials not configured');
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const authCredentials = btoa(`${apiUsername}:${apiPassword}`);

                const response = await fetch(allocationApiUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${authCredentials}`,
                        'Content-Type': 'application/json',
                    },
                    cache: 'no-store',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const text = await response.text();
                if (!text || text.trim() === '') {
                    throw new Error('Empty response from server');
                }

                let data: ApiResponse;
                try {
                    data = JSON.parse(text);
                } catch (parseError) {
                    throw new Error('Invalid JSON response from server');
                }

                if (data && data.data && data.data.length > 0) {
                    const allocation = data.data[0];
                    setRemainingDays(allocation.allocation_remaining_days || 0);
                    setRemainingHours(allocation.allocation_remaining_hours || 0);

                    setValue('allocation_remaining_days', allocation.allocation_remaining_days || 0);
                    setValue('allocation_remaining_hours', allocation.allocation_remaining_hours || 0);
                } else {
                    setError('No allocation data found');
                    setRemainingDays(0);
                    setRemainingHours(0);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch allocation');
                setRemainingDays(0);
                setRemainingHours(0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllocation();
    }, [allocationApiUrl, apiUsername, apiPassword, setValue]);

    return (
        <div className="space-y-4">
            {isLoading && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-sm text-gray-600">Loading allocation information...</p>
                </div>
            )}

            {error && !isLoading && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {!isLoading && !error && (
                <div className="p-4 border border-green-200 rounded-md">
                    <p className="text-sm">
                        Jumlah Cuti yang bisa diajukan: <strong>{remainingHours} Jam ({remainingDays} Hari)</strong>
                    </p>
                </div>
            )}

            <Controller
                name="allocation_remaining_days"
                control={control}
                render={({ field }) => (
                    <input type="hidden" {...field} value={field.value || 0} />
                )}
            />
            <Controller
                name="allocation_remaining_hours"
                control={control}
                render={({ field }) => (
                    <input type="hidden" {...field} value={field.value || 0} />
                )}
            />
        </div>
    );
}
