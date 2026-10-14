-- 1. Номенклатура (справочник товаров)
CREATE TABLE IF NOT EXISTS nomenclature (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,      -- Артикул / Код товара
    name VARCHAR(255) NOT NULL,            -- Наименование
    unit VARCHAR(50) DEFAULT 'шт'          -- Единица измерения (шт, кг и т.д.)
);

-- 2. Партии товаров
CREATE TABLE IF NOT EXISTS batches (
    id SERIAL PRIMARY KEY,
    nomenclature_id INT REFERENCES nomenclature(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL,    -- Номер партии / штрихкод партии
    manufacture_date DATE                  -- Дата производства (опционально)
);

-- 3. Ячейки хранения (адресный склад)
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,     -- Адрес ячейки (например, A-01-02-3)
    zone VARCHAR(50) NOT NULL              -- Зона (приемка, хранение, отгрузка, брак)
);

-- 4. Остатки (где, сколько и какая партия хранится)
CREATE TABLE IF NOT EXISTS stock_balances (
    id SERIAL PRIMARY KEY,
    nomenclature_id INT REFERENCES nomenclature(id) ON DELETE CASCADE,
    batch_id INT REFERENCES batches(id) ON DELETE CASCADE,
    location_id INT REFERENCES locations(id) ON DELETE CASCADE,
    quantity DECIMAL(12, 3) NOT NULL DEFAULT 0, -- Количество товара
    -- Уникальный индекс, чтобы товар конкретной партии в конкретной ячейке был в одной строке
    UNIQUE(nomenclature_id, batch_id, location_id)
);

-- 5. Журнал складских движений (история документов)
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id SERIAL PRIMARY KEY,
    doc_type VARCHAR(50) NOT NULL,         -- 'RECEIPT' (приход), 'SHIPMENT' (расход), 'MOVE' (перемещение)
    nomenclature_id INT REFERENCES nomenclature(id),
    batch_id INT REFERENCES batches(id),
    from_location_id INT REFERENCES locations(id), -- Откуда (NULL для прихода из 1С)
    to_location_id INT REFERENCES locations(id),   -- Куда (NULL для отгрузки)
    quantity DECIMAL(12, 3) NOT NULL,      -- Количество
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);