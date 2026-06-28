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

    // Use actual radius minus padding to avoid toppings on the crust
    const effectiveRadius = radius * 0.88;

    // Concentric rings to distribute toppings naturally
    const rings = [
        { r: 0.15, items: 3 },
        { r: 0.45, items: 8 },
        { r: 0.72, items: 13 },
        { r: 0.95, items: 18 }
    ];

    let idx = 0;
    for (const ring of rings) {
        const ringRadius = effectiveRadius * ring.r;
        const angleStep = 360 / ring.items;
        const startAngle = (idx % 2) * (angleStep / 2) + 15; // Jitter start angle

        for (let i = 0; i < ring.items && positions.length < count; i++) {
            const angle = (startAngle + i * angleStep) * (Math.PI / 180);

            // Add slight randomness (jitter) to coordinates for organic placement
            const jitterX = (Math.sin(angle * 5) * 3);
            const jitterY = (Math.cos(angle * 5) * 3);

            let x = center + ringRadius * Math.cos(angle) + jitterX;
            let y = center + ringRadius * Math.sin(angle) + jitterY;

            // Filtering logic for partial pizzas
            let keep = true;
            if (halfSide === 'left') {
                if (x > center) keep = false;
            } else if (halfSide === 'right') {
                if (x < center) keep = false;
            }

            if (keep) {
                positions.push({
                    x,
                    y,
                    size: 6 + (idx % 3) * 1.5,
                    rotation: (i * 35 + idx * 55) % 360
                });
            }
        }
        idx++;
    }

    return positions;
}

// Generate fine black pepper/oregano flakes to scatter across the whole pizza
function generateOreganoFlakes(center: number, radius: number, count = 120) {
    const flakes: { x: number; y: number; r: number; color: string; rot: number }[] = [];
    const colors = ['#2E5A1C', '#1D3B10', '#1F1F1F', '#3B422B'];

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * radius * 0.9;
        flakes.push({
            x: center + dist * Math.cos(angle),
            y: center + dist * Math.sin(angle),
            r: 0.6 + Math.random() * 0.8,
            color: colors[Math.floor(Math.random() * colors.length)],
            rot: Math.random() * 360
        });
    }
    return flakes;
}

// Generate wood-fire char marks for the crust
function generateCharMarks(center: number, outerRadius: number, count = 8) {
    const marks: { x: number; y: number; rx: number; ry: number; rot: number }[] = [];
    for (let i = 0; i < count; i++) {
        const angle = (i * (360 / count) + Math.random() * 20) * (Math.PI / 180);
        // Place them right on the crust rim
        const dist = outerRadius - 4 - Math.random() * 3;
        marks.push({
            x: center + dist * Math.cos(angle),
            y: center + dist * Math.sin(angle),
            rx: 3 + Math.random() * 5,
            ry: 2 + Math.random() * 2,
            rot: (angle * 180 / Math.PI) + 90
        });
    }
    return marks;
}

// Render realistic toppings with SVG filters and high fidelity styles
function renderToppings(
    pattern: PatternType,
    center: number,
    innerRadius: number,
    halfSide?: 'left' | 'right' | 'slice1' | 'slice2' | 'slice3'
) {
    const positions = generateToppingPositions(38, innerRadius, center, halfSide);

    switch (pattern) {
        case 'pepperoni':
            // Calabresa - Rich reddish slices with fat pooling and toasted rims
            return positions.slice(0, 16).map((pos, i) => (
                <g key={i} filter="url(#toppingShadow)">
                    {/* Darker toasted bottom rim */}
                    <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={pos.size * 1.8 + 0.5}
                        fill="#5C0C0B"
                    />
                    {/* Main pepperoni slice with gradient */}
                    <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={pos.size * 1.8}
                        fill="url(#calabresaGrad)"
                    />
                    {/* Small fat spots and spices */}
                    <circle cx={pos.x - pos.size * 0.4} cy={pos.y - pos.size * 0.3} r={1.5} fill="#FFA07A" opacity="0.65" />
                    <circle cx={pos.x + pos.size * 0.5} cy={pos.y + pos.size * 0.2} r={1} fill="#FFD700" opacity="0.5" />
                    <circle cx={pos.x - pos.size * 0.2} cy={pos.y + pos.size * 0.5} r={0.8} fill="#2D2D2D" opacity="0.7" />
                    <circle cx={pos.x + pos.size * 0.2} cy={pos.y - pos.size * 0.6} r={1.2} fill="#FFA07A" opacity="0.5" />
                    
                    {/* Slight cupping shadow to make it look 3D and bowl-like */}
                    <circle
                        cx={pos.x + 0.5}
                        cy={pos.y + 0.5}
                        r={pos.size * 1.3}
                        fill="none"
                        stroke="#4A0505"
                        strokeWidth="1.5"
                        opacity="0.4"
                    />
                </g>
            ));

        case 'chicken':
            // Frango desfiado - Shredded realistic chicken strings + Catupiry swirls
            return (
                <g filter="url(#toppingShadow)">
                    {/* Shredded chicken shreds */}
                    {positions.slice(0, 24).map((pos, i) => (
                        <g key={`chicken-${i}`} transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}>
                            {/* main shred */}
                            <path
                                d={`M ${pos.x - pos.size * 1.5} ${pos.y} Q ${pos.x} ${pos.y - 2}, ${pos.x + pos.size * 1.5} ${pos.y + 1}`}
                                fill="none"
                                stroke="#D2B48C"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                            {/* lighter inner shred */}
                            <path
                                d={`M ${pos.x - pos.size * 1.1} ${pos.y - 0.5} Q ${pos.x} ${pos.y - 1.5}, ${pos.x + pos.size * 1.1} ${pos.y}`}
                                fill="none"
                                stroke="#F5DEB3"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                            />
                            {/* brown toasted bits */}
                            {i % 4 === 0 && (
                                <circle cx={pos.x + pos.size * 0.8} cy={pos.y} r={1.2} fill="#8B4513" />
                            )}
                        </g>
                    ))}
                    
                    {/* Catupiry Requeijão lines layered over the chicken */}
                    {positions.slice(0, 8).map((pos, i) => (
                        <g key={`catupiry-${i}`} transform={`rotate(${pos.rotation * 0.4} ${pos.x} ${pos.y})`}>
                            {/* Creamy yellow requeijão body */}
                            <path
                                d={`M ${pos.x - 20} ${pos.y - 2} Q ${pos.x} ${pos.y - 8}, ${pos.x + 20} ${pos.y - 2}`}
                                fill="none"
                                stroke="#FFFEE0"
                                strokeWidth="5.5"
                                strokeLinecap="round"
                                opacity="0.95"
                            />
                            {/* White shiny peak */}
                            <path
                                d={`M ${pos.x - 17} ${pos.y - 3} Q ${pos.x} ${pos.y - 7.5}, ${pos.x + 17} ${pos.y - 3}`}
                                fill="none"
                                stroke="#FFFFFF"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </g>
                    ))}
                </g>
            );

        case 'cheese':
            // Quatro Queijos - Melted provolone patches, mozzarella pools, and blue gorgonzola crumbs
            return (
                <g filter="url(#toppingShadow)">
                    {/* Melted Cheddar/Provolone Pools */}
                    {positions.slice(0, 10).map((pos, i) => (
                        <path
                            key={`pool-${i}`}
                            d={`M ${pos.x - 18} ${pos.y} Q ${pos.x - 8} ${pos.y - 12}, ${pos.x + 12} ${pos.y - 4} Q ${pos.x + 18} ${pos.y + 10}, ${pos.x - 5} ${pos.y + 8} Z`}
                            fill={i % 2 === 0 ? "#FFC04D" : "#FFE082"}
                            opacity="0.8"
                            stroke="#E0A800"
                            strokeWidth="0.8"
                        />
                    ))}
                    {/* Gorgonzola green-blue spots */}
                    {positions.slice(10, 22).map((pos, i) => (
                        <circle
                            key={`gorg-${i}`}
                            cx={pos.x}
                            cy={pos.y}
                            r={3 + (i % 3)}
                            fill="#556B2F"
                            stroke="#3E4F22"
                            strokeWidth="0.5"
                            opacity="0.9"
                        />
                    ))}
                    {/* White creamy pools */}
                    {positions.slice(22, 30).map((pos, i) => (
                        <ellipse
                            key={`white-${i}`}
                            cx={pos.x}
                            cy={pos.y}
                            rx={12}
                            ry={8}
                            fill="#FFFFF0"
                            opacity="0.85"
                            filter="blur(1px)"
                        />
                    ))}
                </g>
            );

        case 'ham':
            // Presunto - Pink wavy square chunks with grilled edges
            return positions.slice(0, 16).map((pos, i) => (
                <g key={i} transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`} filter="url(#toppingShadow)">
                    {/* Toasted underside shadow */}
                    <rect
                        x={pos.x - pos.size * 1.5 - 0.5}
                        y={pos.y - pos.size * 1.1 - 0.5}
                        width={pos.size * 3 + 1}
                        height={pos.size * 2.2 + 1}
                        rx={2}
                        fill="#A65454"
                    />
                    {/* Main ham piece */}
                    <rect
                        x={pos.x - pos.size * 1.5}
                        y={pos.y - pos.size * 1.1}
                        width={pos.size * 3}
                        height={pos.size * 2.2}
                        rx={1.5}
                        fill="#F29494"
                    />
                    {/* Fatty stripes */}
                    <path
                        d={`M ${pos.x - pos.size * 1.1} ${pos.y - pos.size * 0.4} Q ${pos.x} ${pos.y - pos.size * 0.2}, ${pos.x + pos.size * 1.1} ${pos.y - pos.size * 0.5}`}
                        fill="none"
                        stroke="#FFD1D1"
                        strokeWidth="1.8"
                        opacity="0.65"
                    />
                    {/* Brown toasted edges */}
                    <line x1={pos.x - pos.size * 1.5} y1={pos.y - pos.size * 1.1} x2={pos.x - pos.size * 0.8} y2={pos.y - pos.size * 1.1} stroke="#7D2D2D" strokeWidth="1.2" />
                    <line x1={pos.x + pos.size * 1.5} y1={pos.y + pos.size * 1.1} x2={pos.x + pos.size * 1.0} y2={pos.y + pos.size * 1.1} stroke="#7D2D2D" strokeWidth="1.2" />
                </g>
            ));

        case 'tuna':
            // Atum - Flaky reddish-brown fish chunks, highly detailed
            return positions.slice(0, 22).map((pos, i) => (
                <g key={i} transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`} filter="url(#toppingShadow)">
                    {/* Flaky chunk shape */}
                    <path
                        d={`M ${pos.x - 12} ${pos.y + 2} 
                           C ${pos.x - 10} ${pos.y - 7}, ${pos.x - 3} ${pos.y - 5}, ${pos.x} ${pos.y - 6}
                           C ${pos.x + 5} ${pos.y - 7}, ${pos.x + 10} ${pos.y - 4}, ${pos.x + 12} ${pos.y + 1}
                           C ${pos.x + 8} ${pos.y + 6}, ${pos.x} ${pos.y + 5}, ${pos.x - 8} ${pos.y + 6} Z`}
                        fill="#A56E58"
                        stroke="#704432"
                        strokeWidth="1"
                    />
                    {/* Lighter flakes on top */}
                    <path
                        d={`M ${pos.x - 8} ${pos.y - 1} C ${pos.x} ${pos.y - 3}, ${pos.x + 8} ${pos.y - 1}, ${pos.x + 6} ${pos.y + 2}`}
                        fill="none"
                        stroke="#C6927D"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        opacity="0.8"
                    />
                    {/* Meat fibers (fine dark stripes) */}
                    <line x1={pos.x - 4} y1={pos.y - 3} x2={pos.x - 2} y2={pos.y + 3} stroke="#542E1F" strokeWidth="0.8" opacity="0.6" />
                    <line x1={pos.x + 2} y1={pos.y - 3} x2={pos.x + 4} y2={pos.y + 3} stroke="#542E1F" strokeWidth="0.8" opacity="0.6" />
                </g>
            ));

        case 'corn':
            // Milho - Shiny yellow plump corn kernels with highlights
            return positions.slice(0, 30).map((pos, i) => (
                <g key={i} filter="url(#toppingShadow)">
                    <ellipse
                        cx={pos.x}
                        cy={pos.y}
                        rx={4.5}
                        ry={3.2}
                        fill="#FFD700"
                        stroke="#D5A300"
                        strokeWidth="0.8"
                        transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}
                    />
                    {/* Highlight to look juicy and 3D */}
                    <ellipse
                        cx={pos.x - 1.2}
                        cy={pos.y - 0.8}
                        rx={1.5}
                        ry={0.8}
                        fill="#FFFFFF"
                        opacity="0.85"
                        transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}
                    />
                </g>
            ));

        case 'basil':
            // Margherita - Basil leaves + red tomato slices
            return (
                <g filter="url(#toppingShadow)">
                    {/* Tomato Slices first (layer underneath basil) */}
                    {positions.slice(8, 15).map((pos, i) => (
                        <g key={`tomato-${i}`} transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}>
                            {/* Main tomato circle */}
                            <circle cx={pos.x} cy={pos.y} r={15} fill="url(#tomatoGrad)" stroke="#8B0000" strokeWidth="1.2" />
                            {/* Core structure (star/segments) */}
                            <path d={`M ${pos.x} ${pos.y - 12} L ${pos.x} ${pos.y + 12} M ${pos.x - 12} ${pos.y} L ${pos.x + 12} ${pos.y}`} stroke="#E60000" strokeWidth="3" opacity="0.6" />
                            {/* Seeds cavities */}
                            <circle cx={pos.x - 6} cy={pos.y - 6} r={3.5} fill="#800000" />
                            <circle cx={pos.x + 6} cy={pos.y - 6} r={3.5} fill="#800000" />
                            <circle cx={pos.x - 6} cy={pos.y + 6} r={3.5} fill="#800000" />
                            <circle cx={pos.x + 6} cy={pos.y + 6} r={3.5} fill="#800000" />
                            {/* Yellow seeds */}
                            <circle cx={pos.x - 6} cy={pos.y - 5.5} r={1} fill="#FFD700" />
                            <circle cx={pos.x + 6} cy={pos.y - 6.5} r={1.2} fill="#FFD700" />
                            <circle cx={pos.x - 5.5} cy={pos.y + 6} r={1.1} fill="#FFD700" />
                            <circle cx={pos.x + 6.5} cy={pos.y + 5.5} r={1} fill="#FFD700" />
                            {/* shine highlight */}
                            <ellipse cx={pos.x - 7} cy={pos.y - 7} rx={3} ry={1} fill="#FFFFFF" opacity="0.35" transform="rotate(-30)" />
                        </g>
                    ))}
                    {/* Green Basil Leaves (layer on top) */}
                    {positions.slice(0, 10).map((pos, i) => (
                        <g key={`leaf-${i}`} transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}>
                            {/* Leaf shape path (wavy) */}
                            <path
                                d={`M ${pos.x - 16} ${pos.y} 
                                   Q ${pos.x - 6} ${pos.y - 12}, ${pos.x + 16} ${pos.y - 1} 
                                   Q ${pos.x - 6} ${pos.y + 11}, ${pos.x - 16} ${pos.y}`}
                                fill="#2A7A2A"
                                stroke="#144A14"
                                strokeWidth="1"
                            />
                            {/* Leaf vein */}
                            <path
                                d={`M ${pos.x - 14} ${pos.y} Q ${pos.x} ${pos.y - 1}, ${pos.x + 12} ${pos.y - 1}`}
                                fill="none"
                                stroke="#52A852"
                                strokeWidth="1.2"
                                opacity="0.65"
                            />
                            {/* Small veins */}
                            <path d={`M ${pos.x - 5} ${pos.y} L ${pos.x - 2} ${pos.y - 4}`} stroke="#52A852" strokeWidth="0.8" opacity="0.5" />
                            <path d={`M ${pos.x + 2} ${pos.y} L ${pos.x + 5} ${pos.y - 4}`} stroke="#52A852" strokeWidth="0.8" opacity="0.5" />
                            <path d={`M ${pos.x - 2} ${pos.y} L ${pos.x} ${pos.y + 4}`} stroke="#52A852" strokeWidth="0.8" opacity="0.5" />
                        </g>
                    ))}
                </g>
            );

        case 'vegetables':
            // Portuguesa - Egg slices, ham, onions and black olive rings
            return (
                <g filter="url(#toppingShadow)">
                    {/* Eggs & Ham */}
                    {positions.slice(0, 15).map((pos, i) => {
                        if (i % 3 === 0) {
                            // Hardboiled Egg Slices
                            return (
                                <g key={i}>
                                    {/* Egg white */}
                                    <ellipse cx={pos.x} cy={pos.y} rx={14} ry={11} fill="#FFFFF0" stroke="#E3E3D3" strokeWidth="1" />
                                    {/* Yolk */}
                                    <ellipse cx={pos.x - 1} cy={pos.y} rx={7} ry={6} fill="#FFD700" stroke="#DAA520" strokeWidth="0.8" />
                                    <ellipse cx={pos.x - 3} cy={pos.y - 2} rx={2} ry={1} fill="#FFF" opacity="0.6" />
                                </g>
                            );
                        } else {
                            // Ham bits
                            return (
                                <rect
                                    key={i}
                                    x={pos.x - 8}
                                    y={pos.y - 6}
                                    width={16}
                                    height={12}
                                    rx={1.5}
                                    fill="#F29494"
                                    stroke="#C47474"
                                    strokeWidth="0.8"
                                    transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}
                                />
                            );
                        }
                    })}
                    {/* Onion rings and olive rings (layered on top) */}
                    {positions.slice(15, 26).map((pos, i) => {
                        if (i % 2 === 0) {
                            // Purple Onion Rings
                            return (
                                <circle
                                    key={i}
                                    cx={pos.x}
                                    cy={pos.y}
                                    r={12}
                                    fill="none"
                                    stroke="#DDA0DD"
                                    strokeWidth="2.5"
                                    opacity="0.85"
                                    transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}
                                />
                            );
                        } else {
                            // Black Olive Rings - Delicious and detailed
                            return (
                                <g key={i}>
                                    {/* Olive body */}
                                    <circle cx={pos.x} cy={pos.y} r={6.5} fill="#1E1E1E" stroke="#000000" strokeWidth="1" />
                                    {/* Cut center hole showing cheese through it */}
                                    <circle cx={pos.x} cy={pos.y} r={2.8} fill="#FFE294" />
                                    {/* Shine */}
                                    <circle cx={pos.x - 2} cy={pos.y - 2} r={1} fill="#FFFFFF" opacity="0.75" />
                                </g>
                            );
                        }
                    })}
                </g>
            );

        case 'shrimp':
            // Camarão - Detailed curved pink shrimp with segments
            return positions.slice(0, 14).map((pos, i) => (
                <g key={i} transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`} filter="url(#toppingShadow)">
                    {/* Outer shadow segment */}
                    <path
                        d={`M ${pos.x - 12} ${pos.y + 3} 
                            Q ${pos.x - 6} ${pos.y - 9}, ${pos.x + 3} ${pos.y - 7}
                            Q ${pos.x + 12} ${pos.y - 5}, ${pos.x + 12} ${pos.y + 2}
                            Q ${pos.x + 6} ${pos.y + 7}, ${pos.x} ${pos.y + 6}
                            Q ${pos.x - 6} ${pos.y + 5}, ${pos.x - 12} ${pos.y + 3}`}
                        fill="#FFA07A"
                        stroke="#D75F3F"
                        strokeWidth="1.2"
                    />
                    {/* Tail fin */}
                    <path d={`M ${pos.x + 10} ${pos.y + 1} L ${pos.x + 15} ${pos.y + 4} L ${pos.x + 14} ${pos.y - 1} Z`} fill="#CD5C5C" />
                    {/* Inner segments */}
                    <path d={`M ${pos.x - 7} ${pos.y - 1} Q ${pos.x - 3} ${pos.y - 4}, ${pos.x + 1} ${pos.y - 2}`} fill="none" stroke="#FFF" strokeWidth="1.2" opacity="0.5" />
                    <path d={`M ${pos.x - 2} ${pos.y + 1} Q ${pos.x + 2} ${pos.y - 2}, ${pos.x + 6} ${pos.y}`} fill="none" stroke="#FFF" strokeWidth="1.2" opacity="0.5" />
                </g>
            ));

        case 'meat':
            // Carne seca - Brown meat fibers + crispy edges
            return positions.slice(0, 18).map((pos, i) => (
                <g key={i} transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`} filter="url(#toppingShadow)">
                    <path
                        d={`M ${pos.x - 15} ${pos.y - 2} C ${pos.x - 10} ${pos.y - 5}, ${pos.x + 10} ${pos.y - 4}, ${pos.x + 15} ${pos.y - 1} L ${pos.x + 13} ${pos.y + 3} C ${pos.x + 5} ${pos.y + 1}, ${pos.x - 5} ${pos.y + 2}, ${pos.x - 14} ${pos.y + 3} Z`}
                        fill="#5D3A1A"
                        stroke="#36200D"
                        strokeWidth="1.2"
                    />
                    {/* Meat fibers */}
                    <line x1={pos.x - 12} y1={pos.y} x2={pos.x + 12} y2={pos.y} stroke="#8B5A2B" strokeWidth="1.2" opacity="0.6" />
                    <line x1={pos.x - 9} y1={pos.y + 1.5} x2={pos.x + 9} y2={pos.y + 1.2} stroke="#8B5A2B" strokeWidth="0.8" opacity="0.5" />
                </g>
            ));

        case 'bacon':
            // Bacon - Wavy crispy thick strips with fat sections
            return positions.slice(0, 14).map((pos, i) => (
                <g key={i} transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`} filter="url(#toppingShadow)">
                    {/* Bottom dark crispy shadow */}
                    <path
                        d={`M ${pos.x - 18} ${pos.y} Q ${pos.x - 9} ${pos.y - 6}, ${pos.x} ${pos.y} Q ${pos.x + 9} ${pos.y + 6}, ${pos.x + 18} ${pos.y}`}
                        stroke="#5A0505"
                        strokeWidth={7}
                        fill="none"
                        strokeLinecap="round"
                    />
                    {/* Meat band */}
                    <path
                        d={`M ${pos.x - 18} ${pos.y} Q ${pos.x - 9} ${pos.y - 6}, ${pos.x} ${pos.y} Q ${pos.x + 9} ${pos.y + 6}, ${pos.x + 18} ${pos.y}`}
                        stroke="#8B0000"
                        strokeWidth={5}
                        fill="none"
                        strokeLinecap="round"
                    />
                    {/* Fat band inside */}
                    <path
                        d={`M ${pos.x - 14} ${pos.y + 1} Q ${pos.x - 7} ${pos.y - 4}, ${pos.x} ${pos.y + 1} Q ${pos.x + 7} ${pos.y + 5}, ${pos.x + 14} ${pos.y}`}
                        stroke="#FFC0CB"
                        strokeWidth={2}
                        fill="none"
                        strokeLinecap="round"
                        opacity="0.8"
                    />
                    {/* Charred crisped edges */}
                    <circle cx={pos.x - 17} cy={pos.y} r={1.5} fill="#2A0000" />
                    <circle cx={pos.x + 17} cy={pos.y} r={1.5} fill="#2A0000" />
                </g>
            ));

        case 'palmito':
            // Palmito - Cream white cylindrical slices with rings
            return positions.slice(0, 14).map((pos, i) => (
                <g key={i} transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`} filter="url(#toppingShadow)">
                    {/* Main cylinder */}
                    <rect
                        x={pos.x - 5}
                        y={pos.y - 12}
                        width={10}
                        height={24}
                        rx={3}
                        fill="#FFFFF0"
                        stroke="#DCDCC0"
                        strokeWidth="1.2"
                    />
                    {/* Rings texture */}
                    <line x1={pos.x - 4} y1={pos.y - 5} x2={pos.x + 4} y2={pos.y - 5} stroke="#E5E5D0" strokeWidth="1" />
                    <line x1={pos.x - 4} y1={pos.y + 5} x2={pos.x + 4} y2={pos.y + 5} stroke="#E5E5D0" strokeWidth="1" />
                    {/* Shadow cores */}
                    <ellipse cx={pos.x} cy={pos.y} rx={3} ry={1} fill="none" stroke="#D3D3A3" strokeWidth="0.8" opacity="0.6" />
                </g>
            ));

        case 'chocolate':
            // Chocolate - Fudge drizzles + sprinkles
            return (
                <g filter="url(#toppingShadow)">
                    {/* Swirly dark chocolate fudge line */}
                    {positions.slice(0, 10).map((pos, i) => (
                        <path
                            key={`fudge-${i}`}
                            d={`M ${pos.x - 22} ${pos.y} Q ${pos.x - 5} ${pos.y - 16}, ${pos.x + 12} ${pos.y} Q ${pos.x + 22} ${pos.y + 10}, ${pos.x + 28} ${pos.y}`}
                            stroke="#3B1C0B"
                            strokeWidth={6}
                            fill="none"
                            strokeLinecap="round"
                            transform={`rotate(${pos.rotation * 0.4} ${pos.x} ${pos.y})`}
                        />
                    ))}
                    {/* Chocolate sprinkles */}
                    {positions.slice(10, 26).map((pos, i) => (
                        <rect
                            key={`sprinkle-${i}`}
                            x={pos.x - 1.5}
                            y={pos.y - 4}
                            width={3}
                            height={8}
                            rx={1}
                            fill={i % 2 === 0 ? "#5C3D2E" : "#865D46"}
                            transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}
                        />
                    ))}
                </g>
            );

        case 'dulce':
            // Doce de leite - Caramel swirls
            return positions.slice(0, 12).map((pos, i) => (
                <g key={i} transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`} filter="url(#toppingShadow)">
                    {/* Caramel ribbon */}
                    <path
                        d={`M ${pos.x - 20} ${pos.y} Q ${pos.x - 6} ${pos.y - 14}, ${pos.x + 6} ${pos.y} Q ${pos.x + 20} ${pos.y + 14}, ${pos.x + 26} ${pos.y}`}
                        stroke="#C69C6D"
                        strokeWidth={7.5}
                        fill="none"
                        strokeLinecap="round"
                    />
                    {/* Glaze reflection line */}
                    <path
                        d={`M ${pos.x - 16} ${pos.y - 1} Q ${pos.x - 4} ${pos.y - 10}, ${pos.x + 8} ${pos.y - 1}`}
                        stroke="#FFE6C7"
                        strokeWidth={2}
                        fill="none"
                        strokeLinecap="round"
                        opacity="0.7"
                    />
                </g>
            ));

        case 'guava':
            // Goiabada - Deep ruby red cubes with wet glaze shine
            return positions.slice(0, 14).map((pos, i) => (
                <g key={i} filter="url(#toppingShadow)">
                    <rect
                        x={pos.x - pos.size * 1.3}
                        y={pos.y - pos.size * 0.9}
                        width={pos.size * 2.6}
                        height={pos.size * 1.8}
                        rx={2}
                        fill="#B01E2E"
                        stroke="#7A0E18"
                        strokeWidth="1.2"
                        transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}
                    />
                    {/* Wet shine highlight */}
                    <ellipse
                        cx={pos.x - pos.size * 0.4}
                        cy={pos.y - pos.size * 0.3}
                        rx={2.5}
                        ry={1.2}
                        fill="#FFFFFF"
                        opacity="0.45"
                        transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}
                    />
                </g>
            ));

        case 'coconut':
            // Coco ralado - White long coconut curls
            return positions.slice(0, 32).map((pos, i) => (
                <path
                    key={i}
                    d={`M ${pos.x - 8} ${pos.y} Q ${pos.x} ${pos.y - 3}, ${pos.x + 8} ${pos.y + 1}`}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    transform={`rotate(${pos.rotation} ${pos.x} ${pos.y})`}
                    filter="url(#toppingShadow)"
                    opacity="0.95"
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
    const sauceRadius = innerRadius - 2;
    const cheeseRadius = sauceRadius - 3;

    // Generate static effects on mount
    const charMarks = generateCharMarks(center, outerRadius, 9);
    const oregano = generateOreganoFlakes(center, cheeseRadius, 140);

    return (
        <div className="relative inline-block">
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="drop-shadow-xl select-none"
            >
                {/* SVG Definitions for shadows, textures and color gradients */}
                <defs>
                    {/* Drop shadow for realistic topping elevation */}
                    <filter id="toppingShadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0.8" dy="1.8" stdDeviation="1.1" flood-color="#1F0800" flood-opacity="0.55" />
                    </filter>
                    
                    {/* Glow filter for active selection */}
                    <filter id="activeGlow" x="-10%" y="-10%" width="120%" height="120%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    {/* Crust Gradient - from raw center to oven browned crust outer edge */}
                    <radialGradient id="crustGrad" cx="50%" cy="50%" r="50%" fx="42%" fy="42%">
                        <stop offset="0%" stopColor="#FAE6C7" />      {/* Dough inner center */}
                        <stop offset="68%" stopColor="#EBC085" />     {/* Golden inner crust */}
                        <stop offset="85%" stopColor="#C97E3A" />     {/* Brown ovened crust */}
                        <stop offset="98%" stopColor="#A85718" />     {/* Dark toasted ring */}
                        <stop offset="100%" stopColor="#5E2C04" />    {/* Crispy outer rim */}
                    </radialGradient>

                    {/* Cheese Base Gradient - simulated melted and golden toasted cheese */}
                    <radialGradient id="cheeseGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#FFF4D0" />      {/* Creamy white center */}
                        <stop offset="60%" stopColor="#FFDE82" />     {/* Rich mozzarella yellow */}
                        <stop offset="88%" stopColor="#F5B93D" />     {/* Toasted orange cheddar bits */}
                        <stop offset="100%" stopColor="#D58010" />    {/* Golden crust interface */}
                    </radialGradient>

                    {/* Pepperoni/Calabresa Gradient */}
                    <radialGradient id="calabresaGrad" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#E35D4B" />      {/* Juicy center */}
                        <stop offset="70%" stopColor="#A8281E" />     {/* Rich sausage red */}
                        <stop offset="98%" stopColor="#700E0E" />     {/* Toasted border */}
                        <stop offset="100%" stopColor="#400303" />    {/* Charred rim */}
                    </radialGradient>

                    {/* Basil Tomato Slice Gradient */}
                    <radialGradient id="tomatoGrad" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#FF5252" />
                        <stop offset="85%" stopColor="#D50000" />
                        <stop offset="100%" stopColor="#7F0000" />
                    </radialGradient>

                    {/* Half/Third Clips */}
                    <clipPath id="leftHalfClip">
                        <rect x="0" y="0" width={center} height={size} />
                    </clipPath>
                    <clipPath id="rightHalfClip">
                        <rect x={center} y="0" width={center} height={size} />
                    </clipPath>

                    {/* 3 Flavors Clip Paths */}
                    <clipPath id="slice1Clip">
                        <path d={`M ${center} ${center} L ${center} 0 A ${center} ${center} 0 0 1 ${center + Math.sin(120 * Math.PI / 180) * center} ${center - Math.cos(120 * Math.PI / 180) * center} Z`} />
                    </clipPath>
                    <clipPath id="slice2Clip">
                        <path d={`M ${center} ${center} L ${center + Math.sin(120 * Math.PI / 180) * center} ${center - Math.cos(120 * Math.PI / 180) * center} A ${center} ${center} 0 0 1 ${center + Math.sin(240 * Math.PI / 180) * center} ${center - Math.cos(240 * Math.PI / 180) * center} Z`} />
                    </clipPath>
                    <clipPath id="slice3Clip">
                        <path d={`M ${center} ${center} L ${center + Math.sin(240 * Math.PI / 180) * center} ${center - Math.cos(240 * Math.PI / 180) * center} A ${center} ${center} 0 0 1 ${center} 0 Z`} />
                    </clipPath>

                    <clipPath id="pizzaClip">
                        <circle cx={center} cy={center} r={cheeseRadius} />
                    </clipPath>
                </defs>

                {/* 1. Main outer baked crust */}
                <circle
                    cx={center}
                    cy={center}
                    r={outerRadius}
                    fill="url(#crustGrad)"
                />

                {/* 2. Wood-fire dark char marks on the crust rim (adds incredible realism) */}
                {charMarks.map((mark, i) => (
                    <ellipse
                        key={i}
                        cx={mark.x}
                        cy={mark.y}
                        rx={mark.rx}
                        ry={mark.ry}
                        fill="#2E1605"
                        opacity="0.75"
                        transform={`rotate(${mark.rot} ${mark.x} ${mark.y})`}
                        filter="blur(0.5px)"
                    />
                ))}

                {/* 3. Deep red tomato sauce base */}
                <circle
                    cx={center}
                    cy={center}
                    r={innerRadius}
                    fill="#991515"
                />
                
                {/* Sauce outer ring texture */}
                <circle
                    cx={center}
                    cy={center}
                    r={innerRadius - 1.5}
                    fill="none"
                    stroke="#B81D1D"
                    strokeWidth="2.5"
                    opacity="0.8"
                />

                {/* 4. Rich melted cheese blanket */}
                <circle
                    cx={center}
                    cy={center}
                    r={cheeseRadius}
                    fill="url(#cheeseGrad)"
                />

                {/* Gratin cheese bubbles (toasty spots on cheese) */}
                <circle cx={center - 32} cy={center - 28} r={14} fill="#E29025" opacity="0.25" filter="blur(1.5px)" />
                <circle cx={center + 45} cy={center + 35} r={18} fill="#E29025" opacity="0.3" filter="blur(2px)" />
                <circle cx={center - 15} cy={center + 45} r={12} fill="#E29025" opacity="0.2" filter="blur(1.5px)" />
                <circle cx={center + 25} cy={center - 38} r={10} fill="#E29025" opacity="0.25" filter="blur(1.2px)" />

                {/* 5. Toppings for inteira mode */}
                {mode === 'inteira' && leftFlavor && (
                    <g clipPath="url(#pizzaClip)">
                        {renderToppings(leftFlavor.pattern, center, cheeseRadius)}
                    </g>
                )}

                {/* Toppings for meia mode */}
                {mode === 'meia' && (
                    <>
                        {leftFlavor && (
                            <g clipPath="url(#leftHalfClip)">
                                <g clipPath="url(#pizzaClip)">
                                    {renderToppings(leftFlavor.pattern, center, cheeseRadius, 'left')}
                                </g>
                            </g>
                        )}

                        {rightFlavor && (
                            <g clipPath="url(#rightHalfClip)">
                                <g clipPath="url(#pizzaClip)">
                                    {renderToppings(rightFlavor.pattern, center, cheeseRadius, 'right')}
                                </g>
                            </g>
                        )}

                        {/* Traditional thick divider line (dark baked crust line separating halves) */}
                        <line
                            x1={center}
                            y1={center - innerRadius + 4}
                            x2={center}
                            y2={center + innerRadius - 4}
                            stroke="#542B0D"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            opacity="0.85"
                            filter="url(#toppingShadow)"
                        />
                    </>
                )}

                {/* Toppings for tercos mode */}
                {mode === 'tercos' && (
                    <>
                        {leftFlavor && (
                            <g clipPath="url(#slice1Clip)">
                                <g clipPath="url(#pizzaClip)">
                                    {renderToppings(leftFlavor.pattern, center, cheeseRadius, 'slice1')}
                                </g>
                            </g>
                        )}
                        {rightFlavor && (
                            <g clipPath="url(#slice2Clip)">
                                <g clipPath="url(#pizzaClip)">
                                    {renderToppings(rightFlavor.pattern, center, cheeseRadius, 'slice2')}
                                </g>
                            </g>
                        )}
                        {thirdFlavor && (
                            <g clipPath="url(#slice3Clip)">
                                <g clipPath="url(#pizzaClip)">
                                    {renderToppings(thirdFlavor.pattern, center, cheeseRadius, 'slice3')}
                                </g>
                            </g>
                        )}

                        {/* Dividing lines for 3 Flavors */}
                        {[0, 120, 240].map(angle => {
                            const rad = (angle - 90) * Math.PI / 180;
                            const x2 = center + (innerRadius - 4) * Math.cos(rad);
                            const y2 = center + (innerRadius - 4) * Math.sin(rad);
                            return (
                                <line
                                    key={angle}
                                    x1={center}
                                    y1={center}
                                    x2={x2}
                                    y2={y2}
                                    stroke="#542B0D"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    opacity="0.8"
                                    filter="url(#toppingShadow)"
                                />
                            );
                        })}
                    </>
                )}

                {/* 6. Scatter dry oregano flakes and pepper on top of everything */}
                <g opacity="0.85">
                    {oregano.map((flake, i) => (
                        <rect
                            key={i}
                            x={flake.x}
                            y={flake.y}
                            width={flake.r * 1.5}
                            height={flake.r * 0.8}
                            rx={0.3}
                            fill={flake.color}
                            transform={`rotate(${flake.rot} ${flake.x} ${flake.y})`}
                        />
                    ))}
                </g>

                {/* Active slice highlight glow */}
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
                            stroke="#FFD700"
                            strokeWidth="5"
                            className="animate-pulse"
                            filter="url(#activeGlow)"
                            opacity="0.8"
                        />
                        <circle
                            cx={center}
                            cy={center}
                            r={cheeseRadius}
                            fill="#FFD700"
                            opacity="0.12"
                            className="animate-pulse"
                        />
                    </g>
                )}

                {/* Subtle guiding slice score lines */}
                {[45, 90, 135].map((angle) => (
                    <g key={angle}>
                        <line
                            x1={center}
                            y1={center}
                            x2={center + cheeseRadius * Math.cos((angle * Math.PI) / 180)}
                            y2={center + cheeseRadius * Math.sin((angle * Math.PI) / 180)}
                            stroke="#D4A76A"
                            strokeWidth="1.2"
                            opacity="0.18"
                        />
                        <line
                            x1={center}
                            y1={center}
                            x2={center - cheeseRadius * Math.cos((angle * Math.PI) / 180)}
                            y2={center - cheeseRadius * Math.sin((angle * Math.PI) / 180)}
                            stroke="#D4A76A"
                            strokeWidth="1.2"
                            opacity="0.18"
                        />
                    </g>
                ))}
            </svg>

            {/* Premium blur shadow underneath the pizza */}
            <div
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/45 rounded-full blur-md"
                style={{ width: size * 0.85, height: 16 }}
            />
        </div>
    );
}
