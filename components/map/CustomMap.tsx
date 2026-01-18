'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Building2, MapPin } from 'lucide-react';

// MKCG Medical College & Hospital coordinates (Berhampur, Odisha)
const HOSPITAL_COORDS = { x: 50, y: 50 };

// Ambulance starting positions (will move toward hospital)
const INITIAL_AMBULANCES = [
  { id: 1, x: 80, y: 20, label: 'Ambulance 1' },
  { id: 2, x: 20, y: 80, label: 'Ambulance 2' },
  { id: 3, x: 90, y: 70, label: 'Ambulance 3' },
];

interface CustomMapProps {
  center?: { x: number; y: number };
  showHospital?: boolean;
  showAmbulances?: boolean;
}

export function CustomMap({ 
  center = HOSPITAL_COORDS, 
  showHospital = true,
  showAmbulances = true 
}: CustomMapProps) {
  const [ambulances, setAmbulances] = useState(INITIAL_AMBULANCES);

  // Animate ambulances toward hospital
  useEffect(() => {
    if (!showAmbulances) return;

    const interval = setInterval(() => {
      setAmbulances((prev) =>
        prev.map((amb) => {
          const dx = HOSPITAL_COORDS.x - amb.x;
          const dy = HOSPITAL_COORDS.y - amb.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Move 0.5 units per frame toward hospital
          if (distance > 1) {
            const step = 0.5;
            return {
              ...amb,
              x: amb.x + (dx / distance) * step,
              y: amb.y + (dy / distance) * step,
            };
          }

          // Reset to starting position when reaching hospital
          const initial = INITIAL_AMBULANCES.find((a) => a.id === amb.id);
          return initial || amb;
        })
      );
    }, 50); // Update every 50ms

    return () => clearInterval(interval);
  }, [showAmbulances]);

  return (
    <Card className="w-full h-[500px] relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Background streets/roads */}
        <g stroke="#cbd5e1" strokeWidth="0.5" fill="none" opacity="0.5">
          <line x1="0" y1="25" x2="100" y2="25" />
          <line x1="0" y1="50" x2="100" y2="50" />
          <line x1="0" y1="75" x2="100" y2="75" />
          <line x1="25" y1="0" x2="25" y2="100" />
          <line x1="50" y1="0" x2="50" y2="100" />
          <line x1="75" y1="0" x2="75" y2="100" />
        </g>

        {/* Hospital Marker */}
        {showHospital && (
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <circle
              cx={HOSPITAL_COORDS.x}
              cy={HOSPITAL_COORDS.y}
              r="4"
              fill="#ef4444"
              opacity="0.8"
            />
            <circle
              cx={HOSPITAL_COORDS.x}
              cy={HOSPITAL_COORDS.y}
              r="6"
              fill="#ef4444"
              opacity="0.3"
            />
            <foreignObject
              x={HOSPITAL_COORDS.x - 12}
              y={HOSPITAL_COORDS.y - 18}
              width="24"
              height="12"
            >
              <div className="flex items-center justify-center bg-white rounded px-1 py-0.5 shadow-sm">
                <Building2 className="w-3 h-3 text-red-600" />
              </div>
            </foreignObject>
            <text
              x={HOSPITAL_COORDS.x}
              y={HOSPITAL_COORDS.y + 12}
              textAnchor="middle"
              fontSize="2"
              fill="#ef4444"
              fontWeight="bold"
            >
              MKCG Hospital
            </text>
          </motion.g>
        )}

        {/* Animated Ambulance Icons */}
        {showAmbulances &&
          ambulances.map((amb) => (
            <motion.g
              key={amb.id}
              animate={{
                x: amb.x,
                y: amb.y,
              }}
              transition={{
                type: 'linear',
                duration: 0.05,
              }}
            >
              {/* Ambulance body */}
              <rect
                x={amb.x - 1.5}
                y={amb.y - 1}
                width="3"
                height="2"
                fill="#fff"
                stroke="#dc2626"
                strokeWidth="0.2"
                rx="0.3"
              />
              {/* Cross symbol */}
              <line
                x1={amb.x - 0.8}
                y1={amb.y}
                x2={amb.x + 0.8}
                y2={amb.y}
                stroke="#dc2626"
                strokeWidth="0.3"
              />
              <line
                x1={amb.x}
                y1={amb.y - 0.5}
                x2={amb.x}
                y2={amb.y + 0.5}
                stroke="#dc2626"
                strokeWidth="0.3"
              />
              {/* Label */}
              <text
                x={amb.x}
                y={amb.y + 3.5}
                textAnchor="middle"
                fontSize="1.5"
                fill="#1e293b"
                fontWeight="600"
              >
                {amb.label}
              </text>
            </motion.g>
          ))}
      </svg>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-xs">MKCG Medical College & Hospital</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-2 bg-white border border-red-600 rounded"></div>
            <span className="text-xs">Active Ambulances</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span className="text-xs">Berhampur, Odisha</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
