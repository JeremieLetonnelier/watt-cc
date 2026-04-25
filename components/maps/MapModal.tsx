'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import StravaWidget from '@/components/sorties/StravaWidget';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeId: string;
  title: string;
  groupLabel: string;
  groupColor: string;
}

export default function MapModal({
  isOpen,
  onClose,
  routeId,
  title,
  groupLabel,
  groupColor,
}: MapModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95%] max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl"
          >
            <div className="relative">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 p-2 bg-black/50 hover:bg-white/10 text-white rounded-full backdrop-blur-md transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
              <StravaWidget
                routeId={routeId}
                title={title}
                groupLabel={groupLabel}
                groupColor={groupColor}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
