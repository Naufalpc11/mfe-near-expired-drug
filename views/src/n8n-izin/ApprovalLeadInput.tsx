import React, { useEffect, useState } from 'react';
import { AlurkerjaMfeInputProps } from '../type/AlurkerjaType';
import { jwtDecode } from 'jwt-decode';

interface Manager {
    fullname: string;
    email: string;
}

interface ApiResponse {
    status: number;
    message: string;
    data: Manager[];
}

interface DecodedToken {
    email?: string;
    [key: string]: any;
}

export default function ApprovalLeadInput({ props, alurkerjaParams }: AlurkerjaMfeInputProps) {
    const { form, item } = props;
    const { setValue } = form;
    const { token } = alurkerjaParams;

    const [managerName, setManagerName] = useState<string>('Loading...');
    const [managerCount, setManagerCount] = useState<number>(0);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchManagerData = async () => {
            try {
                // Decode token to get email
                const decoded = jwtDecode<DecodedToken>(token);
                const userEmail = decoded.email;

                if (!userEmail) {
                    setError('Email tidak ditemukan dalam token');
                    setManagerName('Email tidak ditemukan');
                    return;
                }

                // Create Basic Auth header
                const username = 'alurkerja';
                const password = 'J4v4nLabs123';
                const basicAuth = btoa(`${username}:${password}`);

                // Fetch manager data from n8n API with Basic Auth
                const response = await fetch(
                    `https://n8n-new.merapi.javan.id/webhook/get-manager?email=${userEmail}`,
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

                const result: ApiResponse[] = await response.json();

                // Check if we have valid data
                if (result && result.length > 0 && result[0].data && result[0].data.length > 0) {
                    const managers = result[0].data;

                    // Display the first manager's fullname
                    const firstManager = managers[0];
                    setManagerName(firstManager.fullname);
                    setManagerCount(managers.length);

                    // Save individual manager data to specific form fields dynamically
                    // Loop through all managers and set values for each one
                    managers.forEach((manager, index) => {
                        const managerNumber = index + 1; // Start from 1 instead of 0
                        if (managerNumber === 1) {
                            setValue('leadUsername', manager.fullname);
                            setValue('leadName', manager.email);
                        } else {
                            setValue(`leadUsername${managerNumber}`, manager.fullname);
                            setValue(`leadName${managerNumber}`, manager.email);
                        }
                    });
                } else {
                    setManagerName('Tidak ada data manager');
                    setError('Data manager tidak ditemukan');
                }
            } catch (err) {
                console.error('Error fetching manager data:', err);
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
                setManagerName('Gagal memuat data');
            }
        };

        if (token) {
            fetchManagerData();
        }
    }, [token, setValue, item.name]);

    return (
        <div className="space-y-2">
            <p className="text-sm text-gray-900">
                Lead yang akan melakukan Approval Izin: <span className="font-semibold">{managerName}</span>
            </p>
            {error && (
                <p className="text-xs text-red-500 mt-1">Error: {error}</p>
            )}
            {/* Hidden field to store the data */}
            <input type="hidden" name={item.name} />
        </div>
    );
}

