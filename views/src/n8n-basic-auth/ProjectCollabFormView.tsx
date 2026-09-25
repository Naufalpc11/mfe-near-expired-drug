import React, { useEffect, useState, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Select } from 'alurkerja-ui';

interface FormType {
    setValue: (name: string, value: any) => void;
    register: any;
    control: any;
    watch: any;
    getValues: (name?: string) => any;
}

interface ProjectOption {
    label: string;
    value: string | number;
}

interface ProjectData {
    id: number | string;
    name: string;
    [key: string]: any;
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

export default function ProjectCollabFormView(allProps: any) {
    const externalForm = extractForm(allProps);
    const config = extractConfig(allProps);

    const baseUrl = config.base_url || 'https://n8n-new.merapi.javan.id';
    const configUrl = `${baseUrl}/webhook/project-collab`;
    const configUsername = config.username || 'alurkerja';
    const configPassword = config.password || 'J4v4nLabs123';

    const internalForm = useForm({
        defaultValues: {
            project_id: '',
            project_name: '',
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

    // Watch for existing project_id value
    const watchedProjectId = watch('project_id');

    const [selectedProjectName, setSelectedProjectName] = useState<string>('');
    const [selectedValue, setSelectedValue] = useState<ProjectOption | null>(null);

    const [projects, setProjects] = useState<ProjectOption[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [lastFetchKey, setLastFetchKey] = useState<string>('');

    const fetchKey = useMemo(() => {
        return `${configUrl}|${configUsername}|${configPassword}`;
    }, [configUrl, configUsername, configPassword]);

    useEffect(() => {
        if (fetchKey === lastFetchKey && projects.length > 0) {
            return;
        }

        const fetchProjects = async () => {
            if (!configUrl) {
                setError('API URL not configured. Please configure the addon settings.');
                setIsLoading(false);
                setProjects([]);
                return;
            }

            if (!configUsername || !configPassword) {
                setError('Authentication credentials not configured. Please configure username and password.');
                setIsLoading(false);
                setProjects([]);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const authCredentials = btoa(`${configUsername}:${configPassword}`);

                const response = await fetch(configUrl, {
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

                let data;
                try {
                    data = JSON.parse(text);
                } catch (parseError) {
                    throw new Error('Invalid JSON response from server');
                }

                let projectList: ProjectData[] = [];

                if (Array.isArray(data)) {
                    projectList = data;
                } else if (data?.data && Array.isArray(data.data)) {
                    projectList = data.data;
                } else if (data?.projects && Array.isArray(data.projects)) {
                    projectList = data.projects;
                } else if (data?.content && Array.isArray(data.content)) {
                    projectList = data.content;
                }

                const options: ProjectOption[] = projectList.map((project: ProjectData) => ({
                    label: project.name || project.title || project.project_name || `Project ${project.id}`,
                    value: project.id,
                }));

                setProjects(options);
                setLastFetchKey(fetchKey);
                setError(null);

                // EVENT: onProjectsLoaded - Pre-fill dropdown immediately after loading if there's an existing value
                const currentProjectId = form.getValues('project_id');

                if (currentProjectId) {
                    const matchingProject = options.find(opt =>
                        opt.value === currentProjectId ||
                        String(opt.value) === String(currentProjectId)
                    );

                    if (matchingProject) {
                        // Set the dropdown selected value state
                        setSelectedValue(matchingProject);
                        setSelectedProjectName(matchingProject.label);
                        setValue('project_name', matchingProject.label, { shouldDirty: false, shouldTouch: false, shouldValidate: false });
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch projects');
                setProjects([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, [fetchKey, lastFetchKey, configUrl, configUsername, configPassword]);

    // Pre-fill dropdown when projects are loaded and there's an existing project_id
    useEffect(() => {
        if (watchedProjectId && projects.length > 0) {
            const selectedProject = projects.find(opt => {
                return opt.value === watchedProjectId || String(opt.value) === String(watchedProjectId);
            });

            if (selectedProject && selectedProject.label !== selectedProjectName) {
                setSelectedProjectName(selectedProject.label);
                setValue('project_name', selectedProject.label, { shouldDirty: false, shouldTouch: false, shouldValidate: false });
            }
        }
    }, [watchedProjectId, projects, setValue]);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Project
                </label>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Hidden input for project_name - using native name attribute for form collection */}
                <input
                    type="hidden"
                    name="project_name"
                    value={selectedProjectName}
                    {...register('project_name')}
                />

                <Controller
                    name="project_id"
                    control={control}
                    render={({ field }) => (
                        <Select
                            options={projects}
                            value={selectedValue}
                            onChange={(selected: ProjectOption | null) => {
                                const projectId = selected?.value || '';
                                const projectName = selected?.label || '';

                                // Update all states and form values
                                setSelectedValue(selected);
                                field.onChange(projectId);
                                setSelectedProjectName(projectName);
                                setValue('project_name', projectName, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                            }}
                            isLoading={isLoading}
                            isDisabled={isLoading || !!error}
                            placeholder={isLoading ? 'Loading projects...' : 'Select a project'}
                            isClearable
                        />
                    )}
                />

                {isLoading && !error && (
                    <p className="text-xs text-gray-500">Fetching projects from API...</p>
                )}
            </div>
        </div>
    );
}
