import { useState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

/**
 * GrammarInput - Smart text input/textarea with grammar checking
 * Simple client-side grammar validation with common error detection
 */
function GrammarInput({
    value = "",
    onChange,
    placeholder = "Type your message...",
    multiline = true,
    rows = 5,
    label = "",
    name = "",
    required = false,
    className = ""
}) {
    const [errors, setErrors] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const textRef = useRef(null);

    // Simple grammar rules (client-side)
    const grammarRules = [
        {
            pattern: /\bi\s/gi,
            message: "'i' should be capitalized as 'I'",
            suggestion: (text) => text.replace(/\bi\s/g, "I ")
        },
        {
            pattern: /\s{2,}/g,
            message: "Multiple spaces detected",
            suggestion: (text) => text.replace(/\s{2,}/g, " ")
        },
        {
            pattern: /[.!?]\s*[a-z]/g,
            message: "Sentence should start with a capital letter",
            suggestion: (text) => text.replace(/([.!?]\s*)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
        },
        {
            pattern: /\b(recieve|occured|seperete|definately|wierd)\b/gi,
            message: "Possible spelling error detected",
            suggestion: (text) => text
                .replace(/recieve/gi, "receive")
                .replace(/occured/gi, "occurred")
                .replace(/seperete/gi, "separate")
                .replace(/definately/gi, "definitely")
                .replace(/wierd/gi, "weird")
        }
    ];

    // Check grammar on text change
    useEffect(() => {
        const foundErrors = [];
        grammarRules.forEach((rule) => {
            if (rule.pattern.test(value)) {
                foundErrors.push(rule);
            }
        });
        setErrors(foundErrors);
    }, [value]);

    const handleChange = (e) => {
        onChange(e.target.value);
    };

    const applyAllSuggestions = () => {
        let correctedText = value;
        errors.forEach((error) => {
            correctedText = error.suggestion(correctedText);
        });
        onChange(correctedText);
        setShowSuggestions(false);
    };

    const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
    const charCount = value.length;

    const InputElement = multiline ? "textarea" : "input";

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <InputElement
                    ref={textRef}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    rows={multiline ? rows : undefined}
                    required={required}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.length > 0
                            ? "border-yellow-300 focus:border-yellow-400 focus:ring-yellow-200"
                            : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-200"
                        } ${multiline ? "resize-y min-h-[120px]" : ""}`}
                />

                {/* Error/Success Indicator */}
                <div className="absolute top-3 right-3">
                    {errors.length > 0 ? (
                        <AlertCircle className="text-yellow-500" size={20} />
                    ) : value.length > 0 ? (
                        <CheckCircle className="text-green-500" size={20} />
                    ) : null}
                </div>
            </div>

            {/* Grammar Suggestions */}
            {errors.length > 0 && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="text-yellow-600" size={16} />
                            <p className="text-sm font-semibold text-yellow-800">
                                {errors.length} suggestion{errors.length > 1 ? "s" : ""} found
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={applyAllSuggestions}
                            className="px-3 py-1 text-xs font-semibold bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                        >
                            Fix All
                        </button>
                    </div>
                    <ul className="text-xs text-yellow-700 space-y-1">
                        {errors.slice(0, 3).map((error, idx) => (
                            <li key={idx}>• {error.message}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Word and Character Count */}
            <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{wordCount} word{wordCount !== 1 ? "s" : ""}</span>
                <span>{charCount} character{charCount !== 1 ? "s" : ""}</span>
            </div>
        </div>
    );
}

export default GrammarInput;
