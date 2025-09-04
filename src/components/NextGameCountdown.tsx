import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const NextGameCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // Set to 12:00 AM tomorrow

      const difference = tomorrow.getTime() - now.getTime();

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl p-4 shadow-lg border border-orange-200">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-bold text-orange-800" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
          அடுத்த கேம்
        </h3>
      </div>
      
      <div className="flex items-center justify-center gap-4">
        <div className="text-center">
          <div className="bg-white rounded-lg px-3 py-2 shadow-md">
            <div className="text-2xl font-bold text-orange-600">
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-600 font-medium">Hours</div>
          </div>
        </div>
        
        <div className="text-orange-600 font-bold text-xl">:</div>
        
        <div className="text-center">
          <div className="bg-white rounded-lg px-3 py-2 shadow-md">
            <div className="text-2xl font-bold text-orange-600">
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-600 font-medium">Minutes</div>
          </div>
        </div>
        
        <div className="text-orange-600 font-bold text-xl">:</div>
        
        <div className="text-center">
          <div className="bg-white rounded-lg px-3 py-2 shadow-md">
            <div className="text-2xl font-bold text-orange-600">
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-600 font-medium">Seconds</div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-3">
        <p className="text-sm text-orange-700" style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
          நாளை 12:00 AM க்கு புதிய விளையாட்டு
        </p>
      </div>
    </div>
  );
};

export default NextGameCountdown;