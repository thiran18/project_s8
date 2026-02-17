import React from 'react'
import { Info, Volume2, Smartphone, ShieldCheck } from 'lucide-react'

export default function CalibrationGuide({ onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-blue-600 p-6 text-white">
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
                        <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                            <Volume2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Set Volume to Max</h3>
                            <p className="text-sm text-gray-500">
                                Turn your device volume to **100%**. The app's internal dB levels are calibrated relative to maximum system output.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Use Standard Headphones</h3>
                            <p className="text-sm text-gray-500">
                                Over-ear headphones provide better isolation than earbuds. Ensure they are plugged in firmly.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600">
                            <Info className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Find a Quiet Room</h3>
                            <p className="text-sm text-gray-500">
                                Background noise will affect the results. Ensure the room is as silent as possible (&lt; 30dBA).
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    )
}
