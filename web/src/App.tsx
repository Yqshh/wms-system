import { useEffect, useState } from 'react';
import { Package, Plus, Layers, LayoutDashboard, Search, Database } from 'lucide-react';

// Описываем структуру данных (TypeScript интерфейс). 
// Для программиста на Python/1C это аналог жесткой типизации полей объекта или реквизитов справочника.
interface Nomenclature {
  id: number;
  sku: string;
  name: string;
  unit: string;
}

export default function App() {
  // Состояния компонента (переменные, которые при изменении заставляют экран перерисовываться)
  const [items, setItems] = useState<Nomenclature[]>([]);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('шт');

  // Функция запроса данных с бэкенда (аналог GET-запроса к HTTP-сервису 1С или API на Python)
  const fetchNomenclature = async () => {
    try {
      const res = await fetch('/api/nomenclature');
      const data = await res.json();
      if (data) setItems(data);
    } catch (err) {
      console.error('Failed to fetch nomenclature', err);
    }
  };

  // useEffect с пустым массивом [] срабатывает ровно один раз при загрузке страницы.
  // Аналог события «ПриОткрытии» в 1С или хука инициализации в Python.
  useEffect(() => {
    fetchNomenclature();
  }, []);

  // Обработчик отправки формы (создание товара)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Отменяем стандартное поведение браузера (чтобы страница не перезагружалась)
    if (!sku || !name) return;

    try {
      const res = await fetch('/api/nomenclature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, name, unit }),
      });

      if (res.ok) {
        setSku(''); // Очищаем поля ввода
        setName('');
        fetchNomenclature(); // Перезапрашиваем список, чтобы увидеть новый товар в таблице
      }
    } catch (err) {
      console.error('Failed to create item', err);
    }
  };

  return (
    // Главный контейнер на весь экран: темный фон, белый текст
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans">
      
      {/* 1. БОКОВОЕ МЕНЮ (SIDEBAR) */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-zinc-800">
          <div className="bg-orange-600 p-2 rounded-lg text-white shadow-lg shadow-orange-600/20">
            <Package className="w-6 h-6" />
          </div>
          <span className="font-bold text-lg tracking-wider text-orange-500">WMS СКЛАД</span>
        </div>
        
        <nav className="p-4 space-y-2 flex-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-600 text-white font-medium shadow-md shadow-orange-600/10">
            <LayoutDashboard className="w-5 h-5" /> Номенклатура
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition">
            <Layers className="w-5 h-5" /> Ячейки хранения
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition">
            <Database className="w-5 h-5" /> Остатки
          </a>
        </nav>
        
        <div className="p-4 border-t border-zinc-800 text-xs text-zinc-500">
          Стек: Go + PostgreSQL 18 + TypeScript
        </div>
      </aside>

      {/* 2. ОСНОВНАЯ ОБЛАСТЬ СПРАВА */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Шапка */}
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-zinc-200">Управление номенклатурой</h2>
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Поиск по артикулу..." 
              className="bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-orange-500 w-64 transition"
            />
          </div>
        </header>

        {/* Прокручиваемый контент */}
        <div className="flex-1 overflow-auto p-8 space-y-6">
          
          {/* Блок статистики (KPI карточки) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-sm">
              <p className="text-sm text-zinc-400">Всего позиций в базе</p>
              <p className="text-3xl font-bold text-orange-500 mt-2">{items.length}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-sm">
              <p className="text-sm text-zinc-400">Статус интеграции 1С</p>
              <p className="text-xl font-semibold text-emerald-500 mt-2 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span> Подключено
              </p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-sm">
              <p className="text-sm text-zinc-400">Режим работы</p>
              <p className="text-xl font-semibold text-zinc-200 mt-2">Адресный склад</p>
            </div>
          </div>

          {/* Форма добавления нового товара */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-zinc-200">Добавить номенклатуру</h3>
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Артикул (SKU)"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg flex-1 min-w-[200px] text-zinc-200 focus:outline-none focus:border-orange-500"
                required
              />
              <input
                type="text"
                placeholder="Наименование товара"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg flex-2 min-w-[250px] text-zinc-200 focus:outline-none focus:border-orange-500"
                required
              />
              <input
                type="text"
                placeholder="Ед. изм."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg w-28 text-zinc-200 focus:outline-none focus:border-orange-500 text-center"
              />
              <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white font-medium px-6 py-2.5 rounded-lg transition flex items-center gap-2 shadow-lg shadow-orange-600/20 cursor-pointer">
                <Plus className="w-5 h-5" /> Добавить
              </button>
            </form>
          </div>

          {/* Таблица данных */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 text-sm">
                  <th className="p-4">ID</th>
                  <th className="p-4">Артикул (SKU)</th>
                  <th className="p-4">Наименование</th>
                  <th className="p-4">Ед. изм.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-zinc-500">Нет данных о товарах</td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/50 transition">
                      <td className="p-4 text-zinc-400 font-mono">#{item.id}</td>
                      <td className="p-4 font-mono text-orange-400 font-medium">{item.sku}</td>
                      <td className="p-4 text-zinc-200">{item.name}</td>
                      <td className="p-4 text-zinc-400">{item.unit}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}