import React, { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Input, Select } from 'alurkerja-ui';
import { AlurkerjaMfeInputProps } from '../type/AlurkerjaType';
import { Plus, Trash2 } from 'lucide-react';

interface TeamMember {
    id: string;
    teamName: string;
    role: string;
}

interface Team {
    id: string;
    name: string;
}

interface TeamOptions {
    label: string;
    value: string | number;
}

export default function TeamFormView({ props, alurkerjaParams }: Readonly<AlurkerjaMfeInputProps>) {
    const { form, item } = props;
    const { control, setValue, watch } = form;

    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [currentTeamName, setCurrentTeamName] = useState('');
    const [currentRole, setCurrentRole] = useState('');
    const [teamOptions, setTeamOptions] = useState<TeamOptions[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<TeamOptions | null>(null);
    const [isLoadingTeams, setIsLoadingTeams] = useState(false);

    // Initialize from form value only once on mount
    useEffect(() => {
        const formTeamMembers = watch('teamMembers');
        if (formTeamMembers) {
            try {
                // Parse if it's a string
                const parsedMembers = typeof formTeamMembers === 'string'
                    ? JSON.parse(formTeamMembers)
                    : formTeamMembers;

                if (Array.isArray(parsedMembers) && parsedMembers.length > 0) {
                    setTeamMembers(parsedMembers);
                }
            } catch (error) {
                console.error('Error parsing teamMembers:', error);
            }
        }
    }, [watch('teamMembers')]);

    useEffect(() => {
        const fetchTeams = async () => {
            setIsLoadingTeams(true);
            try {
                const response = await fetch('https://api.javan.alurkerja.com/api/v1/tasklist/teams', {
                    headers: {
                        'Authorization': `Bearer ${alurkerjaParams.token}`,
                        'Content-Type': 'application/json',
                        'x-active-tenant': 'Javan-Dev',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const teamsData = data.data || data || [];
                    // Convert to Select options format
                    const options = teamsData.map((team: Team) => ({
                        label: team.name,
                        value: team.name
                    }));
                    setTeamOptions(options);
                } else {
                    console.error('Failed to fetch teams:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching teams:', error);
            } finally {
                setIsLoadingTeams(false);
            }
        };

        if (alurkerjaParams?.token) {
            fetchTeams();
        }
    }, [alurkerjaParams?.token]);

    if (!control) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600">Error: Form control not available. Please check component configuration.</p>
            </div>
        );
    }

    const handleAdd = () => {
        if (!currentTeamName.trim() || !currentRole.trim()) {
            alert('Nama Tim dan Role harus diisi');
            return;
        }

        const newMember: TeamMember = {
            id: Date.now().toString(),
            teamName: currentTeamName,
            role: currentRole
        };

        const updatedMembers = [...teamMembers, newMember];
        setTeamMembers(updatedMembers);
        setValue('teamMembers', updatedMembers); // Sync to form

        // Clear inputs
        setCurrentTeamName('');
        setCurrentRole('');
        setSelectedTeam(null);
    };

    const handleDelete = (id: string) => {
        const updatedMembers = teamMembers.filter(member => member.id !== id);
        setTeamMembers(updatedMembers);
        setValue('teamMembers', updatedMembers); // Sync to form, even if empty
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            { !item.disabled && (
                <div className="border-b pb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Input Data Tim</h2>
                </div>
            )}

            {/* Form Input */}
            { !item.disabled && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        {/* Nama Tim */}
                        <div className="space-y-2">
                            <label htmlFor="team-select" className="block text-sm font-medium text-gray-700">
                                Nama Tim <span className="text-red-500">*</span>
                            </label>
                            <div id="team-select">
                                <Select
                                    options={teamOptions}
                                    value={selectedTeam}
                                    onChange={(selected: TeamOptions | null) => {
                                        console.log('🔄 [Select onChange] Selected:', selected);
                                        const teamName = selected?.value || '';
                                        setSelectedTeam(selected);
                                        setCurrentTeamName(String(teamName));
                                    }}
                                    isLoading={isLoadingTeams}
                                    isDisabled={isLoadingTeams}
                                    placeholder={isLoadingTeams ? 'Loading teams...' : 'Pilih Tim'}
                                    isClearable
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="role"
                                className="text-sm"
                                placeholder="Contoh: Developer"
                                value={currentRole}
                                onChange={(e) => setCurrentRole(e.target.value)}
                            />
                        </div>

                        {/* Add Button */}
                        <div>
                            <button
                                type="button"
                                onClick={handleAdd}
                                disabled={!currentTeamName.trim() || !currentRole.trim()}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
                            >
                                <Plus size={16} />
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Controller to store data - validation will trigger on form submit */}
            <Controller
                name="teamMembers"
                control={control}
                defaultValue={[]}
                rules={{
                    required: (!item.disabled && item.constraints?.required) ? 'Data Tim is required' : false,
                    validate: (value: any) => {
                        // Skip validation if form is disabled
                        if (item.disabled) {
                            return true;
                        }

                        const members = Array.isArray(value) ? value : [];
                        if (members.length === 0) {
                            return 'Data Tim harus diisi';
                        }
                        return true;
                    }
                }}
                render={({ field }) => (
                    <>
                        <input
                            type="hidden"
                            name={field.name}
                            ref={field.ref}
                            value={JSON.stringify(field.value || [])}
                            readOnly
                        />
                        {!item.disabled && control._formState.errors.teamMembers && (
                            <p className="text-red-500 text-sm">
                                {control._formState.errors.teamMembers.message}
                            </p>
                        )}
                    </>
                )}
            />


            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nama Tim
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                { !item.disabled && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {teamMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                                        Belum ada data tim.
                                    </td>
                                </tr>
                            ) : (
                                teamMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {member.teamName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {member.role}
                                        </td>
                                        { !item.disabled && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(member.id)}
                                                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary */}
            {teamMembers.length > 0 && !item.disabled && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                Total: <span className="font-semibold">{teamMembers.length}</span> anggota tim telah ditambahkan.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
