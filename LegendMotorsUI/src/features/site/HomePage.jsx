import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpLeft, MapPin } from "lucide-react";
import { ProductCard } from "../components/ProductCard.jsx";
import { categories, defaultHeroCopy, imagery, products } from "../data/catalog.js";
import heroFabric from "../assets/fabric.jpg";

export function HomePage() {
  const [activeSlug, setActiveSlug] = useState(null);
  const [showcasedSlug, setShowcasedSlug] = useState(categories[0].slug);
  const activeCategory = categories.find((category) => category.slug === activeSlug);
  const showcasedCategory = categories.find((category) => category.slug === showcasedSlug) ?? categories[0];
  const heroCopy = activeCategory
    ? {
        title: activeCategory.heroTitle,
        description: activeCategory.heroDescription,
        ghost: activeCategory.ghost,
        href: activeCategory.href,
        cta: `تصفحي ${activeCategory.nameAr}`,
      }
    : defaultHeroCopy;

  const featuredProducts = useMemo(() => products.filter((product) => product.isFeatured).slice(0, 3), []);

  const activateCategory = (slug) => {
    setActiveSlug(slug);
    setShowcasedSlug(slug);
  };

  const activateBeforeMobileNavigation = (event, slug) => {
    const shouldPreviewOnly = window.matchMedia("(hover: none), (pointer: coarse), (max-width: 980px)").matches;
    if (shouldPreviewOnly && activeSlug !== slug) {
      event.preventDefault();
      activateCategory(slug);
    }
  };

  return (
    <>
      <section id="top" className="campaign-hero" onMouseLeave={() => setActiveSlug(null)}>
        <span
          className="campaign-hero__fabric-background"
          style={{ "--fabric-image": `url(${heroFabric})` }}
          aria-hidden="true"
        />
        <span className="campaign-hero__grain" aria-hidden="true" />
        <div className="campaign-hero__active-visual" key={showcasedCategory.slug} aria-hidden="true">
          <img src={showcasedCategory.image} alt="" />
        </div>
        <div className="site-container campaign-hero__inner">
          <div className="campaign-hero__copy">
            <span className="campaign-hero__latin">WAQAAR ATELIER</span>
            <h1>وقار</h1>
            <div className="campaign-hero__dynamic" key={heroCopy.title}>
              <h2>{heroCopy.title}</h2>
              <p>{heroCopy.description}</p>
            </div>
            <Link className="editorial-link" to={heroCopy.href}>
              <span>{heroCopy.cta}</span>
              <ArrowUpLeft aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className={`category-lineup${activeSlug ? " has-active" : ""}`} aria-label="تصنيفات العبايات">
          {categories.map((category, index) => (
            <Link
              className={[
                "category-lineup__item",
                activeSlug === category.slug ? "is-active" : "",
                activeSlug && activeSlug !== category.slug ? "is-muted" : "",
              ].filter(Boolean).join(" ")}
              to={category.href}
              key={category.slug}
              aria-current={activeSlug === category.slug ? "true" : undefined}
              onFocus={() => activateCategory(category.slug)}
              onClick={(event) => activateBeforeMobileNavigation(event, category.slug)}
              onMouseEnter={() => activateCategory(category.slug)}
              style={{
                "--model-height": `${category.visual.height}px`,
                "--model-y": `${category.visual.y}px`,
                "--model-scale": category.visual.scale,
                "--model-x": `${category.visual.x}px`,
                "--model-flip": category.visual.flip ? -1 : 1,
                "--reveal-delay": `${index * 85}ms`,
              }}
            >
              <span className="category-lineup__figure">
                <img src={category.image} alt="" />
              </span>
              <span className="category-lineup__dot" aria-hidden="true" />
              <span className="category-lineup__label">
                <small>0{index + 1}</small>
                <strong>{category.nameAr}</strong>
                <em>{category.nameEn.toUpperCase()}</em>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured-section">
        <div className="site-container">
          <div className="section-kicker">مختارات وقار</div>
          <div className="section-heading-row">
            <h2>قطع أولى للموسم</h2>
            <Link className="text-command" to="/shop">
              <span>عرض الكل</span>
              <ArrowUpLeft aria-hidden="true" />
            </Link>
          </div>
          <div className="featured-grid">
            {featuredProducts.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        </div>
      </section>

      <section id="story" className="story-section">
        <div className="site-container story-section__grid">
          <div className="story-section__image">
            <img src={imagery.abayaPair} alt="عبايات وقار بألوان هادئة" loading="lazy" />
          </div>
          <div className="story-section__copy">
            <span className="section-kicker">قصتنا</span>
            <h2>فخامة هادئة، مصممة للمرأة التي تعرف نفسها.</h2>
            <p>
              وقار علامة عبايات عربية تبدأ من فكرة بسيطة: الأناقة لا تحتاج إلى ضجيج.
              نختار القصات المريحة، الألوان العميقة، والتفاصيل التي تظهر عند الاقتراب.
            </p>
            <p>
              هذا النموذج الأولي يعرض اتجاه المتجر وتجربة التصفح، بينما يمكن استبدال الصور
              والمنتجات بسهولة مع جاهزية بياناتك الخلفية.
            </p>
          </div>
        </div>
      </section>

      <section id="location" className="location-section">
        <div className="site-container location-section__grid">
          <div>
            <span className="section-kicker">الموقع</span>
            <h2>زيارة هادئة لاختيار القطعة الأقرب لك.</h2>
          </div>
          <div className="location-panel">
            <MapPin aria-hidden="true" />
            <dl>
              <div>
                <dt>المدينة</dt>
                <dd>رام الله، فلسطين</dd>
              </div>
              <div>
                <dt>العنوان</dt>
                <dd>العنوان التفصيلي يضاف لاحقاً</dd>
              </div>
              <div>
                <dt>ساعات العمل</dt>
                <dd>السبت - الخميس، 11:00 ص - 8:00 م</dd>
              </div>
            </dl>
            <a className="editorial-link editorial-link--dark" href="https://maps.google.com/" target="_blank" rel="noreferrer">
              <span>Google Maps</span>
              <ArrowUpLeft aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
