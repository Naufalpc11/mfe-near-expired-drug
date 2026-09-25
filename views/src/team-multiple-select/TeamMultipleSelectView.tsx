import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { AlurkerjaMfeInputProps } from '../type/AlurkerjaType';

interface Team {
    name: string;
    email: string;
    [key: string]: any;
}

export default function TeamMultipleSelectView({ props, alurkerjaParams }: AlurkerjaMfeInputProps) {
    const { form, item } = props;
    const { control, setValue, watch } = form;
    const { name, constraints } = item;

    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fieldValue = watch(name) || [];

    // Filter teams based on search query
    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Fetch teams from remote URL
    useEffect(() => {
        const fetchTeams = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch('https://api.javan.alurkerja.com/api/v1/tasklist/teams', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-active-tenant': alurkerjaParams.activeTenant || 'Javan-Dev',
                        ...(alurkerjaParams?.token && { 'Authorization': `Bearer ${alurkerjaParams.token}` })
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch teams: ${response.statusText}`);
                }

                const data = await response.json();

                // Handle different response structures
                const teamsList = Array.isArray(data) ? data : data.data || data.teams || [];
                setTeams(teamsList);

            } catch (err) {
                console.error('Error fetching teams:', err);
                setError(err instanceof Error ? err.message : 'Failed to load teams');
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, [alurkerjaParams?.token]);

    const handleToggleTeam = (teamEmail: string) => {
        const currentValue = Array.isArray(fieldValue) ? fieldValue : [];
        const newValue = currentValue.includes(teamEmail)
            ? currentValue.filter(email => email !== teamEmail)
            : [...currentValue, teamEmail];

        setValue(name, newValue);
    };

    const handleSelectAll = () => {
        const allTeamEmails = filteredTeams.map(team => team.email);
        const currentValue = Array.isArray(fieldValue) ? fieldValue : [];
        // Merge with existing selections
        const uniqueTeams = [...new Set([...currentValue, ...allTeamEmails])];
        setValue(name, uniqueTeams);
    };

    const handleClearAll = () => {
        if (searchQuery) {
            // If searching, only clear filtered items
            const filteredTeamEmails = filteredTeams.map(team => team.email);
            const currentValue = Array.isArray(fieldValue) ? fieldValue : [];
            const newValue = currentValue.filter(teamEmail => !filteredTeamEmails.includes(teamEmail));
            setValue(name, newValue);
        } else {
            // If not searching, clear all
            setValue(name, []);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Teams
                {constraints?.required && <span style={{ color: '#EF4444', marginLeft: '0.25rem' }}>*</span>}
            </label>

            <Controller
                name={'teamList'}
                control={control}
                rules={{
                    required: constraints?.required ? 'This field is required' : false
                }}
                render={({ field, fieldState: { error: fieldError } }) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {/* Search Input */}
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search teams..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 1rem',
                                    paddingRight: '2.5rem',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '0.375rem',
                                    outline: 'none',
                                }}
                                onFocus={(e) => {
                                    e.target.style.outline = '2px solid #3B82F6';
                                    e.target.style.outlineOffset = '2px';
                                    e.target.style.borderColor = 'transparent';
                                }}
                                onBlur={(e) => {
                                    e.target.style.outline = 'none';
                                    e.target.style.borderColor = '#D1D5DB';
                                }}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#9CA3AF',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0.25rem',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#4B5563'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                                >
                                    ✕
                                </button>
                            )}
                            {!searchQuery && (
                                <span style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9CA3AF',
                                }}>
                                    🔍
                                </span>
                            )}
                        </div>

                        {/* Search Results Info */}
                        {searchQuery && (
                            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                Found {filteredTeams.length} team(s) matching "{searchQuery}"
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                disabled={loading || teams.length === 0}
                                style={{
                                    padding: '0.25rem 0.75rem',
                                    fontSize: '0.75rem',
                                    backgroundColor: loading || teams.length === 0 ? '#D1D5DB' : '#3B82F6',
                                    color: 'white',
                                    borderRadius: '0.25rem',
                                    border: 'none',
                                    cursor: loading || teams.length === 0 ? 'not-allowed' : 'pointer',
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading && teams.length > 0) {
                                        e.currentTarget.style.backgroundColor = '#2563EB';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading && teams.length > 0) {
                                        e.currentTarget.style.backgroundColor = '#3B82F6';
                                    }
                                }}
                            >
                                Select All
                            </button>
                            <button
                                type="button"
                                onClick={handleClearAll}
                                disabled={loading || fieldValue.length === 0}
                                style={{
                                    padding: '0.25rem 0.75rem',
                                    fontSize: '0.75rem',
                                    backgroundColor: loading || fieldValue.length === 0 ? '#D1D5DB' : '#6B7280',
                                    color: 'white',
                                    borderRadius: '0.25rem',
                                    border: 'none',
                                    cursor: loading || fieldValue.length === 0 ? 'not-allowed' : 'pointer',
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading && fieldValue.length > 0) {
                                        e.currentTarget.style.backgroundColor = '#4B5563';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading && fieldValue.length > 0) {
                                        e.currentTarget.style.backgroundColor = '#6B7280';
                                    }
                                }}
                            >
                                Clear All
                            </button>
                            <span style={{ 
                                fontSize: '0.75rem', 
                                color: '#6B7280', 
                                display: 'flex', 
                                alignItems: 'center', 
                                marginLeft: 'auto' 
                            }}>
                                {fieldValue.length} of {teams.length} selected
                            </span>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div style={{ padding: '1rem', textAlign: 'center', color: '#6B7280' }}>
                                <div style={{ 
                                    display: 'inline-block', 
                                    width: '1.5rem', 
                                    height: '1.5rem', 
                                    border: '2px solid #3B82F6',
                                    borderTopColor: 'transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Loading teams...</p>
                                <style>
                                    {`@keyframes spin { to { transform: rotate(360deg); } }`}
                                </style>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div style={{
                                padding: '0.75rem',
                                backgroundColor: '#FEF2F2',
                                border: '1px solid #FECACA',
                                borderRadius: '0.375rem',
                                color: '#B91C1C',
                                fontSize: '0.875rem'
                            }}>
                                <p style={{ fontWeight: '500' }}>Error loading teams</p>
                                <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{error}</p>
                            </div>
                        )}

                        {/* Teams List */}
                        {!loading && !error && filteredTeams.length > 0 && (
                            <div style={{
                                border: '1px solid #D1D5DB',
                                borderRadius: '0.375rem',
                                maxHeight: '16rem',
                                overflowY: 'auto'
                            }}>
                                <div style={{ borderBottom: '1px solid #E5E7EB' }}>
                                    {filteredTeams.map((team, index) => (
                                        <label
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '0.5rem 1rem',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s',
                                                borderBottom: index < filteredTeams.length - 1 ? '1px solid #E5E7EB' : 'none'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={fieldValue.includes(team.email)}
                                                onChange={() => handleToggleTeam(team.email)}
                                                style={{
                                                    height: '1rem',
                                                    width: '1rem',
                                                    accentColor: '#3B82F6',
                                                    border: '1px solid #D1D5DB',
                                                    borderRadius: '0.25rem'
                                                }}
                                            />
                                            <span style={{ marginLeft: '0.75rem', fontSize: '0.875rem', color: '#111827' }}>
                                                {team.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty State - No Results */}
                        {!loading && !error && teams.length > 0 && filteredTeams.length === 0 && (
                            <div style={{
                                padding: '1rem',
                                textAlign: 'center',
                                color: '#6B7280',
                                border: '1px solid #D1D5DB',
                                borderRadius: '0.375rem'
                            }}>
                                <p style={{ fontSize: '0.875rem' }}>No teams found matching "{searchQuery}"</p>
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        marginTop: '0.5rem',
                                        fontSize: '0.75rem',
                                        color: '#3B82F6',
                                        textDecoration: 'underline',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#1E40AF'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#3B82F6'}
                                >
                                    Clear search
                                </button>
                            </div>
                        )}

                        {/* Empty State - No Teams */}
                        {!loading && !error && teams.length === 0 && (
                            <div style={{
                                padding: '1rem',
                                textAlign: 'center',
                                color: '#6B7280',
                                border: '1px solid #D1D5DB',
                                borderRadius: '0.375rem'
                            }}>
                                <p style={{ fontSize: '0.875rem' }}>No teams available</p>
                            </div>
                        )}

                        {/* Selected Teams Display */}
                        {fieldValue.length > 0 && (
                            <div style={{
                                marginTop: '0.75rem',
                                padding: '0.75rem',
                                backgroundColor: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                borderRadius: '0.375rem'
                            }}>
                                <p style={{
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    color: '#1E3A8A',
                                    marginBottom: '0.5rem'
                                }}>Selected Teams:</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {fieldValue.map((teamEmail: string, index: number) => {
                                        const team = teams.find(t => t.email === teamEmail);
                                        const displayName = team ? team.name : teamEmail;
                                        return (
                                            <span
                                                key={index}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    padding: '0.25rem 0.5rem',
                                                    backgroundColor: '#DBEAFE',
                                                    color: '#1E40AF',
                                                    fontSize: '0.75rem',
                                                    borderRadius: '0.25rem'
                                                }}
                                            >
                                                {displayName}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleTeam(teamEmail)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#1E40AF',
                                                        cursor: 'pointer',
                                                        padding: 0,
                                                        marginLeft: '0.125rem',
                                                        fontSize: '1rem',
                                                        lineHeight: '1'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = '#1E3A8A'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = '#1E40AF'}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Validation Error */}
                        {fieldError && (
                            <p style={{ fontSize: '0.875rem', color: '#DC2626', marginTop: '0.25rem' }}>
                                {fieldError.message}
                            </p>
                        )}
                    </div>
                )}
            />
        </div>
    );
}

