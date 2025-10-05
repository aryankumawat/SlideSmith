'use client';

import React, { useState, useEffect } from 'react';
import { LiveWidget, Theme } from '@/lib/schema';
import { getThemeConfig } from '@/lib/theming';

interface CountdownProps {
  widget: LiveWidget;
  theme: Theme;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function Countdown({ widget, theme }: CountdownProps) {
  const themeConfig = getThemeConfig(theme);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  const calculateTimeLeft = (targetDate: Date): TimeLeft => {
    const now = new Date().getTime();
    const target = targetDate.getTime();
    const difference = target - now;

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    } else {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
  };

  useEffect(() => {
    if (widget.kind !== 'Countdown') return;
    
    const targetDate = new Date(widget.targetIso);
    
    const updateCountdown = () => {
      const timeLeft = calculateTimeLeft(targetDate);
      setTimeLeft(timeLeft);
      setIsExpired(timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [widget.kind, widget.kind === 'Countdown' ? widget.targetIso : '']);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  if (isExpired) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="text-4xl font-bold" style={{ color: themeConfig.colors.primary }}>
            Time's Up!
          </div>
          <div className="text-lg mt-2" style={{ color: themeConfig.colors.textSecondary }}>
            The countdown has ended
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-32">
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="flex flex-col items-center">
          <div
            className="text-3xl font-bold"
            style={{ color: themeConfig.colors.primary }}
          >
            {formatNumber(timeLeft.days)}
          </div>
          <div
            className="text-sm font-medium"
            style={{ color: themeConfig.colors.textSecondary }}
          >
            Days
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div
            className="text-3xl font-bold"
            style={{ color: themeConfig.colors.primary }}
          >
            {formatNumber(timeLeft.hours)}
          </div>
          <div
            className="text-sm font-medium"
            style={{ color: themeConfig.colors.textSecondary }}
          >
            Hours
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div
            className="text-3xl font-bold"
            style={{ color: themeConfig.colors.primary }}
          >
            {formatNumber(timeLeft.minutes)}
          </div>
          <div
            className="text-sm font-medium"
            style={{ color: themeConfig.colors.textSecondary }}
          >
            Minutes
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div
            className="text-3xl font-bold"
            style={{ color: themeConfig.colors.primary }}
          >
            {formatNumber(timeLeft.seconds)}
          </div>
          <div
            className="text-sm font-medium"
            style={{ color: themeConfig.colors.textSecondary }}
          >
            Seconds
          </div>
        </div>
      </div>
    </div>
  );
}

export { Countdown };
