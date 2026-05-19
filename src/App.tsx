import { useState, useEffect } from "react";
import "./styles.css";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
};

const STORAGE_KEY = "ec-shop-products";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function loadProducts(): Product[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

const CATEGORIES = ["食品", "衣類", "電子機器", "家具", "書籍", "その他"];

export default function App() {
  const [products, setProducts] = useState<Product[]>(loadProducts);
  const [showForm, setShowForm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: CATEGORIES[0],
    description: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  function handleFormChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = form.name.trim();
    const price = Number(form.price);
    if (!name) {
      setFormError("商品名を入力してください。");
      return;
    }
    if (!form.price || isNaN(price) || price < 0) {
      setFormError("正しい価格を入力してください。");
      return;
    }
    const newProduct: Product = {
      id: generateId(),
      name,
      price,
      category: form.category,
      description: form.description.trim(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    setForm({ name: "", price: "", category: CATEGORIES[0], description: "" });
    setShowForm(false);
  }

  function handleDelete(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteTargetId(null);
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="header-title">商品管理</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setFormError(null);
          }}
        >
          + 商品を登録
        </button>
      </header>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">商品登録</h2>
            <form onSubmit={handleSubmit} className="form">
              <label className="form-label">
                商品名 <span className="required">*</span>
              </label>
              <input
                className="form-input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="例: Tシャツ"
                maxLength={100}
              />

              <label className="form-label">
                価格 (円) <span className="required">*</span>
              </label>
              <input
                className="form-input"
                type="number"
                name="price"
                value={form.price}
                onChange={handleFormChange}
                placeholder="例: 2980"
                min="0"
              />

              <label className="form-label">カテゴリ</label>
              <select
                className="form-input"
                name="category"
                value={form.category}
                onChange={handleFormChange}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <label className="form-label">説明</label>
              <textarea
                className="form-input form-textarea"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="商品の説明を入力"
                rows={3}
                maxLength={300}
              />

              {formError && <p className="form-error">{formError}</p>}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  登録する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTargetId && (
        <div className="modal-overlay" onClick={() => setDeleteTargetId(null)}>
          <div
            className="modal modal-confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">削除の確認</h2>
            <p className="confirm-message">
              「{products.find((p) => p.id === deleteTargetId)?.name}
              」を削除してもよろしいですか？
            </p>
            <div className="form-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteTargetId(null)}
              >
                キャンセル
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(deleteTargetId)}
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="main">
        {products.length === 0 ? (
          <div className="empty">
            <p className="empty-text">商品が登録されていません。</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              最初の商品を登録する
            </button>
          </div>
        ) : (
          <>
            <p className="product-count">{products.length} 件の商品</p>
            <div className="product-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-card-body">
                    <span className="product-category">{product.category}</span>
                    <h2 className="product-name">{product.name}</h2>
                    <p className="product-price">
                      ¥{product.price.toLocaleString()}
                    </p>
                    {product.description && (
                      <p className="product-description">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <button
                    className="btn btn-danger btn-delete"
                    onClick={() => setDeleteTargetId(product.id)}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
