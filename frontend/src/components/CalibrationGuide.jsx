import React from 'react'
import { Info, Volume2, Smartphone, ShieldCheck } from 'lucide-react'

export default function CalibrationGuide({ onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200 border border-transparent dark:border-slate-800">
                <div className="bg-blue-600 dark:bg-blue-600 p-6 text-white">
                    <h2 className="text-xl font-bold flex items-center">
                        <ShieldCheck className="w-6 h-6 mr-2" />
                        Calibration & Safety
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                        Before starting the screening, please ensure the following:
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg text-blue-600 dark:text-blue-400">
                            <Volume2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Set Volume to Max</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400">
                                Turn your device volume to **100%**. The app's internal dB levels are calibrated relative to maximum system output.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg text-purple-600 dark:text-purple-400">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Use Standard Headphones</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400">
                                Over-ear headphones provide better isolation than earbuds. Ensure they are plugged in firmly.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg text-yellow-600 dark:text-yellow-400">
                            <Info className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Find a Quiet Room</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400">
                                Background noise will affect the results. Ensure the room is as silent as possible (&lt; 30dBA).
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg active:scale-95 transform"
                    >
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    )
}
