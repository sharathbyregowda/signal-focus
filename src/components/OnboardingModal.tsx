import React, { useState } from 'react';
import './OnboardingModal.css';

interface OnboardingModalProps {
    onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            icon: '🎯',
            title: 'Signal vs. Noise',
            text: 'In a world of distractions, focus is your superpower. This app helps you separate the signal from the noise.',
            subtext: 'No clutter. No endless lists. Just focus.',
        },
        {
            icon: '📏',
            title: 'The Rules',
            text: '1. Choose 3-5 mission-critical tasks daily.\n2. Your countdown timer keeps you focused.\n3. Customize your schedule in Settings.',
            subtext: 'Constraints breed creativity and focus.',
        },
        {
            icon: '🔒',
            title: 'Privacy First',
            text: 'Your data stays on your device. No accounts, no tracking.\nNeed to switch devices? Use Import/Export in Settings.',
            subtext: 'Your data, your control.',
        },
        {
            icon: '🚀',
            title: 'Ready to Start?',
            text: 'Add your first task to begin your session. Unlock Focus Mode by adding 3 tasks.',
            subtext: 'Let\'s make today count.',
        },
    ];

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-container">
                <div className="onboarding-content">
                    <div className="onboarding-icon">{slides[currentSlide].icon}</div>
                    <h2 className="onboarding-title">{slides[currentSlide].title}</h2>
                    <p className="onboarding-text">
                        {slides[currentSlide].text.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                                {line}
                                {i < slides[currentSlide].text.split('\n').length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </p>
                    <p className="onboarding-subtext">{slides[currentSlide].subtext}</p>
                </div>

                <div className="onboarding-actions">
                    <div className="onboarding-dots">
                        {slides.map((_, index) => (
                            <div
                                key={index}
                                className={`onboarding-dot ${index === currentSlide ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                    <button onClick={handleNext} className="btn btn-primary onboarding-btn">
                        {currentSlide === slides.length - 1 ? "Let's Start" : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};
