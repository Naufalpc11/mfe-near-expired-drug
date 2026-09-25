import React, { useEffect, useState } from 'react';
import { AlurkerjaMfeInputProps } from '../type/AlurkerjaType';
import { jwtDecode } from 'jwt-decode';

interface AllocationData {
    allocation_remaining_days: number;
    allocation_remaining_hours: number;
}

interface ApiResponse {
    status: number;
    message: string;
    data: AllocationData[];
}

interface DecodedToken {
    email?: string;
    [key: string]: any;
}

export default function CheckSisaCutiInput({ props, alurkerjaParams }: AlurkerjaMfeInputProps) {
    const { form, item } = props;
    const { setValue } = form;
    const { token } = alurkerjaParams;

    const [remainingDays, setRemainingDays] = useState<number | null>(null);
    const [remainingHours, setRemainingHours] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchAllocationData = async () => {
            try {
                setLoading(true);

                // Decode token to get email
                const decoded = jwtDecode<DecodedToken>(token);
                const userEmail = decoded.email;

                if (!userEmail) {
                    setError('Email tidak ditemukan dalam token');
                    setLoading(false);
                    return;
                }

                // Create Basic Auth header
                const username = 'alurkerja';
                const password = 'J4v4nLabs123';
                const basicAuth = btoa(`${username}:${password}`);

                // Fetch allocation data from n8n API with Basic Auth
                const response = await fetch(
                    `https://n8n-new.merapi.javan.id/webhook/allocation-remaining?email=${userEmail}`,
                    {
                        headers: {
                            'Authorization': `Basic ${basicAuth}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result: ApiResponse = await response.json();

                // Check if we have valid data
                if (result && result.data && result.data.length > 0) {
                    const allocation = result.data[0];
                    const days = allocation.allocation_remaining_days;
                    const hours = allocation.allocation_remaining_hours;

                    setRemainingDays(days);
                    setRemainingHours(hours);

                    // Save individual values to form
                    setValue('sisaCutiDays', days);
                    setValue('sisaCutiHours', hours);
                } else {
                    setError('Data alokasi cuti tidak ditemukan');
                    setRemainingDays(0);
                    setRemainingHours(0);
                    setValue('sisaCutiDays', 0);
                    setValue('sisaCutiHours', 0);
                }
            } catch (err) {
                console.error('Error fetching allocation data:', err);
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
                setRemainingDays(null);
                setRemainingHours(null);
                setValue('sisaCutiDays', 0);
                setValue('sisaCutiHours', 0);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchAllocationData();
        }
    }, [token, setValue, item.name]);

    const renderContent = () => {
        if (loading) {
            return (
                <span className="text-gray-500">Loading...</span>
            );
        }

        if (error) {
            return (
                <div>
                    <span className="text-red-600 font-semibold">Error: Data tidak tersedia</span>
                    <p className="text-xs text-red-500 mt-1">{error}</p>
                </div>
            );
        }

        if (remainingDays !== null && remainingHours !== null) {
            return (
                <span className="font-semibold text-gray-900">
                    {remainingHours} Jam ({remainingDays} Hari)
                </span>
            );
        }

        return <span className="text-gray-500">Data tidak tersedia</span>;
    };

    return (
        <div className="space-y-2">
            <p className="text-sm">
                Jumlah Cuti yang bisa diajukan: {renderContent()}
            </p>
            {/* Hidden field to store the data */}
            <input type="hidden" name={item.name} />
        </div>
    );
}

