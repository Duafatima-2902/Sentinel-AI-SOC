import React, { useState, useEffect } from 'react';

const MiniKPIStrip = ({ darkMode }) => {
  const [isVisible, setIsVisible] = useState(false);

  // KPI data
  const kpiData = [
    {
      icon: '👤',
      value: 3,
      label: 'Users at Risk',
      color: 'text-red-600 dark:text-red-400'
    },
    {
      icon: '🌍',
      value: 5,
      label: 'Countries Attacking',
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      icon: '🕵️',
      value: 1,
      label: 'Insider Threat Indicators',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: '🔐',
      value: 8,
      label: 'MFA Challenges Triggered',
      color: 'text-blue-600 dark:text-blue-400'
    }
  ];

  // Count-up animation hook
  const useCountUp = (end, duration = 1000, delay = 0) => {
    const [count, setCount] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
      if (!isVisible) return;

      const timer = setTimeout(() => {
        setIsAnimating(true);
        const startTime = Date.now();
        const startValue = 0;

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function for smooth animation
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const currentValue = Math.floor(startValue + (end - startValue) * easeOutQuart);
          
          setCount(currentValue);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setIsAnimating(false);
          }
        };

        requestAnimationFrame(animate);
      }, delay);

      return () => clearTimeout(timer);
    }, [isVisible, end, duration, delay]);

    return { count, isAnimating };
  };

  // Call hooks for each KPI outside of render loop
  const kpi1 = useCountUp(kpiData[0].value, 1200, 0);
  const kpi2 = useCountUp(kpiData[1].value, 1200, 200);
  const kpi3 = useCountUp(kpiData[2].value, 1200, 400);
  const kpi4 = useCountUp(kpiData[3].value, 1200, 600);

  const kpiCounts = [kpi1, kpi2, kpi3, kpi4];

  // Trigger visibility when component mounts
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mb-8">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 transition-all duration-500">
        {/* Section Title */}
        <div className="flex items-center mb-6">
          <span className="text-2xl mr-3">📊</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security KPIs</h2>
        </div>

        {/* Mini KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi, index) => {
            const { count } = kpiCounts[index];
            
            return (
              <div
                key={index}
                className={`bg-white dark:bg-slate-700 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-slate-600 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group`}
              >
                <div className="flex items-start justify-between">
                  {/* Icon */}
                  <div className="text-2xl opacity-80 group-hover:opacity-100 transition-opacity">
                    {kpi.icon}
                  </div>
                  
                  {/* Value */}
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${kpi.color} transition-colors`}>
                      {count}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-tight">
                      {kpi.label}
                    </div>
                  </div>
                </div>
                
                {/* Subtle accent line */}
                <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${kpi.color.replace('text-', 'from-').replace(' dark:text-', ' dark:from-').replace('-600', '-500').replace('-400', '-300')} to-transparent opacity-60`}></div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-600">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>High Risk</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Medium Risk</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Security Events</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniKPIStrip;

