import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Select } from 'alurkerja-ui';
import { AlurkerjaMfeInputProps } from '../type/AlurkerjaType';

interface SelectOption {
    label: string;
    value: string | number;
}

interface CompanyData {
    id: number | string;
    name: string;
    [key: string]: any;
}

interface JournalData {
    id: number | string;
    name: string;
    [key: string]: any;
}

interface AccountData {
    id: number | string;
    name: string;
    code?: string;
    [key: string]: any;
}

export default function OdooJournalFormView({ props, alurkerjaParams }: Readonly<AlurkerjaMfeInputProps>) {
    const { form, item } = props;
    const { control, setValue, watch } = form;

    // Field ini terdiri dari 4 sub-field internal (company_id, journal_id,
    // debit_account_id, credit_account_id) yang tidak dikenal platform lewat
    // 1 nama field wrapper saja -- karena itu "required" dari deklarasi BPMN
    // (item.constraints.required) harus kita baca & teruskan manual ke
    // rules setiap Controller di bawah, platform tidak bisa melakukan ini
    // otomatis. Tanpa ini, react-hook-form tetap meloloskan submit meski
    // ke-4 field tersebut kosong.
    const isRequired = item?.constraints?.required ?? false;
    const requiredRule = isRequired ? 'Field ini wajib diisi' : false;

    // Watch company_id untuk trigger dependent fields
    const watchedCompanyId = watch('company_id');

    // State untuk Companies
    const [companies, setCompanies] = useState<SelectOption[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<SelectOption | null>(null);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
    const [companiesError, setCompaniesError] = useState<string | null>(null);

    // State untuk Journals
    const [journals, setJournals] = useState<SelectOption[]>([]);
    const [selectedJournal, setSelectedJournal] = useState<SelectOption | null>(null);
    const [isLoadingJournals, setIsLoadingJournals] = useState(false);
    const [journalsError, setJournalsError] = useState<string | null>(null);

    // State untuk Debit Account
    const [debitAccounts, setDebitAccounts] = useState<SelectOption[]>([]);
    const [selectedDebitAccount, setSelectedDebitAccount] = useState<SelectOption | null>(null);
    const [isLoadingDebitAccounts, setIsLoadingDebitAccounts] = useState(false);

    // State untuk Credit Account
    const [creditAccounts, setCreditAccounts] = useState<SelectOption[]>([]);
    const [selectedCreditAccount, setSelectedCreditAccount] = useState<SelectOption | null>(null);
    const [isLoadingCreditAccounts, setIsLoadingCreditAccounts] = useState(false);

    const [accountsError, setAccountsError] = useState<string | null>(null);

    // Fetch Companies (independent)
    useEffect(() => {
        const fetchCompanies = async () => {
            if (!alurkerjaParams?.token) {
                setCompaniesError('Token not available');
                return;
            }

            setIsLoadingCompanies(true);
            setCompaniesError(null);

            try {
                const response = await fetch(
                    'https://api.javan.alurkerja.com/api/v1/integration/addons/javan-addon/3/api/fetch_odoo_company',
                    {
                        headers: {
                            'Authorization': `Bearer ${alurkerjaParams.token}`,
                            'x-active-tenant': alurkerjaParams.activeTenant,
                            'Content-Type': 'application/json',
                            'x-active-tenant': 'production',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('📋 [Companies] API Response:', data);

                let companyList: CompanyData[] = [];
                // Handle nested data structure: data.data.data
                if (data?.data?.data && Array.isArray(data.data.data)) {
                    companyList = data.data.data;
                } else if (Array.isArray(data)) {
                    companyList = data;
                } else if (data?.data && Array.isArray(data.data)) {
                    companyList = data.data;
                }

                const options: SelectOption[] = companyList.map((company: CompanyData) => ({
                    label: company.display_name || company.name || `Company ${company.id}`,
                    value: company.id,
                }));

                console.log('📋 [Companies] Loaded:', options);
                setCompanies(options);
                setCompaniesError(null);

                // Pre-fill if there's existing value
                const currentCompanyId = watch('company_id');
                if (currentCompanyId) {
                    const matchingCompany = options.find(opt =>
                        opt.value === currentCompanyId ||
                        String(opt.value) === String(currentCompanyId)
                    );
                    if (matchingCompany) {
                        setSelectedCompany(matchingCompany);
                        setValue('company_name', matchingCompany.label);
                    }
                }
            } catch (err) {
                console.error('❌ [Companies] Error:', err);
                setCompaniesError(err instanceof Error ? err.message : 'Failed to fetch companies');
                setCompanies([]);
            } finally {
                setIsLoadingCompanies(false);
            }
        };

        fetchCompanies();
    }, [alurkerjaParams?.token]);

    // Fetch Journals (dependent on company_id)
    useEffect(() => {
        if (!watchedCompanyId || !alurkerjaParams?.token) {
            setJournals([]);
            setIsLoadingJournals(false);
            setJournalsError(null);
            return;
        }

        const fetchJournals = async () => {
            setIsLoadingJournals(true);
            setJournalsError(null);

            try {
                const url = new URL(
                    'https://api.javan.alurkerja.com/api/v1/integration/addons/javan-addon/3/api/fetch_odoo_journals'
                );
                url.searchParams.append('company_id', String(watchedCompanyId));
                url.searchParams.append('limit', '1000'); // Optional: adjust limit as needed

                const response = await fetch(url.toString(), {
                    headers: {
                        'Authorization': `Bearer ${alurkerjaParams.token}`,
                        'x-active-tenant': alurkerjaParams.activeTenant,
                        'Content-Type': 'application/json',
                        'x-active-tenant': 'production',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('📋 [Journals] API Response:', data);

                let journalList: JournalData[] = [];
                // Handle nested data structure: data.data.journals
                if (data?.data?.data?.journals && Array.isArray(data.data.data.journals)) {
                    journalList = data.data.data.journals;
                } else if (Array.isArray(data)) {
                    journalList = data;
                } else if (data?.data && Array.isArray(data.data)) {
                    journalList = data.data;
                }

                const options: SelectOption[] = journalList.map((journal: JournalData) => ({
                    label: journal.name || `Journal ${journal.id}`,
                    value: journal.id,
                }));

                console.log('📋 [Journals] Loaded:', options);
                setJournals(options);
                setJournalsError(null);
            } catch (err) {
                console.error('❌ [Journals] Error:', err);
                setJournalsError(err instanceof Error ? err.message : 'Failed to fetch journals');
                setJournals([]);
            } finally {
                setIsLoadingJournals(false);
            }
        };

        fetchJournals();
    }, [watchedCompanyId, alurkerjaParams?.token]);

    // Fetch Accounts (dependent on company_id) - for both Debit and Credit
    useEffect(() => {
        if (!watchedCompanyId || !alurkerjaParams?.token) {
            setDebitAccounts([]);
            setCreditAccounts([]);
            setIsLoadingDebitAccounts(false);
            setIsLoadingCreditAccounts(false);
            setAccountsError(null);
            return;
        }

        const fetchAccounts = async () => {
            setIsLoadingDebitAccounts(true);
            setIsLoadingCreditAccounts(true);
            setAccountsError(null);

            try {
                const url = new URL(
                    'https://api.javan.alurkerja.com/api/v1/integration/addons/javan-addon/3/api/fetch_odoo_account'
                );
                url.searchParams.append('company_id', String(watchedCompanyId));

                const response = await fetch(url.toString(), {
                    headers: {
                        'Authorization': `Bearer ${alurkerjaParams.token}`,
                        'x-active-tenant': alurkerjaParams.activeTenant,
                        'Content-Type': 'application/json',
                        'x-active-tenant': 'production',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('📋 [Accounts] API Response:', data);

                let accountList: AccountData[] = [];
                // Handle nested data structure: check for data.data.accounts or data.data.data
                if (data?.data?.data?.accounts && Array.isArray(data.data.data.accounts)) {
                    accountList = data.data.data.accounts;
                } else if (data?.data?.data && Array.isArray(data.data.data)) {
                    accountList = data.data.data;
                } else if (Array.isArray(data)) {
                    accountList = data;
                } else if (data?.data && Array.isArray(data.data)) {
                    accountList = data.data;
                }

                const options: SelectOption[] = accountList.map((account: AccountData) => ({
                    label: account.code ? `${account.code} - ${account.name}` : account.name || `Account ${account.id}`,
                    value: account.id,
                }));

                console.log('📋 [Accounts] Loaded:', options);
                setDebitAccounts(options);
                setCreditAccounts(options); // Same data for both
                setAccountsError(null);
            } catch (err) {
                console.error('❌ [Accounts] Error:', err);
                setAccountsError(err instanceof Error ? err.message : 'Failed to fetch accounts');
                setDebitAccounts([]);
                setCreditAccounts([]);
            } finally {
                setIsLoadingDebitAccounts(false);
                setIsLoadingCreditAccounts(false);
            }
        };

        fetchAccounts();
    }, [watchedCompanyId, alurkerjaParams?.token]);

    if (!control) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600">Error: Form control not available. Please check component configuration.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Daftar Company */}
            <div className="space-y-2">
                <label className="block font-medium text-gray-700">
                    Daftar Company <span className="text-red-500">*</span>
                </label>

                {companiesError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600">{companiesError}</p>
                    </div>
                )}

                <input type="hidden" {...form.register('company_name')} />

                <Controller
                    name="company_id"
                    control={control}
                    rules={{ required: requiredRule }}
                    render={({ field, fieldState }) => (
                        <>
                        <Select
                            options={companies}
                            value={selectedCompany}
                            onChange={(selected: SelectOption | null) => {
                                console.log('🔄 [Company] Selected:', selected);
                                const companyId = selected?.value || '';
                                const companyName = selected?.label || '';

                                setSelectedCompany(selected);
                                field.onChange(companyId);
                                setValue('company_name', companyName);

                                // Reset dependent fields
                                setSelectedJournal(null);
                                setSelectedDebitAccount(null);
                                setSelectedCreditAccount(null);
                                setValue('journal_id', '');
                                setValue('journal_name', '');
                                setValue('debit_account_id', '');
                                setValue('debit_account_name', '');
                                setValue('credit_account_id', '');
                                setValue('credit_account_name', '');
                                setValue('label_journal_id', '');
                                setValue('label_journal_name', '');
                            }}
                            isLoading={isLoadingCompanies}
                            isDisabled={isLoadingCompanies || !!companiesError || item.disabled}
                            placeholder={isLoadingCompanies ? 'Loading companies...' : 'Select a company'}
                            isClearable
                        />
                        {fieldState.error && (
                            <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                        )}
                        </>
                    )}
                />
            </div>

            {/* Nama Jurnal */}
            <div className="space-y-2">
                <label className="block font-medium text-gray-700">
                    Nama Jurnal <span className="text-red-500">*</span>
                </label>

                {journalsError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600">{journalsError}</p>
                    </div>
                )}

                <input type="hidden" {...form.register('journal_name')} />

                <Controller
                    name="journal_id"
                    control={control}
                    rules={{ required: requiredRule }}
                    render={({ field, fieldState }) => (
                        <>
                        <Select
                            options={journals}
                            value={selectedJournal}
                            onChange={(selected: SelectOption | null) => {
                                console.log('🔄 [Journal] Selected:', selected);
                                const journalId = selected?.value || '';
                                const journalName = selected?.label || '';

                                setSelectedJournal(selected);
                                field.onChange(journalId);
                                setValue('journal_name', journalName);
                            }}
                            isLoading={isLoadingJournals}
                            isDisabled={!watchedCompanyId || isLoadingJournals || !!journalsError || item.disabled}
                            placeholder={
                                !watchedCompanyId
                                    ? 'Select a company first'
                                    : isLoadingJournals
                                    ? 'Loading journals...'
                                    : 'Select a journal'
                            }
                            isClearable
                        />
                        {fieldState.error && (
                            <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                        )}
                        </>
                    )}
                />
            </div>

            {/* Debit Account */}
            <div className="space-y-2">
                <label className="block font-medium text-gray-700">
                    Debit Account <span className="text-red-500">*</span>
                </label>

                {accountsError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600">{accountsError}</p>
                    </div>
                )}

                <input type="hidden" {...form.register('debit_account_name')} />

                <Controller
                    name="debit_account_id"
                    control={control}
                    rules={{ required: requiredRule }}
                    render={({ field, fieldState }) => (
                        <>
                        <Select
                            options={debitAccounts}
                            value={selectedDebitAccount}
                            onChange={(selected: SelectOption | null) => {
                                console.log('🔄 [Debit Account] Selected:', selected);
                                const accountId = selected?.value || '';
                                const accountName = selected?.label || '';

                                setSelectedDebitAccount(selected);
                                field.onChange(accountId);
                                setValue('debit_account_name', accountName);
                            }}
                            isLoading={isLoadingDebitAccounts}
                            isDisabled={!watchedCompanyId || isLoadingDebitAccounts || !!accountsError || item.disabled}
                            placeholder={
                                !watchedCompanyId
                                    ? 'Select a company first'
                                    : isLoadingDebitAccounts
                                    ? 'Loading accounts...'
                                    : 'Select a debit account'
                            }
                            isClearable
                        />
                        {fieldState.error && (
                            <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                        )}
                        </>
                    )}
                />
            </div>

            {/* Credit Account */}
            <div className="space-y-2">
                <label className="block font-medium text-gray-700">
                    Credit Account <span className="text-red-500">*</span>
                </label>

                <input type="hidden" {...form.register('credit_account_name')} />

                <Controller
                    name="credit_account_id"
                    control={control}
                    rules={{ required: requiredRule }}
                    render={({ field, fieldState }) => (
                        <>
                        <Select
                            options={creditAccounts}
                            value={selectedCreditAccount}
                            onChange={(selected: SelectOption | null) => {
                                console.log('🔄 [Credit Account] Selected:', selected);
                                const accountId = selected?.value || '';
                                const accountName = selected?.label || '';

                                setSelectedCreditAccount(selected);
                                field.onChange(accountId);
                                setValue('credit_account_name', accountName);
                            }}
                            isLoading={isLoadingCreditAccounts}
                            isDisabled={!watchedCompanyId || isLoadingCreditAccounts || !!accountsError || item.disabled}
                            placeholder={
                                !watchedCompanyId
                                    ? 'Select a company first'
                                    : isLoadingCreditAccounts
                                    ? 'Loading accounts...'
                                    : 'Select a credit account'
                            }
                            isClearable
                        />
                        {fieldState.error && (
                            <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                        )}
                        </>
                    )}
                />
            </div>
        </div>
    );
}
