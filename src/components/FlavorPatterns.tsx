import type { PatternType, PatternColors } from '../data/menu';

interface FlavorPatternsProps {
    id: string;
}

export function FlavorPatterns({ id }: FlavorPatternsProps) {
    return (
        <defs>
            {/* Pepperoni - Red circles for calabresa */}
            <pattern id={`${id}-pepperoni`} patternUnits="userSpaceOnUse" width="30" height="30">
                <circle cx="10" cy="10" r="8" fill="currentColor" />
                <circle cx="25" cy="25" r="6" fill="currentColor" opacity="0.8" />
            </pattern>

            {/* Chicken - Cream strips for frango */}
            <pattern id={`${id}-chicken`} patternUnits="userSpaceOnUse" width="20" height="20">
                <rect x="2" y="4" width="16" height="5" rx="2" fill="currentColor" />
                <rect x="5" y="13" width="12" height="4" rx="2" fill="currentColor" opacity="0.7" />
            </pattern>

            {/* Cheese - Yellow blobs */}
            <pattern id={`${id}-cheese`} patternUnits="userSpaceOnUse" width="40" height="40">
                <ellipse cx="10" cy="15" rx="8" ry="6" fill="currentColor" />
                <ellipse cx="30" cy="10" rx="6" ry="5" fill="currentColor" opacity="0.8" />
                <ellipse cx="25" cy="30" rx="10" ry="7" fill="currentColor" opacity="0.6" />
            </pattern>

            {/* Ham - Pink squares */}
            <pattern id={`${id}-ham`} patternUnits="userSpaceOnUse" width="25" height="25">
                <rect x="3" y="3" width="10" height="10" rx="2" fill="currentColor" />
                <rect x="15" y="15" width="8" height="8" rx="2" fill="currentColor" opacity="0.7" />
            </pattern>

            {/* Tuna - Gray strips */}
            <pattern id={`${id}-tuna`} patternUnits="userSpaceOnUse" width="24" height="16">
                <ellipse cx="12" cy="8" rx="10" ry="4" fill="currentColor" />
            </pattern>

            {/* Corn - Yellow dots */}
            <pattern id={`${id}-corn`} patternUnits="userSpaceOnUse" width="18" height="18">
                <circle cx="5" cy="5" r="3" fill="currentColor" />
                <circle cx="13" cy="5" r="2.5" fill="currentColor" />
                <circle cx="5" cy="13" r="2.5" fill="currentColor" />
                <circle cx="13" cy="13" r="3" fill="currentColor" />
                <circle cx="9" cy="9" r="2" fill="currentColor" opacity="0.8" />
            </pattern>

            {/* Basil - Green leaves + red circles */}
            <pattern id={`${id}-basil`} patternUnits="userSpaceOnUse" width="35" height="35">
                <ellipse cx="12" cy="10" rx="8" ry="5" fill="currentColor" transform="rotate(-30 12 10)" />
                <ellipse cx="28" cy="25" rx="6" ry="4" fill="currentColor" transform="rotate(20 28 25)" />
                <circle cx="8" cy="28" r="4" fill="currentColor" opacity="0.6" />
            </pattern>

            {/* Vegetables - Mixed colorful shapes */}
            <pattern id={`${id}-vegetables`} patternUnits="userSpaceOnUse" width="40" height="40">
                <rect x="5" y="5" width="8" height="8" rx="2" fill="currentColor" />
                <circle cx="25" cy="10" r="5" fill="currentColor" opacity="0.7" />
                <ellipse cx="15" cy="28" rx="6" ry="4" fill="currentColor" opacity="0.8" />
                <rect x="28" y="25" width="6" height="10" rx="2" fill="currentColor" opacity="0.6" />
            </pattern>

            {/* Shrimp - Pink crescents */}
            <pattern id={`${id}-shrimp`} patternUnits="userSpaceOnUse" width="30" height="30">
                <path d="M 8 8 Q 15 5, 18 12 Q 20 18, 15 20 Q 10 22, 8 15 Q 6 10, 8 8" fill="currentColor" />
                <path d="M 22 22 Q 28 20, 28 26 Q 28 30, 24 28 Q 20 26, 22 22" fill="currentColor" opacity="0.7" />
            </pattern>

            {/* Meat - Brown strips */}
            <pattern id={`${id}-meat`} patternUnits="userSpaceOnUse" width="28" height="20">
                <rect x="2" y="5" width="24" height="6" rx="3" fill="currentColor" />
                <rect x="6" y="14" width="16" height="4" rx="2" fill="currentColor" opacity="0.7" />
            </pattern>

            {/* Bacon - Dark brown strips */}
            <pattern id={`${id}-bacon`} patternUnits="userSpaceOnUse" width="32" height="16">
                <path d="M 2 4 Q 8 2, 16 6 Q 24 10, 30 8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M 4 12 Q 12 14, 20 10 Q 28 6, 30 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
            </pattern>

            {/* Palmito - White strips */}
            <pattern id={`${id}-palmito`} patternUnits="userSpaceOnUse" width="24" height="24">
                <rect x="4" y="2" width="6" height="20" rx="3" fill="currentColor" />
                <rect x="14" y="4" width="5" height="16" rx="2" fill="currentColor" opacity="0.7" />
            </pattern>

            {/* Chocolate - Brown drizzle */}
            <pattern id={`${id}-chocolate`} patternUnits="userSpaceOnUse" width="40" height="40">
                <path d="M 5 10 Q 15 5, 25 15 Q 35 25, 20 35" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M 30 5 Q 40 15, 35 30" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
                <circle cx="10" cy="30" r="4" fill="currentColor" opacity="0.5" />
            </pattern>

            {/* Dulce - Caramel swirl */}
            <pattern id={`${id}-dulce`} patternUnits="userSpaceOnUse" width="36" height="36">
                <path d="M 18 8 Q 28 12, 28 22 Q 28 32, 18 28 Q 8 24, 12 14 Q 14 10, 18 8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                <circle cx="8" cy="28" r="3" fill="currentColor" opacity="0.6" />
            </pattern>

            {/* Guava - Pink blobs */}
            <pattern id={`${id}-guava`} patternUnits="userSpaceOnUse" width="32" height="32">
                <ellipse cx="10" cy="12" rx="8" ry="6" fill="currentColor" />
                <ellipse cx="24" cy="8" rx="6" ry="5" fill="currentColor" opacity="0.8" />
                <ellipse cx="18" cy="26" rx="10" ry="5" fill="currentColor" opacity="0.6" />
            </pattern>

            {/* Coconut - White flakes */}
            <pattern id={`${id}-coconut`} patternUnits="userSpaceOnUse" width="28" height="28">
                <ellipse cx="8" cy="6" rx="5" ry="2" fill="currentColor" transform="rotate(15 8 6)" />
                <ellipse cx="20" cy="10" rx="4" ry="1.5" fill="currentColor" transform="rotate(-20 20 10)" />
                <ellipse cx="6" cy="18" rx="4" ry="2" fill="currentColor" transform="rotate(40 6 18)" />
                <ellipse cx="22" cy="22" rx="5" ry="2" fill="currentColor" transform="rotate(-10 22 22)" />
                <ellipse cx="14" cy="14" rx="3" ry="1.5" fill="currentColor" transform="rotate(30 14 14)" opacity="0.7" />
            </pattern>
        </defs>
    );
}

// Helper to get pattern URL
export function getPatternUrl(id: string, pattern: PatternType): string {
    return `url(#${id}-${pattern})`;
}

// Helper to get pattern style
export function getPatternStyle(colors: PatternColors): React.CSSProperties {
    return { color: colors.primary };
}
