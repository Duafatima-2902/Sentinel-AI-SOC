import React, { useState, useEffect } from 'react';

const PlaybookRunner = ({ caseId, onComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playbook, setPlaybook] = useState(null);

  const playbooks = {
    'block-ip': {
      name: 'Block IP Address',
      description: 'Block malicious IP address across all security controls',
      steps: [
        { name: 'Analyzing IP reputation', duration: 2000 },
        { name: 'Updating firewall rules', duration: 3000 },
        { name: 'Blocking IP in WAF', duration: 2000 },
        { name: 'Updating threat intelligence', duration: 1000 }
      ]
    },
    'lock-user': {
      name: 'Lock User Account',
      description: 'Lock compromised user account and force password reset',
      steps: [
        { name: 'Verifying user identity', duration: 1500 },
        { name: 'Locking account', duration: 1000 },
        { name: 'Sending notification', duration: 2000 },
        { name: 'Logging action', duration: 500 }
      ]
    },
    'isolate-host': {
      name: 'Isolate Host',
      description: 'Isolate compromised host from network',
      steps: [
        { name: 'Identifying host', duration: 1000 },
        { name: 'Moving to quarantine VLAN', duration: 3000 },
        { name: 'Blocking network access', duration: 2000 },
        { name: 'Notifying security team', duration: 1500 }
      ]
    }
  };

  const runPlaybook = (playbookId) => {
    const selectedPlaybook = playbooks[playbookId];
    if (!selectedPlaybook) return;

    setPlaybook(selectedPlaybook);
    setIsRunning(true);
    setCurrentStep(0);
    setProgress(0);

    let totalDuration = 0;
    selectedPlaybook.steps.forEach(step => {
      totalDuration += step.duration;
    });

    let currentDuration = 0;
    let stepIndex = 0;

    const interval = setInterval(() => {
      currentDuration += 100;
      const newProgress = Math.min((currentDuration / totalDuration) * 100, 100);
      setProgress(newProgress);

      // Check if we need to move to next step
      if (stepIndex < selectedPlaybook.steps.length) {
        const stepStartTime = stepIndex === 0 ? 0 : 
          selectedPlaybook.steps.slice(0, stepIndex).reduce((sum, step) => sum + step.duration, 0);
        
        if (currentDuration >= stepStartTime + selectedPlaybook.steps[stepIndex].duration) {
          setCurrentStep(stepIndex + 1);
          stepIndex++;
        }
      }

      // Complete playbook
      if (currentDuration >= totalDuration) {
        clearInterval(interval);
        setTimeout(() => {
          setIsRunning(false);
          setCurrentStep(selectedPlaybook.steps.length);
          onComplete && onComplete(playbookId, true);
        }, 500);
      }
    }, 100);
  };

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'current': return '🔄';
      default: return '⏳';
    }
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'current': return 'text-blue-600';
      default: return 'text-gray-400';
    }
  };

  if (!isRunning && !playbook) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Run Playbook</h3>
        <div className="space-y-3">
          {Object.entries(playbooks).map(([id, playbook]) => (
            <button
              key={id}
              onClick={() => runPlaybook(id)}
              className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">{playbook.name}</div>
              <div className="text-sm text-gray-600">{playbook.description}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (isRunning || playbook) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {playbook?.name || 'Running Playbook'}
          </h3>
          {isRunning && (
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Running...</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {playbook?.steps.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <div key={index} className={`flex items-center space-x-3 p-2 rounded ${
                status === 'current' ? 'bg-blue-50' : ''
              }`}>
                <span className={`text-lg ${getStepColor(status)}`}>
                  {getStepIcon(status)}
                </span>
                <span className={`text-sm ${
                  status === 'completed' ? 'text-green-700' :
                  status === 'current' ? 'text-blue-700 font-medium' :
                  'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {status === 'current' && (
                  <div className="ml-auto">
                    <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Result */}
        {!isRunning && currentStep === playbook?.steps.length && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span className="text-green-800 font-medium">Playbook completed successfully</span>
            </div>
            <div className="text-sm text-green-700 mt-1">
              All security controls have been updated and the threat has been mitigated.
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default PlaybookRunner;
