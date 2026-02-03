import React, { useState, useEffect } from 'react';

const WelcomeModal = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already seen the modal in this session
        const hasSeenModal = sessionStorage.getItem('hasSeenWelcomeModal');
        if (!hasSeenModal) {
            setIsVisible(true);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Remember that the user has seen the modal for this session
        sessionStorage.setItem('hasSeenWelcomeModal', 'true');
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-center shadow-2xl transition-all duration-300 border border-gray-700/50">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                    aria-label="Close"
                >
                    {/* Simple SVG for close icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Content */}
                <div className="mt-2">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                        Welcome to Quickflow
                    </h2>

                    <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                        Streamlining team workflows through structured task management. <br />
                        Analyze, optimize, and grow with data-driven insights.
                    </p>

                    <div className="border-t border-gray-700/50 pt-6 mt-6">
                        <p className="text-sm font-medium text-blue-300 tracking-wider uppercase">
                            ✨ Innovate. Automate. Succeed. ✨
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;
