import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const features = [
    {
      title: 'Gestion de dialogues par projet',
      description: 'Organisez vos dialogues et messages.',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      link: '/projects'
    },
  ];

  const quickActions = [
    {
      title: 'Nouveau Projet',
      description: '',
      action: 'create-project',
      buttonText: 'Créer',
      className: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    {
      title: 'Projet Récent',
      description: '',
      action: 'open-recent',
      buttonText: 'Ouvrir',
      className: 'bg-green-600 hover:bg-green-700 text-white'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Tailwind Test Badge */}
      <div className="mb-4 flex justify-end">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          Tailwind CSS actif
        </span>
      </div>
      
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Game Dialog Editor
        </h1>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {quickActions.map((action) => (
          <div key={action.action} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {action.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {action.description}
            </p>
            <button
              className={`px-4 py-2 rounded-md font-medium transition-colors ${action.className}`}
              onClick={() => {
                // TODO: Implémenter les actions
                console.log(`Action: ${action.action}`);
              }}
            >
              {action.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="mb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.link}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gray-100 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Comment commencer ?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
              1
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Créez un projet</h3>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
              2
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Ajoutez des personnages</h3>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
              3
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Écrivez et exportez</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;