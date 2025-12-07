import React, { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

// -----------------------------------------------------------------------------
// Noise Texture for Apple-style glass effect
// -----------------------------------------------------------------------------
export const NOISE_DATA_URI = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;

// -----------------------------------------------------------------------------
// Noise Overlay Component
// -----------------------------------------------------------------------------
export const NoiseOverlay: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div
        className={`absolute inset-0 z-0 opacity-[0.03] pointer-events-none ${className}`}
        style={{ backgroundImage: `url("${NOISE_DATA_URI}")` }}
    />
);

// -----------------------------------------------------------------------------
// GlassButton
// -----------------------------------------------------------------------------
type ButtonVariant = 'default' | 'primary' | 'success' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
    children,
    variant = 'default',
    size = 'md',
    loading = false,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = "relative group overflow-hidden backdrop-blur-xl transition-all duration-300 active:scale-[0.98] border font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100";

    const sizeStyles = {
        sm: "px-4 py-1.5 text-xs rounded-full",
        md: "px-6 py-2.5 text-sm rounded-full",
        lg: "px-8 py-3 text-base rounded-full",
        icon: "w-10 h-10 flex items-center justify-center rounded-xl",
    };

    const variantStyles = {
        default: `
            bg-white/10 border-white/20 text-white
            shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),0_4px_20px_rgba(0,0,0,0.3)]
            hover:bg-white/15 hover:border-white/30
            hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2),0_8px_30px_rgba(0,0,0,0.4)]
            hover:-translate-y-0.5
        `,
        primary: `
            bg-blue-500/30 border-blue-400/30 text-white
            shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2),0_4px_25px_rgba(59,130,246,0.25)]
            hover:bg-blue-500/40 hover:border-blue-400/50
            hover:shadow-[inset_0_0_0_1px_rgba(59,130,246,0.4),0_8px_40px_rgba(59,130,246,0.35)]
            hover:-translate-y-0.5
        `,
        success: `
            bg-emerald-500/30 border-emerald-400/30 text-white
            shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2),0_4px_25px_rgba(16,185,129,0.25)]
            hover:bg-emerald-500/40 hover:border-emerald-400/50
            hover:shadow-[inset_0_0_0_1px_rgba(16,185,129,0.4),0_8px_40px_rgba(16,185,129,0.35)]
            hover:-translate-y-0.5
        `,
        danger: `
            bg-red-500/30 border-red-400/30 text-white
            shadow-[inset_0_0_0_1px_rgba(239,68,68,0.2),0_4px_25px_rgba(239,68,68,0.25)]
            hover:bg-red-500/40 hover:border-red-400/50
            hover:shadow-[inset_0_0_0_1px_rgba(239,68,68,0.4),0_8px_40px_rgba(239,68,68,0.35)]
            hover:-translate-y-0.5
        `,
        ghost: `
            bg-transparent border-transparent text-white/70
            hover:bg-white/10 hover:text-white
            hover:-translate-y-0.5
        `,
    };

    return (
        <button
            className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            <NoiseOverlay />
            <span className="relative z-10 flex items-center gap-2 justify-center">
                {loading ? (
                    <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Loading...</span>
                    </>
                ) : children}
            </span>
        </button>
    );
};

// -----------------------------------------------------------------------------
// GlassCard
// -----------------------------------------------------------------------------
interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    glow?: 'none' | 'subtle' | 'blue' | 'purple';
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    hover = false,
    glow = 'subtle',
}) => {
    const glowStyles = {
        none: '',
        subtle: 'shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
        blue: 'shadow-[0_8px_32px_rgba(59,130,246,0.15)]',
        purple: 'shadow-[0_8px_32px_rgba(139,92,246,0.15)]',
    };

    return (
        <div
            className={`
                relative overflow-hidden
                bg-white/[0.08] backdrop-blur-2xl
                border border-white/[0.15]
                rounded-2xl
                ${glowStyles[glow]}
                ${hover ? 'transition-all duration-300 hover:bg-white/[0.12] hover:border-white/[0.25] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)]' : ''}
                ${className}
            `}
        >
            <NoiseOverlay />
            <div className="relative z-10">{children}</div>
        </div>
    );
};

// -----------------------------------------------------------------------------
// GlassInput
// -----------------------------------------------------------------------------
interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: ReactNode;
}

export const GlassInput: React.FC<GlassInputProps> = ({
    label,
    error,
    icon,
    className = '',
    id,
    ...props
}) => {
    return (
        <div className="mb-4">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-white/70 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                        {icon}
                    </div>
                )}
                <input
                    id={id}
                    className={`
                        w-full py-3 px-4 ${icon ? 'pl-12' : ''}
                        bg-white/[0.08] backdrop-blur-xl
                        border ${error ? 'border-red-400/50' : 'border-white/[0.15]'}
                        rounded-xl
                        text-white placeholder-white/40
                        focus:outline-none focus:border-white/30 focus:bg-white/[0.12]
                        focus:ring-2 focus:ring-white/10
                        transition-all duration-300
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
        </div>
    );
};

// -----------------------------------------------------------------------------
// GlassTextarea
// -----------------------------------------------------------------------------
interface GlassTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const GlassTextarea: React.FC<GlassTextareaProps> = ({
    label,
    error,
    className = '',
    id,
    rows = 3,
    ...props
}) => {
    return (
        <div className="mb-4">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-white/70 mb-2">
                    {label}
                </label>
            )}
            <textarea
                id={id}
                rows={rows}
                className={`
                    w-full py-3 px-4
                    bg-white/[0.08] backdrop-blur-xl
                    border ${error ? 'border-red-400/50' : 'border-white/[0.15]'}
                    rounded-xl
                    text-white placeholder-white/40
                    focus:outline-none focus:border-white/30 focus:bg-white/[0.12]
                    focus:ring-2 focus:ring-white/10
                    transition-all duration-300
                    resize-none
                    ${className}
                `}
                {...props}
            />
            {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
        </div>
    );
};

// -----------------------------------------------------------------------------
// GlassSelect
// -----------------------------------------------------------------------------
interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const GlassSelect: React.FC<GlassSelectProps> = ({
    label,
    error,
    options,
    className = '',
    id,
    ...props
}) => {
    return (
        <div className="mb-4">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-white/70 mb-2">
                    {label}
                </label>
            )}
            <select
                id={id}
                className={`
                    w-full py-3 px-4
                    bg-white/[0.08] backdrop-blur-xl
                    border ${error ? 'border-red-400/50' : 'border-white/[0.15]'}
                    rounded-xl
                    text-white
                    focus:outline-none focus:border-white/30 focus:bg-white/[0.12]
                    focus:ring-2 focus:ring-white/10
                    transition-all duration-300
                    appearance-none
                    cursor-pointer
                    ${className}
                `}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1rem',
                }}
                {...props}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
        </div>
    );
};

// -----------------------------------------------------------------------------
// GlassCheckbox
// -----------------------------------------------------------------------------
interface GlassCheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    id?: string;
    disabled?: boolean;
}

export const GlassCheckbox: React.FC<GlassCheckboxProps> = ({
    label,
    checked,
    onChange,
    id,
    disabled = false,
}) => {
    return (
        <label className={`flex items-center cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="relative">
                <input
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={(e) => !disabled && onChange(e.target.checked)}
                    className="sr-only"
                    disabled={disabled}
                />
                <div className={`
                    w-5 h-5 rounded-md border transition-all duration-200
                    ${checked
                        ? 'bg-blue-500/50 border-blue-400/50'
                        : 'bg-white/[0.08] border-white/[0.2] group-hover:border-white/[0.3]'
                    }
                `}>
                    {checked && (
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
            </div>
            <span className="ml-3 text-sm text-white/80 group-hover:text-white transition-colors">
                {label}
            </span>
        </label>
    );
};

// -----------------------------------------------------------------------------
// GlassRadio
// -----------------------------------------------------------------------------
interface GlassRadioProps {
    label: string;
    checked: boolean;
    onChange: () => void;
    name: string;
    id?: string;
    disabled?: boolean;
}

export const GlassRadio: React.FC<GlassRadioProps> = ({
    label,
    checked,
    onChange,
    name,
    id,
    disabled = false,
}) => {
    return (
        <label className={`flex items-center cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="relative">
                <input
                    type="radio"
                    id={id}
                    name={name}
                    checked={checked}
                    onChange={() => !disabled && onChange()}
                    className="sr-only"
                    disabled={disabled}
                />
                <div className={`
                    w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                    ${checked
                        ? 'border-blue-400/70 bg-blue-500/30'
                        : 'border-white/[0.25] bg-white/[0.08] group-hover:border-white/[0.4]'
                    }
                `}>
                    {checked && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    )}
                </div>
            </div>
            <span className="ml-3 text-sm text-white/80 group-hover:text-white transition-colors">
                {label}
            </span>
        </label>
    );
};

// -----------------------------------------------------------------------------
// GlassSection (for form sections)
// -----------------------------------------------------------------------------
interface GlassSectionProps {
    title: string;
    children: ReactNode;
    className?: string;
}

export const GlassSection: React.FC<GlassSectionProps> = ({
    title,
    children,
    className = '',
}) => {
    return (
        <GlassCard className={`p-6 mb-6 ${className}`}>
            <h2 className="text-lg font-semibold text-white mb-4 pb-3 border-b border-white/[0.1] flex items-center gap-3">
                <span className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full" />
                {title}
            </h2>
            {children}
        </GlassCard>
    );
};

// -----------------------------------------------------------------------------
// GlassModal
// -----------------------------------------------------------------------------
interface GlassModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const GlassModal: React.FC<GlassModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
}) => {
    if (!isOpen) return null;

    const sizeStyles = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative w-full ${sizeStyles[size]} max-h-[90vh] overflow-hidden`}>
                <GlassCard className="p-0" glow="blue">
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-white/[0.1]">
                        <h2 className="text-xl font-semibold text-white">{title}</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.1] hover:bg-white/[0.2] text-white/60 hover:text-white transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
                        {children}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

// -----------------------------------------------------------------------------
// GlassBadge
// -----------------------------------------------------------------------------
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface GlassBadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
    children,
    variant = 'default',
    className = '',
}) => {
    const variantStyles = {
        default: 'bg-white/[0.15] text-white/90 border-white/[0.2]',
        success: 'bg-emerald-500/30 text-emerald-300 border-emerald-400/30',
        warning: 'bg-amber-500/30 text-amber-300 border-amber-400/30',
        danger: 'bg-red-500/30 text-red-300 border-red-400/30',
        info: 'bg-blue-500/30 text-blue-300 border-blue-400/30',
    };

    return (
        <span className={`
            inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border backdrop-blur-xl
            ${variantStyles[variant]}
            ${className}
        `}>
            {children}
        </span>
    );
};

// -----------------------------------------------------------------------------
// GlassAlert
// -----------------------------------------------------------------------------
interface GlassAlertProps {
    children: ReactNode;
    variant?: 'info' | 'success' | 'warning' | 'error';
    className?: string;
}

export const GlassAlert: React.FC<GlassAlertProps> = ({
    children,
    variant = 'info',
    className = '',
}) => {
    const variants = {
        info: 'bg-blue-500/20 border-blue-400/30 text-blue-200',
        success: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200',
        warning: 'bg-amber-500/20 border-amber-400/30 text-amber-200',
        error: 'bg-red-500/20 border-red-400/30 text-red-200',
    };

    const icons = {
        info: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        success: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        warning: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    return (
        <div className={`
            flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl
            ${variants[variant]}
            ${className}
        `}>
            <span className="flex-shrink-0 mt-0.5">{icons[variant]}</span>
            <div className="flex-1">{children}</div>
        </div>
    );
};

// -----------------------------------------------------------------------------
// Background Component with animated gradients
// -----------------------------------------------------------------------------
export const GlassBackground: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
            {/* Animated gradient orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Noise overlay */}
            <div
                className="fixed inset-0 opacity-[0.015] pointer-events-none z-10"
                style={{ backgroundImage: `url("${NOISE_DATA_URI}")` }}
            />

            {/* Content */}
            <div className="relative z-20">
                {children}
            </div>
        </div>
    );
};
