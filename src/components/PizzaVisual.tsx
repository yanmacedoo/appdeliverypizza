import type { PatternType, PatternColors } from '../data/menu';

interface FlavorInfo {
    pattern: PatternType;
    colors: PatternColors;
}

interface PizzaVisualProps {
    mode: 'inteira' | 'meia' | 'tercos';
    leftFlavor?: FlavorInfo | null;
    rightFlavor?: FlavorInfo | null;
    thirdFlavor?: FlavorInfo | null;
    activeHalf?: 'left' | 'right' | 'slice1' | 'slice2' | 'slice3' | null;
    size?: number;
}

// Generate positions covering the ENTIRE cheese circle using a grid approach
function generateToppingPositions(count: number, radius: number, center: number, halfSide?: 'left' | 'right' | 'slice1' | 'slice2' | 'slice3') {
    const positions: { x: number; y: number; size: number; rotation: number }[] = [];

    // Use actual radius minus small padding
    const effectiveRadius = radius * 0.92;

    // Generate positions in concentric rings that cover entire area
    const rings = [
        { r: 0, items: 1 },
        { r: 0.25, items: 6 },
        { r: 0.5, items: 10 },
        { r: 0.75, items: 14 },
        { r: 1.0, items: 16 }
    ];

    let idx = 0;
    for (const ring of rings) {
        const ringRadius = effectiveRadius * ring.r;
        const angleStep = 360 / ring.items;
        const startAngle = (idx % 2) * (angleStep / 2); // Offset alternate rings

        for (let i = 0; i < ring.items && positions.length < count; i++) {
            const angle = (startAngle + i * angleStep) * (Math.PI / 180);

            let x = center + ringRadius * Math.cos(angle);
            let y = center + ringRadius * Math.sin(angle);

            // Filtering logic for partial pizzas
            let keep = true;
            if (halfSide === 'left') {
                if (x > center) keep = false;
            } else if (halfSide === 'right') {
                if (x < center) keep = false;
            } else if (halfSide === 'slice1') { // 0-120
                // Handled by clip path, generating full circle is simpler visually, but less optimal. 
                // We will generate full circle and let SVG clipPath handle the cutting.
            }

            if (keep) {
                positions.push({
                    x,
                    y,
                    size: 7 + (idx % 3) * 2,
                    rotation: (i * 45 + idx * 30) % 360
                });
            }
        }
        idx++;
    }

    return positions;
}


// REALISTIC colors based on actual ingredients
const realisticColors: Record<PatternType, { primary: string; secondary: string; stroke: string }> = {
    // Calabresa - burgundy-red sausage with darker spots
    pepperoni: { primary: '#8B2323', secondary: '#CD3333', stroke: '#5C1515' },

    // Frango - cream/beige shredded chicken with catupiry
    chicken: { primary: '#E8D4B8', secondary: '#FFF8E7', stroke: '#C4A77D' },

    // Queijos - various cheese colors (cream, yellow, white)
    cheese: { primary: '#FFF8DC', secondary: '#FFE4B5', stroke: '#D4AA00' },

    // Presunto - salmon pink ham
    ham: { primary: '#F4A4A4', secondary: '#FFCCCC', stroke: '#CC6666' },

    // Atum - gray-brown tuna
    tuna: { primary: '#8B7D6B', secondary: '#A09080', stroke: '#5C5248' },

    // Milho - golden yellow corn kernels
    corn: { primary: '#FFD700', secondary: '#FFF44F', stroke: '#DAA520' },

    // Manjericão - fresh green basil + red tomatoes
    basil: { primary: '#228B22', secondary: '#E53935', stroke: '#145214' },

    // Portuguesa - mix (ham pink, olive black, egg yellow, vegetables)
    vegetables: { primary: '#F4A4A4', secondary: '#2D2D2D', stroke: '#CC6666' },

    // Camarão - coral pink shrimp
    shrimp: { primary: '#FA8072', secondary: '#FFA07A', stroke: '#E9573F' },

    // Carne seca - dark brown dried meat
    meat: { primary: '#5D3A1A', secondary: '#8B5A2B', stroke: '#3D2512' },

    // Bacon - reddish-brown with fat stripes
    bacon: { primary: '#8B0000', secondary: '#FFC0CB', stroke: '#5C0000' },

    // Palmito - white/cream heart of palm
    palmito: { primary: '#FFFAF0', secondary: '#F5F5DC', stroke: '#D4D4AA' },

    // Chocolate - rich dark brown
    chocolate: { primary: '#3D1C0B', secondary: '#5D3A1A', stroke: '#2B1408' },

    // Doce de leite - caramel tan
    dulce: { primary: '#C69C6D', secondary: '#E0B88A', stroke: '#996633' },

    // Goiabada - deep red-pink guava
    guava: { primary: '#C41E3A', secondary: '#E75480', stroke: '#8B0A1A' },

    // Coco - white flakes
    coconut: { primary: '#FFFFFF', secondary: '#F8F8F8', stroke: '#CCCCCC' },
};

// Render realistic toppings
function renderToppings(
    pattern: PatternType,
    _userColors: PatternColors,
    center: number,
    innerRadius: number,
    halfSide?: 'left' | 'right' | 'slice1' | 'slice2' | 'slice3'
) {
    const colors = realisticColors[pattern] || realisticColors.cheese;
    const positions = generateToppingPositions(32, innerRadius, center, halfSide);

    switch (pattern) {
        case 'pepperoni':
            // Calabresa - round slices with darker center
            return positions.slice(0, 16).map((pos, i) => (
                <g key={i}>
                    <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={pos.size + 2}
                        fill={colors.primary}
                        stroke={colors.stroke}
                        strokeWidth="1.5"
                    />
                    <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={pos.size * 0.5}
                        fill={colors.secondary}
                        opacity="0.6"
                    />
                    {/* Fat spots */}
                    <circle cx={pos.x - 3} cy={pos.y - 2} r={2} fill="#FFEEEE" opacity="0.5" />
                </g>
            ));

        case 'chicken':
            // Frango desfiado - shredded strips
            return positions.slice(0, 20).map((pos, i) => (
                <g key={i} transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}>
                    <ellipse
                        cx={pos.x}
                        cy={pos.y}
                        rx={pos.size * 1.6}
                        ry={pos.size * 0.4}
                        fill={colors.primary}
                        stroke={colors.stroke}
                        strokeWidth="1"
                    />
                    {/* Catupiry on top */}
                    {i % 3 === 0 && (
                        <ellipse
                            cx={pos.x}
                            cy={pos.y}
                            rx={pos.size * 0.8}
                            ry={pos.size * 0.25}
                            fill={colors.secondary}
                            opacity="0.8"
                        />
                    )}
                </g>
            ));

        case 'cheese':
            // Queijos - melted cheese blobs
            return positions.slice(0, 14).map((pos, i) => (
                <g key={i}>
                    <ellipse
                        cx={pos.x}
                        cy={pos.y}
                        rx={pos.size * 2}
                        ry={pos.size * 1.3}
                        fill={i % 2 === 0 ? colors.primary : colors.secondary}
                        stroke={colors.stroke}
                        strokeWidth="1"
                        opacity="0.85"
                    />
                </g>
            ));

        case 'ham':
            // Presunto - square/rectangular slices
            return positions.slice(0, 16).map((pos, i) => (
                <g key={i} transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}>
                    <rect
                        x={pos.x - pos.size * 1.3}
                        y={pos.y - pos.size * 0.9}
                        width={pos.size * 2.6}
                        height={pos.size * 1.8}
                        rx={3}
                        fill={colors.primary}
                        stroke={colors.stroke}
                        strokeWidth="1.5"
                    />
                    {/* Fat marbling */}
                    <line
                        x1={pos.x - pos.size * 0.8}
                        y1={pos.y}
                        x2={pos.x + pos.size * 0.8}
                        y2={pos.y}
                        stroke={colors.secondary}
                        strokeWidth="2"
                        opacity="0.6"
                    />
                </g>
            ));

        case 'tuna':
            // Atum - flaky chunks
            return positions.slice(0, 18).map((pos, i) => (
                <g key={i} transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}>
                    <ellipse
                        cx={pos.x}
                        cy={pos.y}
                        rx={pos.size * 1.4}
                        ry={pos.size * 0.5}
                        fill={colors.primary}
                        stroke={colors.stroke}
                        strokeWidth="1"
                    />
                    <ellipse
                        cx={pos.x + 2}
                        cy={pos.y - 1}
                        rx={pos.size * 0.6}
                        ry={pos.size * 0.2}
                        fill={colors.secondary}
                        opacity="0.5"
                    />
                </g>
            ));

        case 'corn':
            // Milho - small round kernels scattered densely
            return positions.slice(0, 26).map((pos, i) => (
                <circle
                    key={i}
                    cx={pos.x + (i % 3) * 4 - 4}
                    cy={pos.y + (i % 2) * 4 - 2}
                    r={4 + (i % 2)}
                    fill={colors.primary}
                    stroke={colors.stroke}
                    strokeWidth="0.8"
                />
            ));

        case 'basil':
            // Margherita - basil leaves + cherry tomatoes
            return (
                <>
                    {/* Basil leaves */}
                    {positions.slice(0, 8).map((pos, i) => (
                        <g key={`leaf-${i}`} transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}>
                            <ellipse
                                cx={pos.x}
                                cy={pos.y}
                                rx={pos.size * 1.4}
                                ry={pos.size * 0.7}
                                fill={colors.primary}
                                stroke="#145214"
                                strokeWidth="1"
                            />
                            {/* Leaf vein */}
                            <line
                                x1={pos.x - pos.size}
                                y1={pos.y}
                                x2={pos.x + pos.size}
                                y2={pos.y}
                                stroke="#1a6b1a"
                                strokeWidth="1"
                                opacity="0.5"
                            />
                        </g>
                    ))}
                    {/* Cherry tomatoes */}
                    {positions.slice(8, 15).map((pos, i) => (
                        <g key={`tomato-${i}`}>
                            <circle
                                cx={pos.x}
                                cy={pos.y}
                                r={7}
                                fill={colors.secondary}
                                stroke="#B22222"
                                strokeWidth="1.5"
                            />
                            {/* Highlight */}
                            <ellipse cx={pos.x - 2} cy={pos.y - 2} rx={2.5} ry={1.5} fill="rgba(255,255,255,0.4)" />
                        </g>
                    ))}
                </>
            );

        case 'vegetables':
            // Portuguesa - ham, olives, eggs, onions
            return positions.slice(0, 22).map((pos, i) => {
                if (i % 4 === 0) {
                    // Olives (black)
                    return (
                        <g key={i}>
                            <circle
                                cx={pos.x}
                                cy={pos.y}
                                r={6}
                                fill="#1a1a1a"
                                stroke="#000"
                                strokeWidth="1"
                            />
                            {/* Pimento */}
                            <circle cx={pos.x} cy={pos.y} r={2.5} fill="#CC0000" />
                        </g>
                    );
                } else if (i % 4 === 1) {
                    // Egg (yellow center)
                    return (
                        <g key={i}>
                            <circle cx={pos.x} cy={pos.y} r={8} fill="#FFFDD0" stroke="#E6B800" strokeWidth="1" />
                            <circle cx={pos.x} cy={pos.y} r={4} fill="#FFD700" />
                        </g>
                    );
                } else if (i % 4 === 2) {
                    // Onion rings
                    return (
                        <circle
                            key={i}
                            cx={pos.x}
                            cy={pos.y}
                            r={7}
                            fill="none"
                            stroke="#DDA0DD"
                            strokeWidth="3"
                        />
                    );
                } else {
                    // Ham pieces
                    return (
                        <rect
                            key={i}
                            x={pos.x - 7}
                            y={pos.y - 5}
                            width={14}
                            height={10}
                            rx={2}
                            fill={colors.primary}
                            stroke={colors.stroke}
                            strokeWidth="1"
                            transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}
                        />
                    );
                }
            });

        case 'shrimp':
            // Camarão - curved shrimp shape
            return positions.slice(0, 12).map((pos, i) => (
                <g key={i} transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}>
                    <path
                        d={`M ${pos.x - 10} ${pos.y + 2} 
                Q ${pos.x - 5} ${pos.y - 8}, ${pos.x + 2} ${pos.y - 6}
                Q ${pos.x + 10} ${pos.y - 4}, ${pos.x + 10} ${pos.y + 2}
                Q ${pos.x + 5} ${pos.y + 6}, ${pos.x} ${pos.y + 5}
                Q ${pos.x - 5} ${pos.y + 4}, ${pos.x - 10} ${pos.y + 2}`}
                        fill={colors.primary}
                        stroke={colors.stroke}
                        strokeWidth="1.5"
                    />
                    {/* Shrimp segments */}
                    <path
                        d={`M ${pos.x - 4} ${pos.y - 3} Q ${pos.x} ${pos.y - 5}, ${pos.x + 4} ${pos.y - 3}`}
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="1.5"
                        fill="none"
                    />
                </g>
            ));

        case 'meat':
            // Carne seca - dark brown fibrous strips
            return positions.slice(0, 16).map((pos, i) => (
                <g key={i} transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}>
                    <rect
                        x={pos.x - pos.size * 2}
                        y={pos.y - 4}
                        width={pos.size * 4}
                        height={8}
                        rx={4}
                        fill={colors.primary}
                        stroke={colors.stroke}
                        strokeWidth="1.5"
                    />
                    {/* Fiber lines */}
                    <line
                        x1={pos.x - pos.size * 1.5}
                        y1={pos.y}
                        x2={pos.x + pos.size * 1.5}
                        y2={pos.y}
                        stroke={colors.secondary}
                        strokeWidth="1"
                        opacity="0.5"
                    />
                </g>
            ));

        case 'bacon':
            // Bacon - wavy strips with fat
            return positions.slice(0, 14).map((pos, i) => (
                <g key={i} transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}>
                    {/* Meat part */}
                    <path
                        d={`M ${pos.x - 18} ${pos.y} Q ${pos.x - 9} ${pos.y - 6}, ${pos.x} ${pos.y} Q ${pos.x + 9} ${pos.y + 6}, ${pos.x + 18} ${pos.y}`}
                        stroke={colors.primary}
                        strokeWidth={6}
                        fill="none"
                        strokeLinecap="round"
                    />
                    {/* Fat stripe */}
                    <path
                        d={`M ${pos.x - 16} ${pos.y + 2} Q ${pos.x - 8} ${pos.y - 4}, ${pos.x} ${pos.y + 2} Q ${pos.x + 8} ${pos.y + 6}, ${pos.x + 14} ${pos.y + 1}`}
                        stroke={colors.secondary}
                        strokeWidth={3}
                        fill="none"
                        strokeLinecap="round"
                    />
                </g>
            ));

        case 'palmito':
            // Palmito - white cylindrical pieces
            return positions.slice(0, 14).map((pos, i) => (
                <g key={i} transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}>
                    <rect
                        x={pos.x - 4}
                        y={pos.y - 14}
                        width={8}
                        height={28}
                        rx={4}
                        fill={colors.primary}
                        stroke={colors.stroke}
                        strokeWidth="1.5"
                    />
                    {/* Ring marks */}
                    <line x1={pos.x - 3} y1={pos.y - 6} x2={pos.x + 3} y2={pos.y - 6} stroke={colors.stroke} strokeWidth="1" opacity="0.5" />
                    <line x1={pos.x - 3} y1={pos.y + 6} x2={pos.x + 3} y2={pos.y + 6} stroke={colors.stroke} strokeWidth="1" opacity="0.5" />
                </g>
            ));

        case 'chocolate':
            // Chocolate - drizzle and chips
            return (
                <>
                    {/* Drizzle */}
                    {positions.slice(0, 8).map((pos, i) => (
                        <path
                            key={`drizzle-${i}`}
                            d={`M ${pos.x - 22} ${pos.y} Q ${pos.x - 5} ${pos.y - 18}, ${pos.x + 12} ${pos.y} Q ${pos.x + 22} ${pos.y + 10}, ${pos.x + 28} ${pos.y}`}
                            stroke={colors.primary}
                            strokeWidth={6}
                            fill="none"
                            strokeLinecap="round"
                            transform={`rotate(${pos.rotation * 0.5} ${pos.x} ${pos.y})`}
                        />
                    ))}
                    {/* Granulado (sprinkles) */}
                    {positions.slice(8, 22).map((pos, i) => (
                        <rect
                            key={`chip-${i}`}
                            x={pos.x - 2}
                            y={pos.y - 2}
                            width={4}
                            height={4}
                            fill={colors.secondary}
                            transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}
                        />
                    ))}
                </>
            );

        case 'dulce':
            // Doce de leite - caramel swirls
            return positions.slice(0, 12).map((pos, i) => (
                <g key={i} transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}>
                    <path
                        d={`M ${pos.x - 18} ${pos.y} Q ${pos.x - 6} ${pos.y - 12}, ${pos.x + 6} ${pos.y} Q ${pos.x + 18} ${pos.y + 12}, ${pos.x + 24} ${pos.y}`}
                        stroke={colors.primary}
                        strokeWidth={7}
                        fill="none"
                        strokeLinecap="round"
                    />
                    {/* Lighter center */}
                    <path
                        d={`M ${pos.x - 14} ${pos.y} Q ${pos.x - 4} ${pos.y - 8}, ${pos.x + 8} ${pos.y}`}
                        stroke={colors.secondary}
                        strokeWidth={3}
                        fill="none"
                        strokeLinecap="round"
                        opacity="0.6"
                    />
                </g>
            ));

        case 'guava':
            // Goiabada - deep red-pink chunks
            return positions.slice(0, 14).map((pos, i) => (
                <g key={i}>
                    <rect
                        x={pos.x - pos.size * 1.2}
                        y={pos.y - pos.size * 0.8}
                        width={pos.size * 2.4}
                        height={pos.size * 1.6}
                        rx={3}
                        fill={colors.primary}
                        stroke={colors.stroke}
                        strokeWidth="1.5"
                        transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}
                    />
                    {/* Shine */}
                    <ellipse
                        cx={pos.x - 2}
                        cy={pos.y - 2}
                        rx={3}
                        ry={2}
                        fill="rgba(255,255,255,0.25)"
                        transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}
                    />
                </g>
            ));

        case 'coconut':
            // Coco ralado - white flakes
            return positions.slice(0, 24).map((pos, i) => (
                <ellipse
                    key={i}
                    cx={pos.x}
                    cy={pos.y}
                    rx={7}
                    ry={2.5}
                    fill={colors.primary}
                    stroke={colors.stroke}
                    strokeWidth="0.5"
                    transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}
                />
            ));

        default:
            return null;
    }
}

export function PizzaVisual({
    mode,
    leftFlavor,
    rightFlavor,
    thirdFlavor,
    activeHalf,
    size = 260
}: PizzaVisualProps) {
    const center = size / 2;
    const outerRadius = (size / 2) - 8;
    const crustWidth = 14;
    const innerRadius = outerRadius - crustWidth;
    const sauceRadius = innerRadius - 3;
    const cheeseRadius = sauceRadius - 4;

    return (
        <div className="relative inline-block">
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="drop-shadow-xl"
            >
                {/* Clip paths */}
                <defs>
                    <clipPath id="leftHalfClip">
                        <rect x="0" y="0" width={center} height={size} />
                    </clipPath>
                    <clipPath id="rightHalfClip">
                        <rect x={center} y="0" width={center} height={size} />
                    </clipPath>

                    {/* 3 Flavors Clip Paths */}
                    {/* Slice 1: 0 to 120 degrees (Right-ish) */}
                    <clipPath id="slice1Clip">
                        <path d={`M ${center} ${center} L ${center} 0 A ${center} ${center} 0 0 1 ${center + Math.sin(120 * Math.PI / 180) * center} ${center - Math.cos(120 * Math.PI / 180) * center} Z`} />
                    </clipPath>
                    {/* Slice 2: 120 to 240 degrees (Bottom) */}
                    <clipPath id="slice2Clip">
                        <path d={`M ${center} ${center} L ${center + Math.sin(120 * Math.PI / 180) * center} ${center - Math.cos(120 * Math.PI / 180) * center} A ${center} ${center} 0 0 1 ${center + Math.sin(240 * Math.PI / 180) * center} ${center - Math.cos(240 * Math.PI / 180) * center} Z`} />
                    </clipPath>
                    {/* Slice 3: 240 to 360 degrees (Top-Left) */}
                    <clipPath id="slice3Clip">
                        <path d={`M ${center} ${center} L ${center + Math.sin(240 * Math.PI / 180) * center} ${center - Math.cos(240 * Math.PI / 180) * center} A ${center} ${center} 0 0 1 ${center} 0 Z`} />
                    </clipPath>

                    <clipPath id="pizzaClip">
                        <circle cx={center} cy={center} r={cheeseRadius} />
                    </clipPath>
                </defs>

                {/* Outer crust - golden brown */}
                <circle
                    cx={center}
                    cy={center}
                    r={outerRadius}
                    fill="#C68642"
                    stroke="#8B5A2B"
                    strokeWidth="2"
                />

                {/* Inner crust - lighter */}
                <circle
                    cx={center}
                    cy={center}
                    r={outerRadius - 5}
                    fill="#DEB887"
                />

                {/* Red tomato sauce ring */}
                <circle
                    cx={center}
                    cy={center}
                    r={innerRadius}
                    fill="#B22222"
                />

                {/* Melted cheese base */}
                <circle
                    cx={center}
                    cy={center}
                    r={cheeseRadius}
                    fill="#F5DEB3"
                />

                {/* Cheese bubbles/texture */}
                <circle cx={center - 40} cy={center - 30} r={20} fill="#FAEBD7" opacity="0.6" />
                <circle cx={center + 50} cy={center + 40} r={25} fill="#FAEBD7" opacity="0.5" />
                <circle cx={center - 20} cy={center + 50} r={18} fill="#FAEBD7" opacity="0.45" />
                <circle cx={center + 30} cy={center - 45} r={15} fill="#FAEBD7" opacity="0.55" />
                <circle cx={center} cy={center} r={12} fill="#FAEBD7" opacity="0.4" />

                {/* Toppings for inteira mode */}
                {mode === 'inteira' && leftFlavor && (
                    <g clipPath="url(#pizzaClip)">
                        {renderToppings(leftFlavor.pattern, leftFlavor.colors, center, cheeseRadius)}
                    </g>
                )}

                {/* Toppings for meia mode */}
                {mode === 'meia' && (
                    <>
                        {leftFlavor && (
                            <g clipPath="url(#leftHalfClip)">
                                <g clipPath="url(#pizzaClip)">
                                    {renderToppings(leftFlavor.pattern, leftFlavor.colors, center, cheeseRadius, 'left')}
                                </g>
                            </g>
                        )}

                        {rightFlavor && (
                            <g clipPath="url(#rightHalfClip)">
                                <g clipPath="url(#pizzaClip)">
                                    {renderToppings(rightFlavor.pattern, rightFlavor.colors, center, cheeseRadius, 'right')}
                                </g>
                            </g>
                        )}

                        {/* Dividing line */}
                        <line
                            x1={center}
                            y1={center - innerRadius + 5}
                            x2={center}
                            y2={center + innerRadius - 5}
                            stroke="#8B0000"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                    </>
                )}

                {/* Toppings for tercos mode */}
                {mode === 'tercos' && (
                    <>
                        {leftFlavor && (
                            <g clipPath="url(#slice1Clip)">
                                <g clipPath="url(#pizzaClip)">
                                    {renderToppings(leftFlavor.pattern, leftFlavor.colors, center, cheeseRadius, 'slice1')}
                                </g>
                            </g>
                        )}
                        {rightFlavor && (
                            <g clipPath="url(#slice2Clip)">
                                <g clipPath="url(#pizzaClip)">
                                    {renderToppings(rightFlavor.pattern, rightFlavor.colors, center, cheeseRadius, 'slice2')}
                                </g>
                            </g>
                        )}
                        {thirdFlavor && (
                            <g clipPath="url(#slice3Clip)">
                                <g clipPath="url(#pizzaClip)">
                                    {renderToppings(thirdFlavor.pattern, thirdFlavor.colors, center, cheeseRadius, 'slice3')}
                                </g>
                            </g>
                        )}

                        {/* Dividing lines for 3 Flavors */}
                        {[0, 120, 240].map(angle => {
                            const rad = (angle - 90) * Math.PI / 180; // -90 to start from top
                            const x2 = center + (innerRadius - 5) * Math.cos(rad);
                            const y2 = center + (innerRadius - 5) * Math.sin(rad);
                            return (
                                <line
                                    key={angle}
                                    x1={center}
                                    y1={center}
                                    x2={x2}
                                    y2={y2}
                                    stroke="#8B0000"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />
                            );
                        })}
                    </>
                )}

                {/* Active slice highlight */}
                {activeHalf && (
                    <g clipPath={
                        activeHalf === 'left' ? 'url(#leftHalfClip)' :
                            activeHalf === 'right' ? 'url(#rightHalfClip)' :
                                activeHalf === 'slice1' ? 'url(#slice1Clip)' :
                                    activeHalf === 'slice2' ? 'url(#slice2Clip)' :
                                        'url(#slice3Clip)'
                    }>
                        <circle
                            cx={center}
                            cy={center}
                            r={innerRadius}
                            fill="none"
                            stroke="#F2C94C"
                            strokeWidth="6"
                            className="animate-pulse"
                        />
                        <circle
                            cx={center}
                            cy={center}
                            r={cheeseRadius}
                            fill="#F2C94C"
                            opacity="0.2"
                            className="animate-pulse"
                        />
                    </g>
                )}

                {/* Subtle slice lines */}
                {[45, 90, 135].map((angle) => (
                    <g key={angle}>
                        <line
                            x1={center}
                            y1={center}
                            x2={center + cheeseRadius * Math.cos((angle * Math.PI) / 180)}
                            y2={center + cheeseRadius * Math.sin((angle * Math.PI) / 180)}
                            stroke="#D4A76A"
                            strokeWidth="1.5"
                            opacity="0.25"
                        />
                        <line
                            x1={center}
                            y1={center}
                            x2={center - cheeseRadius * Math.cos((angle * Math.PI) / 180)}
                            y2={center - cheeseRadius * Math.sin((angle * Math.PI) / 180)}
                            stroke="#D4A76A"
                            strokeWidth="1.5"
                            opacity="0.25"
                        />
                    </g>
                ))}
            </svg>

            {/* Shadow */}
            <div
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/30 rounded-full blur-lg"
                style={{ width: size * 0.75, height: 14 }}
            />
        </div>
    );
}
