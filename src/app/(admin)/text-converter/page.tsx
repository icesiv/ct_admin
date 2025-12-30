"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Mic,
    MicOff,
    ArrowDownUp,
    Copy,
    Trash2,
    CheckCheck,
    Keyboard
} from "lucide-react";
import { convertToBijoy, convertToUnicode } from "@/lib/bijoyConversion";
import { getWordCount, getCharCount } from "@/lib/textUtils"; // Reusing these if they exist, or I can inline them. Assuming I need to calculate all 4.

// Define SpeechRecognition types since they're not in standard lib yet
interface IWindow extends Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
}

export default function TextConverterPage() {
    const [unicodeText, setUnicodeText] = useState("");
    const [bijoyText, setBijoyText] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [copiedUnicode, setCopiedUnicode] = useState(false);
    const [copiedBijoy, setCopiedBijoy] = useState(false);

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Initialize Speech Recognition
        const windowObj = window as unknown as IWindow;
        const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'bn-BD'; // Bengali (Bangladesh)

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setUnicodeText(prev => {
                        const newText = prev + " " + finalTranscript;
                        localStorage.setItem("unicodeText", newText);
                        return newText;
                    });
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                // If meant to be continuous, could restart here, but manual toggle is safer for UX
                if (isListening) {
                    // recognition.start(); // Auto-restart if needed
                } else {
                    setIsListening(false);
                }
            };

            recognitionRef.current = recognition;
        }
    }, [isListening]);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Your browser does not support Voice Typing. Please use Chrome or Edge.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    useEffect(() => {
        const storedUnicode = localStorage.getItem("unicodeText");
        const storedBijoy = localStorage.getItem("bijoyText");
        if (storedUnicode) setUnicodeText(storedUnicode);
        if (storedBijoy) setBijoyText(storedBijoy);
    }, []);

    const handleUnicodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setUnicodeText(newValue);
        localStorage.setItem("unicodeText", newValue);
    };

    const handleBijoyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setBijoyText(newValue);
        localStorage.setItem("bijoyText", newValue);
    };

    const handleConvertToBijoy = () => {
        const result = convertToBijoy(unicodeText);
        setBijoyText(result);
        localStorage.setItem("bijoyText", result);
    };

    const handleConvertToUnicode = () => {
        const result = convertToUnicode(bijoyText);
        setUnicodeText(result);
        localStorage.setItem("unicodeText", result);
    };

    const copyToClipboard = async (text: string, setCopied: (val: boolean) => void) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    const clearAll = () => {
        setUnicodeText("");
        setBijoyText("");
        localStorage.removeItem("unicodeText");
        localStorage.removeItem("bijoyText");
    };

    const stats = {
        characters: unicodeText.length,
        words: unicodeText.trim().split(/\s+/).filter(Boolean).length,
        sentences: unicodeText.split(/[.!?।]+/).filter(Boolean).length, // Added '।' for Bengali support
        paragraphs: unicodeText.split(/\n+/).filter(Boolean).length
    };

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">
                        Unicode to Bijoy Converter
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Type with your voice or convert text instantly.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                    {/* Left: Unicode Input */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                <Keyboard size={18} /> Unicode Keyboard (Unibijoy/Avro)
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={toggleListening}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isListening
                                        ? "bg-red-100 text-red-600 animate-pulse border border-red-200"
                                        : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                                    {isListening ? "Listening..." : "Voice Type"}
                                </button>
                            </div>
                        </div>
                        <div className="relative group">
                            <textarea
                                value={unicodeText}
                                onChange={handleUnicodeChange}
                                placeholder="ekhane likhun..."
                                className="w-full h-80 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all resize-none shadow-sm text-lg"
                            />
                            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ActionIcon
                                    onClick={() => copyToClipboard(unicodeText, setCopiedUnicode)}
                                    icon={copiedUnicode ? <CheckCheck size={16} /> : <Copy size={16} />}
                                    title="Copy Unicode"
                                />
                                <ActionIcon
                                    onClick={() => setUnicodeText("")}
                                    icon={<Trash2 size={16} />}
                                    title="Clear"
                                    variant="danger"
                                />
                            </div>
                        </div>

                        {/* Stats Panel */}
                        <div className="grid grid-cols-4 gap-2 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <StatItem label="Characters" value={stats.characters} />
                            <StatItem label="Words" value={stats.words} />
                            <StatItem label="Sentences" value={stats.sentences} />
                            <StatItem label="Paragraphs" value={stats.paragraphs} />
                        </div>
                    </div>

                    {/* Middle Controls (Desktop: Center integration, Mobile: Stacked) */}
                    {/* Ideally this would be between them, but in grid logic it's hard. We'll put buttons below inputs or float them.
                Actually, the requirement said "Multiple conversion buttons". Let's put a control bar BETWEEN the grids if possible, 
                or just have buttons. Let's make a centered column for buttons on large screens? 
                Or just place action buttons clearly.
            */}

                    {/* Right: Bijoy Output */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                <Keyboard size={18} /> Bijoy Keyboard (SutonnyMJ)
                            </label>
                        </div>
                        <div className="relative group">
                            <textarea
                                value={bijoyText}
                                onChange={handleBijoyChange}
                                placeholder="Bijoy output here..."
                                className="w-full h-80 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none shadow-sm text-lg font-bijoy"
                                style={{ fontFamily: '"SutonnyMJ", "SutonnyOMJ", "SolaimanLipi", sans-serif' }}
                            />
                            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ActionIcon
                                    onClick={() => copyToClipboard(bijoyText, setCopiedBijoy)}
                                    icon={copiedBijoy ? <CheckCheck size={16} /> : <Copy size={16} />}
                                    title="Copy Bijoy"
                                />
                                <ActionIcon
                                    onClick={() => setBijoyText("")}
                                    icon={<Trash2 size={16} />}
                                    title="Clear"
                                    variant="danger"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Central Action Bar */}
                <div className="flex flex-wrap justify-center gap-4 py-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm shadow-sm p-6">
                    <button
                        onClick={handleConvertToBijoy}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all font-semibold"
                    >
                        <span>Unicode to Bijoy</span>
                        <ArrowDownUp className="rotate-90" size={18} />
                    </button>

                    <button
                        onClick={handleConvertToUnicode}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all font-semibold"
                    >
                        <ArrowDownUp className="-rotate-90" size={18} />
                        <span>Bijoy to Unicode</span>
                    </button>

                    <button
                        onClick={clearAll}
                        className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 rounded-xl hover:shadow-md transition-all font-medium"
                    >
                        <Trash2 size={18} />
                        <span>Clear All</span>
                    </button>
                </div>

                <div className="text-center">
                    <p className="text-xs text-gray-400">
                        Ensure you have a Bijoy compliant font (like SutonnyMJ) installed to view the output correctly.
                    </p>
                </div>

            </div>
        </div>
    );
}

function ActionIcon({ onClick, icon, title, variant = 'default' }: any) {
    const baseClass = "p-2 rounded-lg transition-colors shadow-sm border";
    const variants = {
        default: "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:border-gray-500",
        danger: "bg-white text-red-500 border-gray-200 hover:bg-red-50 hover:border-red-200 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-red-900/30"
    };

    return (
        <button onClick={onClick} title={title} className={`${baseClass} ${variants[variant as keyof typeof variants]}`}>
            {icon}
        </button>
    );
}

function StatItem({ label, value }: { label: string, value: number }) {
    return (
        <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</div>
        </div>
    );
}
