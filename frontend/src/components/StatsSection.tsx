import React from 'react';

const StatsSection: React.FC = () => (
  <section className="py-10 bg-gray-50">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between">
        {/* Left content */}
        <div className="mb-6 md:mb-0 max-w-xl">
          <h2 className="text-2xl font-semibold text-gray-800">Your Graduation Journey Starts Here</h2>
          <p className="text-gray-600 mt-2">
            Join thousands of students who have successfully registered for graduation.
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-10">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-blue-600">95%</h3>
            <p className="text-gray-700 mt-1">Successful Registration</p>
          </div>
          <div className="text-center">
            <h3 className="text-3xl font-bold text-green-600">99%</h3>
            <p className="text-gray-700 mt-1">User Satisfaction</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default StatsSection;
