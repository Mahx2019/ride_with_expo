// /path/to/AccelerometerDataContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { Accelerometer, AccelerometerData } from "expo-sensors";

interface AccelerometerDataContextType {
  data: number[];
}

const AccelerometerDataContext = createContext<AccelerometerDataContextType>({
  data: [],
});

export const useAccelerometerData = () => useContext(AccelerometerDataContext);

export const AccelerometerDataProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<number[]>([]);

  useEffect(() => {
    Accelerometer.setUpdateInterval(1000);

    const subscription = Accelerometer.addListener(
      (accelerometerData: AccelerometerData) => {
        const { x, y, z } = accelerometerData;
        const newData = Math.sqrt(x * x + y * y + z * z);
        setData((currentData) => [...currentData, newData]);
      }
    );

    return () => subscription.remove();
  }, []);

  return (
    <AccelerometerDataContext.Provider value={{ data }}>
      {children}
    </AccelerometerDataContext.Provider>
  );
};
