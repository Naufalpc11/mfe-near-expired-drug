import React, { useEffect, useState, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface FormType {
    setValue: (name: string, value: any) => void;
    register: any;
    control: any;
    watch: any;
    getValues: (name?: string) => any;
}

interface TaskCounts {
    count_taiga: number;
    count_collab: number;
    count_joglo: number;
}

interface ApiResponse {
    count_taiga: number;
    count_collab: number;
    count_joglo: number;
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

    // Check alurkerjaParams variations
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

    // Check props variations
    if (allProps?.props?.alurkerjaParams?.email) {
        return allProps.props.alurkerjaParams.email;
    }
    if (allProps?.props?.alurkerjaParams?.initiator) {
        return allProps.props.alurkerjaParams.initiator;
    }

    // Check item variations
    if (allProps?.props?.item?.email) {
        return allProps.props.item.email;
    }
    if (allProps?.item?.email) {
        return allProps.item.email;
    }

    // Check direct props
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

export default function RemainingTaskView(allProps: any) {
    const externalForm = extractForm(allProps);
    const config = extractConfig(allProps);
    const emailFromProps = extractEmail(allProps);

    const internalForm = useForm({
        defaultValues: {
            count_taiga: 0,
            count_collab: 0,
            count_joglo: 0,
        }
    });

    const form = externalForm || {
        control: internalForm.control,
        register: internalForm.register,
        setValue: internalForm.setValue,
        watch: internalForm.watch,
        getValues: internalForm.getValues,
    };

    const { control, setValue, watch } = form;

    const watchedEmail = watch('email') || watch('user_email') || emailFromProps;

    const [taskCounts, setTaskCounts] = useState<TaskCounts>({
        count_taiga: 0,
        count_collab: 0,
        count_joglo: 0,
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Extract configuration with fallback values
    const baseUrl = config.base_url || 'https://n8n-new.merapi.javan.id';
    const apiUrl = `${baseUrl}/webhook/remaining-task`;
    const apiUsername = config.username || 'alurkerja';
    const apiPassword = config.password || 'J4v4nLabs123';

    const totalTasks = useMemo(() => {
        return taskCounts.count_taiga + taskCounts.count_collab + taskCounts.count_joglo;
    }, [taskCounts]);

    useEffect(() => {
        const fetchRemainingTasks = async () => {
            if (!watchedEmail) {
                setError('Email not provided');
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const authCredentials = btoa(`${apiUsername}:${apiPassword}`);

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${authCredentials}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: watchedEmail }),
                    cache: 'no-store',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const text = await response.text();
                if (!text || text.trim() === '') {
                    throw new Error('Empty response from server');
                }

                let data: ApiResponse[];
                try {
                    data = JSON.parse(text);
                } catch (parseError) {
                    throw new Error('Invalid JSON response from server');
                }

                if (data && Array.isArray(data) && data.length > 0) {
                    const taskData = data[0];
                    const counts = {
                        count_taiga: taskData.count_taiga || 0,
                        count_collab: taskData.count_collab || 0,
                        count_joglo: taskData.count_joglo || 0,
                    };

                    setTaskCounts(counts);

                    setValue('count_taiga', counts.count_taiga);
                    setValue('count_collab', counts.count_collab);
                    setValue('count_joglo', counts.count_joglo);
                } else {
                    throw new Error('No task data found in response');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch remaining tasks');
                setTaskCounts({
                    count_taiga: 0,
                    count_collab: 0,
                    count_joglo: 0,
                });
                setValue('count_taiga', 0);
                setValue('count_collab', 0);
                setValue('count_joglo', 0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRemainingTasks();
    }, [watchedEmail, setValue]);

    return (
        <div className="space-y-4">
            {isLoading && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-sm text-gray-600">Loading task information...</p>
                </div>
            )}

            {error && !isLoading && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {!isLoading && !error && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h3 className="text-sm font-semibold text-blue-900 mb-3">📋 Active Tasks Summary</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-800">Taiga Tasks:</span>
                            <span className="text-sm font-semibold text-blue-900">{taskCounts.count_taiga}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-800">Collab Tasks:</span>
                            <span className="text-sm font-semibold text-blue-900">{taskCounts.count_collab}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-800">Joglo Tasks:</span>
                            <span className="text-sm font-semibold text-blue-900">{taskCounts.count_joglo}</span>
                        </div>
                        <div className="pt-2 mt-2 border-t border-blue-200">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-blue-900">Total:</span>
                                <span className="text-sm font-bold text-blue-900">{totalTasks} active tasks</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Controller
                name="count_taiga"
                control={control}
                render={({ field }) => (
                    <input type="hidden" {...field} value={field.value || 0} />
                )}
            />
            <Controller
                name="count_collab"
                control={control}
                render={({ field }) => (
                    <input type="hidden" {...field} value={field.value || 0} />
                )}
            />
            <Controller
                name="count_joglo"
                control={control}
                render={({ field }) => (
                    <input type="hidden" {...field} value={field.value || 0} />
                )}
            />
        </div>
    );
}
