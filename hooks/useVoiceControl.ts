
import { useState, useEffect, useRef } from 'react';

interface VoiceControlOptions {
    onNext: () => void;
    onBack: () => void;
    onIngredients: () => void;
}

export const useVoiceControl = ({ onNext, onBack, onIngredients }: VoiceControlOptions) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Check browser support
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const lastResult = event.results[event.results.length - 1];
                const text = lastResult[0].transcript.trim().toLowerCase();
                setTranscript(text);

                if (text.includes('next') || text.includes('forward') || text.includes('done')) {
                    onNext();
                } else if (text.includes('back') || text.includes('previous')) {
                    onBack();
                } else if (text.includes('ingredient') || text.includes('show')) {
                    onIngredients();
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                if (event.error === 'not-allowed') {
                    setIsListening(false);
                }
            };

            recognitionRef.current.onend = () => {
                // Auto-restart if it stops but we want it listening (unless stopped manually)
                if (isListening) {
                    try {
                        recognitionRef.current.start();
                    } catch (e) {
                        // ignore
                    }
                }
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [isListening, onNext, onBack, onIngredients]);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Voice control is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error("Failed to start speech recognition", e);
            }
        }
    };

    return { isListening, toggleListening, transcript };
};
