import React, { useState } from 'react';
import { Bug, Copy } from 'lucide-react';

interface DebugViewProps {
  form?: {
    watch?: (name?: string) => any;
    getValues?: (name?: string) => any;
    formState?: any;
    control?: any;
  };
  data?: any;
  title?: string;
  className?: string;
}

const DebugView: React.FC<DebugViewProps> = ({ 
  form, 
  data, 
  title = "Debug Panel", 
  className = "" 
}) => {
  const [activeTab, setActiveTab] = useState<'values' | 'formState' | 'watch' | 'custom'>('values');
  const [copySuccess, setCopySuccess] = useState(false);

  // Get form data based on active tab
  const getDebugData = () => {
    if (!form && !data) return null;

    switch (activeTab) {
      case 'values':
        return form?.getValues ? form.getValues() : data;
      case 'formState':
        return form?.formState || null;
      case 'watch':
        return form?.watch ? form.watch() : null;
      case 'custom':
        return data || null;
      default:
        return null;
    }
  };

  const debugData = getDebugData();

  const copyToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(debugData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`w-80 h-full bg-white border-l border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
        <div className="flex items-center gap-2">
          <Bug size={16} className="text-blue-600" />
          <h3 className="text-sm font-semibold text-blue-900">{title}</h3>
        </div>
        <button
          onClick={copyToClipboard}
          className="p-1 text-gray-500 hover:text-green-600 transition-colors"
          title={copySuccess ? 'Copied!' : 'Copy JSON'}
        >
          <Copy size={14} className={copySuccess ? 'text-green-600' : ''} />
        </button>
      </div>

      {/* Tabs */}
      {form && (
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {[
            { key: 'values', label: 'Values' },
            { key: 'formState', label: 'State' },
            { key: 'watch', label: 'Watch' },
            ...(data ? [{ key: 'custom', label: 'Custom' }] : [])
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap flex-1 ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {debugData ? (
          <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words font-mono bg-gray-50 p-3 rounded border h-full overflow-auto">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        ) : (
          <div className="text-xs text-gray-500 italic text-center py-8">
            No data available
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <div className="text-xs text-gray-500 flex justify-between items-center">
          <span>Mode: {activeTab}</span>
          <span>
            {debugData && typeof debugData === 'object' 
              ? `${Object.keys(debugData).length} props` 
              : debugData ? 'Data available' : 'No data'
            }
          </span>
        </div>
        {copySuccess && (
          <div className="text-xs text-green-600 mt-1 text-center">
            ✓ Copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugView;