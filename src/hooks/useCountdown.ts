
import { useState, useEffect, useRef } from 'react';

export const useCountdown = (startDate: string, startTime: string = "") => {
  const [countdown, setCountdown] = useState<string>('Calculando...');
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    if (!startDate) {
      setCountdown('Data de início não definida.');
      return;
    }

    const timeStr = startTime && startTime.trim() !== "" ? startTime : "00:00";
    const startDateTimeString = `${startDate}T${timeStr}`;
    
    console.log('Creating date from:', startDateTimeString);
    const relationshipStartDate = new Date(startDateTimeString);

    if (isNaN(relationshipStartDate.getTime())) {
      console.error('Invalid date created from:', startDateTimeString);
      setCountdown('Data inválida.');
      return;
    }

    countdownIntervalRef.current = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - relationshipStartDate.getTime();

      if (diff < 0) {
        setCountdown('Contagem regressiva para o grande dia!');
        return;
      }

      let years = now.getFullYear() - relationshipStartDate.getFullYear();
      let months = now.getMonth() - relationshipStartDate.getMonth();
      let days = now.getDate() - relationshipStartDate.getDate();
      let hours = now.getHours() - relationshipStartDate.getHours();
      let minutes = now.getMinutes() - relationshipStartDate.getMinutes();
      let seconds = now.getSeconds() - relationshipStartDate.getSeconds();

      if (seconds < 0) { seconds += 60; minutes--; }
      if (minutes < 0) { minutes += 60; hours--; }
      if (hours < 0) { hours += 24; days--; }
      if (days < 0) {
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
        months--;
      }
      if (months < 0) { months += 12; years--; }
      
      years = Math.max(0, years);

      const timeParts = [];
      
      if (years > 0) {
        timeParts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
      }
      
      if (months > 0) {
        timeParts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
      }
      
      if (days > 0) {
        timeParts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);
      }

      const timeString = timeParts.join(', ');
      const detailString = `${hours} horas, ${minutes} minutos e ${seconds} segundos`;

      setCountdown(`${timeString}<br>${detailString}`);
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [startDate, startTime]);

  return countdown;
};
