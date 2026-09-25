import React from 'react';
import { useForm } from 'react-hook-form';
import DebugView from './DebugView';

interface FormData {
  name: string;
  email: string;
  message: string;
  subscribe: boolean;
}

const ExampleForm: React.FC = () => {
  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      message: '',
      subscribe: false
    },
    mode: 'onChange'
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
  };

  // Watch all form values for debugging
  const watchedValues = watch();

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Example Form with Debug</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Name</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="form-input"
              placeholder="Enter your name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Email</label>
            <input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              className="form-input"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Message</label>
            <textarea
              {...register('message', { minLength: { value: 10, message: 'Minimum 10 characters' } })}
              className="form-input"
              rows={3}
              placeholder="Enter your message"
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              {...register('subscribe')}
              type="checkbox"
              id="subscribe"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="subscribe" className="ml-2 text-sm text-gray-700">
              Subscribe to newsletter
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
          >
            Submit Form
          </button>
        </form>
      </div>

      {/* Debug View for this specific form */}
      <DebugView 
        form={form}
        data={{ 
          watchedValues, 
          customData: 'This is custom debug data',
          timestamp: new Date().toISOString()
        }}
        title="Example Form Debug"
      />
    </div>
  );
};

export default ExampleForm;