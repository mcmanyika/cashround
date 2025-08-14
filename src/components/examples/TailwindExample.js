import React from 'react';

// Example component showing Tailwind CSS usage alongside existing CSS
const TailwindExample = () => {
  return (
    <div className="container-mukando section-padding">
      {/* Using Tailwind classes for layout */}
      <div className="text-center mb-12">
        <h1 className="heading-primary text-gradient mb-4">
          Tailwind CSS Integration
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          This component demonstrates how to use Tailwind CSS alongside your existing CSS structure.
        </p>
      </div>

      {/* Grid layout with Tailwind */}
      <div className="grid-responsive">
        {/* Card 1 - Using Tailwind classes */}
        <div className="card-hover">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-mukando-500 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white text-xl font-bold">CR</span>
            </div>
            <div>
              <h3 className="heading-secondary">Tailwind Components</h3>
              <p className="text-gray-500">Pre-built component classes</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Use custom component classes like <code className="bg-gray-100 px-2 py-1 rounded">.btn-primary</code> and <code className="bg-gray-100 px-2 py-1 rounded">.card</code> for consistent styling.
          </p>
          <button className="btn-primary w-full">
            Get Started
          </button>
        </div>

        {/* Card 2 - Mixed approach */}
        <div className="card-hover">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-mukando-500 to-mukando-700 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white text-xl font-bold">M</span>
            </div>
            <div>
              <h3 className="heading-secondary">Hybrid Approach</h3>
              <p className="text-gray-500">Tailwind + Existing CSS</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Combine Tailwind utilities with your existing CSS classes for the best of both worlds.
          </p>
          <button className="btn-outline w-full">
            Learn More
          </button>
        </div>

        {/* Card 3 - Responsive design */}
        <div className="card-hover">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-mukando-600 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white text-xl">📱</span>
            </div>
            <div>
              <h3 className="heading-secondary">Mobile First</h3>
              <p className="text-gray-500">Responsive utilities</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Built-in responsive design with <code className="bg-gray-100 px-2 py-1 rounded">sm:</code>, <code className="bg-gray-100 px-2 py-1 rounded">md:</code>, and <code className="bg-gray-100 px-2 py-1 rounded">lg:</code> prefixes.
          </p>
          <div className="flex space-x-2">
            <span className="status-success">Success</span>
            <span className="status-warning">Warning</span>
            <span className="status-error">Error</span>
          </div>
        </div>
      </div>

      {/* Form example */}
      <div className="mt-12 max-w-md mx-auto">
        <h2 className="heading-secondary mb-6 text-center">Form Example</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              className="input-primary"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input 
              type="password" 
              className="input-primary"
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Submit Form
          </button>
        </form>
      </div>

      {/* Loading state example */}
      <div className="mt-12 text-center">
        <h2 className="heading-secondary mb-6">Loading States</h2>
        <div className="flex justify-center space-x-4">
          <div className="loading-spinner"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    </div>
  );
};

export default TailwindExample;
