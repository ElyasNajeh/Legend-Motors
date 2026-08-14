import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowUpDown, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "../components/ProductCard.jsx";
import { categories, colors, products, sizes } from "../data/catalog.js";

const sortOptions = [
  { value: "newest", label: "الأحدث" },
  { value: "price-asc", label: "السعر الأقل" },
  { value: "price-desc", label: "السعر الأعلى" },
];

const categoryOptions = [
  { slug: "all", label: "الكل", ghost: "عباية" },
  ...categories.map((item) => ({ slug: item.slug, label: item.label, ghost: item.ghost })),
];

const shopImages = categories.map((item) => item.image);
const shopImageByProductId = new Map(products.map((product, index) => [product.id, shopImages[index % shopImages.length]]));

function hasSize(product, size) {
  return size === "all" || product.variants.some((variant) => variant.sizeName === size && variant.stock > 0);
}

function hasColor(product, colorSlug) {
  if (colorSlug === "all") return true;
  const color = colors.find((item) => item.slug === colorSlug);
  return product.variants.some((variant) => variant.colorId === color?.id && variant.stock > 0);
}

function sortProducts(items, sort) {
  const sorted = [...items];
  if (sort === "price-asc") return sorted.sort((first, second) => first.price - second.price);
  if (sort === "price-desc") return sorted.sort((first, second) => second.price - first.price);
  return sorted.sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
}

function optionClass(isActive, extraClass) {
  return ["atelier-option", extraClass, isActive ? "is-active" : ""].filter(Boolean).join(" ");
}

function AtelierDropdown({ id, label, value, activeFilter, setActiveFilter, children }) {
  const isOpen = activeFilter === id;
  const panelId = `atelier-${id}-panel`;

  return (
    <div className={`atelier-control atelier-control--${id}${isOpen ? " is-open" : ""}`}>
      <button
        className="atelier-trigger"
        type="button"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => setActiveFilter(isOpen ? null : id)}
      >
        <span>{label}</span>
        <strong>{value}</strong>
        <ChevronDown aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="atelier-filter-panel" id={panelId} role="dialog" aria-label={label}>
          <div className="atelier-filter-panel__header">
            <span>{label}</span>
            <button type="button" aria-label={`إغلاق ${label}`} onClick={() => setActiveFilter(null)}>
              <X aria-hidden="true" />
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(searchParams.get("category") ?? "all");
  const [size, setSize] = useState("all");
  const [color, setColor] = useState("all");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    setCategory(searchParams.get("category") ?? "all");
  }, [searchParams]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setActiveFilter(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const filtered = products.filter((product) => {
      const matchesCategory = category === "all" || product.categorySlug === category;
      const matchesSize = hasSize(product, size);
      const matchesColor = hasColor(product, color);
      const matchesSearch = !query || [product.nameAr, product.nameEn, product.descriptionAr]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query);

      return matchesCategory && matchesSize && matchesColor && matchesSearch;
    });

    return sortProducts(filtered, sort);
  }, [category, color, search, size, sort]);

  const currentCategory = categoryOptions.find((item) => item.slug === category) ?? categoryOptions[0];
  const currentColor = colors.find((item) => item.slug === color);
  const currentSort = sortOptions.find((item) => item.value === sort) ?? sortOptions[0];
  const hasActiveFilters = category !== "all" || size !== "all" || color !== "all" || search.trim();
  const collectionTitle = category === "all" ? "كل العبايات" : currentCategory.label;
  const productCountLabel = `${visibleProducts.length} قطع مختارة`;

  const chooseCategory = (slug, closePanel = true) => {
    setCategory(slug);
    setSearchParams(slug === "all" ? {} : { category: slug }, { replace: true });
    if (closePanel) setActiveFilter(null);
  };

  const chooseSize = (value, closePanel = true) => {
    setSize(value);
    if (closePanel) setActiveFilter(null);
  };

  const chooseColor = (value, closePanel = true) => {
    setColor(value);
    if (closePanel) setActiveFilter(null);
  };

  const chooseSort = (value, closePanel = true) => {
    setSort(value);
    if (closePanel) setActiveFilter(null);
  };

  const clearFilters = (closePanel = true) => {
    setSize("all");
    setColor("all");
    setSearch("");
    chooseCategory("all", closePanel);
  };

  return (
    <div className="shop-page" id="top">
      <header className="shop-hero site-container">
        <span className="shop-hero__curve" aria-hidden="true" />
        <span className="shop-hero__eyebrow">المجموعة</span>
        <h1>عبايات وقار</h1>
        <span className="shop-hero__stitch" aria-hidden="true">
          <span />
          <i />
          <span />
        </span>
        <p>عبايات تنسدل بهدوء، بتفاصيل مطرزة وخيارات مختارة كأنها قائمة أقمشة في مشغل صغير.</p>
      </header>

      <section className="shop-shell site-container">
        <div className="shop-toolbar">
          <label className="shop-search" htmlFor="shop-search">
            <Search aria-hidden="true" />
            <input
              id="shop-search"
              type="search"
              placeholder="ابحثي باسم العباية"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <div className={`shop-filter-scrim${activeFilter ? " is-visible" : ""}`} onClick={() => setActiveFilter(null)} />

          <div className="atelier-filter-bar" aria-label="تصفية المجموعة">
            <AtelierDropdown
              id="category"
              label="التصنيف"
              value={currentCategory.label}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            >
              <div className="atelier-options atelier-options--category">
                {categoryOptions.map((item) => (
                  <button
                    className={optionClass(category === item.slug)}
                    type="button"
                    key={item.slug}
                    onClick={() => chooseCategory(item.slug)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </AtelierDropdown>

            <AtelierDropdown
              id="size"
              label="المقاس"
              value={size === "all" ? "كل المقاسات" : size}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            >
              <div className="atelier-options atelier-options--sizes">
                <button className={optionClass(size === "all")} type="button" onClick={() => chooseSize("all")}>
                  الكل
                </button>
                {sizes.map((item) => (
                  <button className={optionClass(size === item)} type="button" key={item} onClick={() => chooseSize(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </AtelierDropdown>

            <AtelierDropdown
              id="color"
              label="اللون"
              value={color === "all" ? "كل الألوان" : currentColor?.nameAr}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            >
              <div className="atelier-options atelier-options--colors">
                <button className={optionClass(color === "all", "atelier-option--color")} type="button" onClick={() => chooseColor("all")}>
                  <span className="fabric-swatch fabric-swatch--all" aria-hidden="true" />
                  الكل
                </button>
                {colors.map((item) => (
                  <button
                    className={optionClass(color === item.slug, "atelier-option--color")}
                    type="button"
                    key={item.slug}
                    onClick={() => chooseColor(item.slug)}
                  >
                    <span className="fabric-swatch" style={{ "--swatch": item.hex }} aria-hidden="true" />
                    {item.nameAr}
                  </button>
                ))}
              </div>
            </AtelierDropdown>

            <AtelierDropdown
              id="sort"
              label="الترتيب"
              value={currentSort.label}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            >
              <div className="atelier-options atelier-options--sort">
                {sortOptions.map((item) => (
                  <button
                    className={optionClass(sort === item.value)}
                    type="button"
                    key={item.value}
                    onClick={() => chooseSort(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </AtelierDropdown>

            {hasActiveFilters ? (
              <button className="atelier-clear" type="button" onClick={clearFilters}>
                مسح
              </button>
            ) : null}
          </div>

          <div className="mobile-filter-actions" aria-label="خيارات التصفية والترتيب">
            <button type="button" onClick={() => setActiveFilter("filters")}>
              <SlidersHorizontal aria-hidden="true" />
              <span>التصفية</span>
            </button>
            <button type="button" onClick={() => setActiveFilter("mobile-sort")}>
              <ArrowUpDown aria-hidden="true" />
              <span>الترتيب</span>
            </button>
          </div>

          {activeFilter === "filters" ? (
            <div className="mobile-filter-sheet" role="dialog" aria-modal="true" aria-label="التصفية">
              <div className="mobile-filter-sheet__header">
                <span>التصفية</span>
                <button type="button" aria-label="إغلاق التصفية" onClick={() => setActiveFilter(null)}>
                  <X aria-hidden="true" />
                </button>
              </div>

              <div className="mobile-filter-sheet__body">
                <section className="mobile-filter-section">
                  <h3>التصنيف</h3>
                  <div className="mobile-filter-options">
                    {categoryOptions.map((item) => (
                      <button
                        className={optionClass(category === item.slug)}
                        type="button"
                        key={item.slug}
                        onClick={() => chooseCategory(item.slug, false)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="mobile-filter-section">
                  <h3>المقاس</h3>
                  <div className="mobile-filter-options mobile-filter-options--sizes">
                    <button className={optionClass(size === "all")} type="button" onClick={() => chooseSize("all", false)}>
                      الكل
                    </button>
                    {sizes.map((item) => (
                      <button className={optionClass(size === item)} type="button" key={item} onClick={() => chooseSize(item, false)}>
                        {item}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="mobile-filter-section">
                  <h3>اللون</h3>
                  <div className="mobile-filter-options mobile-filter-options--colors">
                    <button className={optionClass(color === "all", "atelier-option--color")} type="button" onClick={() => chooseColor("all", false)}>
                      <span className="fabric-swatch fabric-swatch--all" aria-hidden="true" />
                      الكل
                    </button>
                    {colors.map((item) => (
                      <button
                        className={optionClass(color === item.slug, "atelier-option--color")}
                        type="button"
                        key={item.slug}
                        onClick={() => chooseColor(item.slug, false)}
                      >
                        <span className="fabric-swatch" style={{ "--swatch": item.hex }} aria-hidden="true" />
                        {item.nameAr}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <div className="mobile-filter-sheet__footer">
                <button className="mobile-filter-clear" type="button" onClick={() => clearFilters(false)}>
                  مسح الفلاتر
                </button>
                <button className="mobile-filter-apply" type="button" onClick={() => setActiveFilter(null)}>
                  تطبيق
                </button>
              </div>
            </div>
          ) : null}

          {activeFilter === "mobile-sort" ? (
            <div className="mobile-filter-sheet mobile-filter-sheet--sort" role="dialog" aria-modal="true" aria-label="الترتيب">
              <div className="mobile-filter-sheet__header">
                <span>الترتيب</span>
                <button type="button" aria-label="إغلاق الترتيب" onClick={() => setActiveFilter(null)}>
                  <X aria-hidden="true" />
                </button>
              </div>
              <div className="mobile-filter-options mobile-filter-options--sort">
                {sortOptions.map((item) => (
                  <button
                    className={optionClass(sort === item.value)}
                    type="button"
                    key={item.value}
                    onClick={() => chooseSort(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="shop-content">
          <div className="shop-products" data-editorial-word={currentCategory.ghost ?? "عباية"}>
            <div className="shop-products__heading">
              <h2>{visibleProducts.length ? collectionTitle : "لا توجد نتائج"}</h2>
              <span>{productCountLabel}</span>
            </div>

            {visibleProducts.length ? (
              <div className="product-grid">
                {visibleProducts.map((product) => (
                  <ProductCard
                    product={product}
                    imageOverride={shopImageByProductId.get(product.id)}
                    variant="atelier"
                    key={product.id}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>جرّبي مقاساً أو لوناً آخر من المجموعة.</p>
                <button type="button" onClick={clearFilters}>إعادة ضبط الفلاتر</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
