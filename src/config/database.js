// Database configuration and schemas
export const databaseConfig = {
  // Database connection settings
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'gift-card',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  
  // Table schemas
  tables: {
    gift_cards: {
      name: 'gift_cards',
      columns: [
        { name: 'id', type: 'INT', primary: true, auto_increment: true },
        { name: 'title', type: 'VARCHAR(255)', not_null: true },
        { name: 'category', type: 'VARCHAR(100)', not_null: true },
        { name: 'category_name', type: 'VARCHAR(255)', not_null: true },
        { name: 'sku', type: 'VARCHAR(50)', unique: true, not_null: true },
        { name: 'stock', type: 'VARCHAR(50)', default: 'EN STOCK' },
        { name: 'price', type: 'DECIMAL(10,2)', not_null: true },
        { name: 'icon', type: 'VARCHAR(10)', default: '🎁' },
        { name: 'background_color', type: 'VARCHAR(50)', default: 'bg-green-500' },
        { name: 'badge_color', type: 'VARCHAR(50)', default: 'bg-yellow-400' },
        { name: 'description', type: 'TEXT' },
        { name: 'created_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
      ]
    },
    
    orders: {
      name: 'orders',
      columns: [
        { name: 'id', type: 'INT', primary: true, auto_increment: true },
        { name: 'numero_orden', type: 'VARCHAR(50)', unique: true, not_null: true },
        { name: 'email_comprador', type: 'VARCHAR(255)', not_null: true },
        { name: 'nombre_comprador', type: 'VARCHAR(255)', not_null: true },
        { name: 'total', type: 'DECIMAL(10,2)', not_null: true },
        { name: 'estado', type: 'ENUM("pendiente", "pagado", "enviado", "cancelado")', default: 'pendiente' },
        { name: 'fecha_orden', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        { name: 'fecha_pago', type: 'TIMESTAMP', null: true },
        { name: 'metodo_pago', type: 'VARCHAR(100)' },
        { name: 'gift_card_id', type: 'INT', not_null: true },
        { name: 'cantidad', type: 'INT', not_null: true, default: 1 },
        { name: 'monto_unitario', type: 'DECIMAL(10,2)', not_null: true },
        { name: 'beneficiarios', type: 'JSON' },
        { name: 'mensaje_personalizado', type: 'TEXT' },
        { name: 'texto_adicional', type: 'TEXT' },
        { name: 'fecha_inicio', type: 'DATE' },
        { name: 'fecha_vencimiento', type: 'DATE' },
        { name: 'destinatario', type: 'ENUM("self", "others")', default: 'self' },
        { name: 'created_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
      ],
      foreign_keys: [
        { column: 'gift_card_id', references: 'gift_cards(id)' }
      ]
    },
    
    beneficiaries: {
      name: 'beneficiaries',
      columns: [
        { name: 'id', type: 'INT', primary: true, auto_increment: true },
        { name: 'order_id', type: 'INT', not_null: true },
        { name: 'name', type: 'VARCHAR(255)', not_null: true },
        { name: 'email', type: 'VARCHAR(255)' },
        { name: 'phone', type: 'VARCHAR(50)' },
        { name: 'birthday', type: 'DATE' },
        { name: 'special_events', type: 'TEXT' },
        { name: 'created_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
      ],
      foreign_keys: [
        { column: 'order_id', references: 'orders(id)' }
      ]
    }
  },
  
  // Sample data for development
  sampleData: {
    gift_cards: [
      {
        title: 'Gift Card Explosión de Juegos',
        category: 'todas',
        category_name: 'Toda ocasión',
        sku: '30000085',
        stock: 'EN STOCK',
        price: 10000,
        icon: '🎮',
        background_color: 'bg-green-500',
        badge_color: 'bg-yellow-400',
        description: 'Tu regalo perfecto te está esperando'
      },
      {
        title: 'Gift Card Amor y Romance',
        category: 'amor',
        category_name: 'Amor',
        sku: '30000086',
        stock: 'EN STOCK',
        price: 15000,
        icon: '💕',
        background_color: 'bg-pink-500',
        badge_color: 'bg-red-400',
        description: 'Expresa tu amor de la manera más especial'
      },
      {
        title: 'Gift Card Cumpleaños',
        category: 'cumpleanos',
        category_name: 'Cumpleaños',
        sku: '30000087',
        stock: 'EN STOCK',
        price: 20000,
        icon: '🎂',
        background_color: 'bg-blue-500',
        badge_color: 'bg-purple-400',
        description: 'Celebra cada año de vida con estilo'
      }
    ]
  }
};

// SQL scripts for creating tables
export const createTableScripts = {
  gift_cards: `
    CREATE TABLE IF NOT EXISTS gift_cards (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      category_name VARCHAR(255) NOT NULL,
      sku VARCHAR(50) UNIQUE NOT NULL,
      stock VARCHAR(50) DEFAULT 'EN STOCK',
      price DECIMAL(10,2) NOT NULL,
      icon VARCHAR(10) DEFAULT '🎁',
      background_color VARCHAR(50) DEFAULT 'bg-green-500',
      badge_color VARCHAR(50) DEFAULT 'bg-yellow-400',
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `,
  
  orders: `
    CREATE TABLE IF NOT EXISTS orders (
      id INT PRIMARY KEY AUTO_INCREMENT,
      numero_orden VARCHAR(50) UNIQUE NOT NULL,
      email_comprador VARCHAR(255) NOT NULL,
      nombre_comprador VARCHAR(255) NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      estado ENUM('pendiente', 'pagado', 'enviado', 'cancelado') DEFAULT 'pendiente',
      fecha_orden TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_pago TIMESTAMP NULL,
      metodo_pago VARCHAR(100),
      gift_card_id INT NOT NULL,
      cantidad INT NOT NULL DEFAULT 1,
      monto_unitario DECIMAL(10,2) NOT NULL,
      beneficiarios JSON,
      mensaje_personalizado TEXT,
      texto_adicional TEXT,
      fecha_inicio DATE,
      fecha_vencimiento DATE,
      destinatario ENUM('self', 'others') DEFAULT 'self',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (gift_card_id) REFERENCES gift_cards(id)
    )
  `,
  
  beneficiaries: `
    CREATE TABLE IF NOT EXISTS beneficiaries (
      id INT PRIMARY KEY AUTO_INCREMENT,
      order_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      birthday DATE,
      special_events TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `
};
