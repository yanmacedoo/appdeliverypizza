export type ProductType = 'pizza' | 'drink';

export type PatternType =
    | 'pepperoni'      // Red circles for calabresa
    | 'chicken'        // Cream strips for frango
    | 'cheese'         // Yellow blobs for queijos
    | 'ham'            // Pink squares for presunto
    | 'tuna'           // Gray strips for atum
    | 'corn'           // Yellow dots for milho
    | 'basil'          // Green leaves for margherita
    | 'vegetables'     // Mixed colors for portuguesa
    | 'shrimp'         // Pink crescents for camarão
    | 'meat'           // Brown strips for carne seca
    | 'bacon'          // Dark brown strips
    | 'palmito'        // White strips
    | 'chocolate'      // Brown drizzle for doces
    | 'dulce'          // Caramel swirl for doce de leite
    | 'guava'          // Pink blobs for goiabada
    | 'coconut';       // White flakes for coco

export interface PatternColors {
    primary: string;
    secondary?: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    type: ProductType;
    image: string;
    visualPattern?: PatternType;
    patternColors?: PatternColors;
}

export interface Category {
    id: string;
    title: string;
    items: Product[];
}

export const menu: Category[] = [
    {
        id: 'tradicionais',
        title: 'Pizzas Tradicionais',
        items: [
            { id: '1', name: 'Calabresa Acebolada', description: 'Molho de tomate, muçarela, calabresa fatiada, cebola e orégano.', price: 50, type: 'pizza', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=400&auto=format&fit=crop', visualPattern: 'pepperoni', patternColors: { primary: '#c92a2a', secondary: '#862e2e' } },
            { id: '2', name: 'Frango com Catupiry', description: 'Molho de tomate, muçarela, frango desfiado, catupiry e orégano.', price: 50, type: 'pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&auto=format&fit=crop', visualPattern: 'chicken', patternColors: { primary: '#ffc078', secondary: '#fff4e6' } },
            { id: '3', name: 'Moda da Casa', description: 'Calabresa ralada, tomate, muçarela, cebola, bacon, catupiry e orégano.', price: 50, type: 'pizza', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400&auto=format&fit=crop', visualPattern: 'bacon', patternColors: { primary: '#8b4513', secondary: '#c92a2a' } },
            { id: '4', name: 'Presunto', description: 'Molho de tomate, muçarela, presunto e orégano.', price: 50, type: 'pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop', visualPattern: 'ham', patternColors: { primary: '#fab5c5', secondary: '#f783ac' } },
            { id: '5', name: 'Atum', description: 'Molho de tomate, muçarela, atum ralado, cebola em rodelas e orégano.', price: 50, type: 'pizza', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=400&auto=format&fit=crop', visualPattern: 'tuna', patternColors: { primary: '#868e96', secondary: '#ced4da' } },
            { id: '6', name: 'Milho', description: 'Molho de tomate, muçarela, milho verde e orégano.', price: 50, type: 'pizza', image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?q=80&w=400&auto=format&fit=crop', visualPattern: 'corn', patternColors: { primary: '#fcc419', secondary: '#ffe066' } },
            { id: '7', name: 'Margherita', description: 'Molho de tomate, muçarela, tomate fatiado, manjericão e orégano.', price: 50, type: 'pizza', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400&auto=format&fit=crop', visualPattern: 'basil', patternColors: { primary: '#2f9e44', secondary: '#e03131' } },
            { id: '8', name: 'Portuguesa', description: 'Molho de tomate, muçarela, presunto, ovos, azeitona, tomate, cebola e orégano.', price: 50, type: 'pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&auto=format&fit=crop', visualPattern: 'vegetables', patternColors: { primary: '#fab5c5', secondary: '#2f9e44' } },
        ]
    },
    {
        id: 'tradicionais-especiais',
        title: 'Tradicionais Especiais',
        items: [
            { id: '14', name: 'Calabresa Acebolada com Cheddar', description: 'Molho de tomate, muçarela, calabresa fatiada, cheddar, cebola e orégano.', price: 54, type: 'pizza', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=400&auto=format&fit=crop', visualPattern: 'pepperoni', patternColors: { primary: '#c92a2a', secondary: '#ff922b' } },
            { id: '15', name: 'Calabresa Acebolada com Palmito', description: 'Molho de tomate, muçarela, calabresa fatiada, palmito, cebola e orégano.', price: 54, type: 'pizza', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=400&auto=format&fit=crop', visualPattern: 'pepperoni', patternColors: { primary: '#c92a2a', secondary: '#f8f9fa' } },
            { id: '16', name: 'Calabresa Acebolada com Milho', description: 'Molho de tomate, muçarela, calabresa fatiada, milho verde, cebola e orégano.', price: 54, type: 'pizza', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=400&auto=format&fit=crop', visualPattern: 'pepperoni', patternColors: { primary: '#c92a2a', secondary: '#fcc419' } },
            { id: '17', name: 'Frango com Cheddar e Azeitona', description: 'Molho de tomate, muçarela, frango, cheddar, azeitona e orégano.', price: 54, type: 'pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&auto=format&fit=crop', visualPattern: 'chicken', patternColors: { primary: '#ffc078', secondary: '#ff922b' } },
            { id: '18', name: 'Frango com Catupiry e Palmito', description: 'Molho de tomate, muçarela, frango, catupiry, palmito e orégano.', price: 54, type: 'pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&auto=format&fit=crop', visualPattern: 'chicken', patternColors: { primary: '#ffc078', secondary: '#f8f9fa' } },
            { id: '19', name: 'Atum Acebolada com Palmito', description: 'Molho de tomate, muçarela, atum, palmito e orégano.', price: 54, type: 'pizza', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=400&auto=format&fit=crop', visualPattern: 'tuna', patternColors: { primary: '#868e96', secondary: '#f8f9fa' } },
        ]
    },
    {
        id: 'doces',
        title: 'Pizzas Doces',
        items: [
            { id: '9', name: 'Tiazinha', description: 'Ganache de chocolate e granulado.', price: 50, type: 'pizza', image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?q=80&w=400&auto=format&fit=crop', visualPattern: 'chocolate', patternColors: { primary: '#5c3d2e', secondary: '#3d251a' } },
            { id: '10', name: 'Romeu e Julieta', description: 'Muçarela e goiabada.', price: 50, type: 'pizza', image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?q=80&w=400&auto=format&fit=crop', visualPattern: 'guava', patternColors: { primary: '#e64980', secondary: '#fcc419' } },
            { id: '11', name: 'Churros', description: 'Doce de leite e canela.', price: 50, type: 'pizza', image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?q=80&w=400&auto=format&fit=crop', visualPattern: 'dulce', patternColors: { primary: '#d4a574', secondary: '#8b6914' } },
            { id: '12', name: 'Paçoca', description: 'Doce de leite e paçoca.', price: 50, type: 'pizza', image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?q=80&w=400&auto=format&fit=crop', visualPattern: 'dulce', patternColors: { primary: '#d4a574', secondary: '#c2a060' } },
            { id: '13', name: 'Prestígio', description: 'Creme de leite, chocolate e coco ralado.', price: 50, type: 'pizza', image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?q=80&w=400&auto=format&fit=crop', visualPattern: 'coconut', patternColors: { primary: '#5c3d2e', secondary: '#f8f9fa' } },
        ]
    },
    {
        id: 'premium',
        title: 'Linha Premium',
        items: [
            { id: '20', name: 'Quatro Queijos', description: 'Molho de tomate, muçarela, catupiry, gorgonzola, provolone e orégano.', price: 57, type: 'pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop', visualPattern: 'cheese', patternColors: { primary: '#fcc419', secondary: '#fff4e6' } },
            { id: '21', name: 'Camarão', description: 'Molho de tomate, muçarela, camarão ao alho e óleo, catupiry e orégano.', price: 60, type: 'pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&auto=format&fit=crop', visualPattern: 'shrimp', patternColors: { primary: '#ffa8a8', secondary: '#ff6b6b' } },
            { id: '22', name: 'Camarão Oriental', description: 'Molho de tomate, muçarela, camarão, cream cheese, molho tarê, orégano e gergelim preto.', price: 65, type: 'pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&auto=format&fit=crop', visualPattern: 'shrimp', patternColors: { primary: '#ffa8a8', secondary: '#212529' } },
            { id: '23', name: 'Carne Seca com Banana', description: 'Molho de tomate, muçarela, carne seca, banana da terra, cebola, tomate e orégano.', price: 57, type: 'pizza', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=400&auto=format&fit=crop', visualPattern: 'meat', patternColors: { primary: '#8b4513', secondary: '#fcc419' } },
            { id: '24', name: 'Jeitinho Baiano', description: 'Molho de tomate, muçarela, frango, milho, bacon, creme de alho, orégano e batata palha.', price: 57, type: 'pizza', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400&auto=format&fit=crop', visualPattern: 'chicken', patternColors: { primary: '#ffc078', secondary: '#fcc419' } },
            { id: '25', name: 'Bacon Crocante', description: 'Molho de tomate, muçarela, bacon, creme de alho, orégano e batata palha.', price: 57, type: 'pizza', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=400&auto=format&fit=crop', visualPattern: 'bacon', patternColors: { primary: '#8b4513', secondary: '#5c3317' } },
            { id: '26', name: 'Lombinho Canadense', description: 'Molho de tomate, muçarela, lombinho fatiado, requeijão cremoso, cebola e orégano.', price: 57, type: 'pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop', visualPattern: 'ham', patternColors: { primary: '#d4a574', secondary: '#fff4e6' } },
            { id: '27', name: 'Frango Oriental', description: 'Molho de tomate, muçarela, frango, cream cheese, molho tarê e gergelim preto.', price: 65, type: 'pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&auto=format&fit=crop', visualPattern: 'chicken', patternColors: { primary: '#ffc078', secondary: '#212529' } },
            { id: '28', name: 'Peito de Peru', description: 'Molho de tomate, muçarela, peito de peru, requeijão cremoso e orégano.', price: 57, type: 'pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop', visualPattern: 'ham', patternColors: { primary: '#f8f9fa', secondary: '#ced4da' } },
            { id: '29', name: 'Americano', description: 'Molho de tomate, bacon, muçarela, milho, ovos e orégano.', price: 57, type: 'pizza', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=400&auto=format&fit=crop', visualPattern: 'bacon', patternColors: { primary: '#8b4513', secondary: '#fcc419' } },
            { id: '30', name: 'Do Chef', description: 'Molho de tomate, muçarela, calabresa triturada, bacon e carne do sol.', price: 57, type: 'pizza', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400&auto=format&fit=crop', visualPattern: 'meat', patternColors: { primary: '#c92a2a', secondary: '#8b4513' } },
            { id: '31', name: 'Palmito', description: 'Molho de tomate, muçarela, palmito e orégano.', price: 57, type: 'pizza', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=400&auto=format&fit=crop', visualPattern: 'palmito', patternColors: { primary: '#f8f9fa', secondary: '#ced4da' } },
            { id: '32', name: 'Paulista', description: 'Molho de tomate, presunto, palmito, muçarela por cima e orégano.', price: 57, type: 'pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop', visualPattern: 'ham', patternColors: { primary: '#fab5c5', secondary: '#f8f9fa' } },
            { id: '33', name: 'Tomate Seco', description: 'Muçarela, molho de tomate, tomate seco e orégano.', price: 57, type: 'pizza', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400&auto=format&fit=crop', visualPattern: 'basil', patternColors: { primary: '#c92a2a', secondary: '#862e2e' } },
            { id: '34', name: 'Três Carnes', description: 'Molho de tomate, muçarela, presunto, calabresa triturada e frango, tomate, cebola, catupiry e orégano.', price: 57, type: 'pizza', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=400&auto=format&fit=crop', visualPattern: 'meat', patternColors: { primary: '#c92a2a', secondary: '#ffc078' } },
            { id: '35', name: 'Moda da Casa 2', description: 'Molho de tomate, muçarela, calabresa ou lombinho, bacon, cebola, molho de goiabada e orégano.', price: 57, type: 'pizza', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400&auto=format&fit=crop', visualPattern: 'bacon', patternColors: { primary: '#c92a2a', secondary: '#e64980' } },
        ]
    },
    {
        id: 'bebidas',
        title: 'Bebidas',
        items: [
            { id: 'beb1', name: 'Refrigerante 1L', description: 'Coca-Cola, Antártica ou Pepsi.', price: 9, type: 'drink', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop' },
            { id: 'beb2', name: 'Heineken 600ml', description: 'Cerveja premium importada.', price: 20, type: 'drink', image: 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?q=80&w=400&auto=format&fit=crop' },
            { id: 'beb3', name: 'Stella Artois 600ml', description: 'Cerveja belga premium.', price: 17, type: 'drink', image: 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?q=80&w=400&auto=format&fit=crop' },
            { id: 'beb4', name: 'Heineken Long Neck', description: 'Cerveja 330ml.', price: 10, type: 'drink', image: 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?q=80&w=400&auto=format&fit=crop' },
            { id: 'beb5', name: 'Amstel Lata', description: 'Cerveja 350ml.', price: 6, type: 'drink', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop' },
        ]
    }
];

// Helper to get all pizzas flattened
export const getAllPizzas = (): Product[] => {
    return menu
        .flatMap(cat => cat.items)
        .filter(p => p.type === 'pizza');
};

// Get pizzas by category
export const getPizzasByCategory = (): { category: string; items: Product[] }[] => {
    return menu
        .filter(cat => cat.id !== 'bebidas')
        .map(cat => ({
            category: cat.title,
            items: cat.items
        }));
};
