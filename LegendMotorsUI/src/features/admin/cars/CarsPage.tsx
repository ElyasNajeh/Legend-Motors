import { useState } from "react"
import { getAssetUrl } from "@/shared/api/assets"
import {
  EmptyState,
  LoadableContent,
  PageHeader,
  Pagination,
} from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import { FilterSearch, FilterSelect } from "@/shared/components/DashboardFilters"
import { useI18n } from "@/localization/useI18n"
import { useCars } from "./hooks/useCars"
import { CarFormDialog } from "./components/CarFormDialog"
import type { Car } from "./cars.types"

type EditingCar = Car | null | undefined

export function CarsPage() {
  const cars = useCars()
  const { t, language } = useI18n()
  const [editing, setEditing] = useState<EditingCar>(() =>
    new URLSearchParams(location.search).has("new") ? null : undefined,
  )

  const brandNames = new Map(
    cars.brands.map((brand) => [
      brand.id,
      language === "ar" ? brand.name_ar : brand.name_en,
    ]),
  )

  return (
    <section>
      <PageHeader
        eyebrow={t("admin.pages.carsEyebrow")}
        icon="cars"
        title={t("admin.cars")}
        description={t("admin.pages.carsDescription")}
        actions={
          <button
            className="button"
            disabled={!cars.brands.length}
            onClick={() => setEditing(null)}
          >
            + {t("admin.pages.addCar")}
          </button>
        }
      />

      <div className="filters filters--cars">
        <FilterSearch
          label={t("admin.management.searchCars")}
          placeholder={t("admin.management.searchCars")}
          value={cars.search}
          onValueChange={cars.setSearch}
        />

        <FilterSelect
          label={t("admin.management.filterBrand")}
          value={cars.brandFilter}
          onValueChange={cars.setBrandFilter}
        >
          <option value="">
            {t("admin.management.allBrands")}
          </option>

          {cars.brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {language === "ar" ? brand.name_ar : brand.name_en}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label={t("admin.management.filterType")}
          value={cars.typeFilter}
          onValueChange={cars.setTypeFilter}
        >
          <option value="">
            {t("admin.management.allTypes")}
          </option>
          <option value="normal">
            {t("admin.carTypes.normal")}
          </option>
          <option value="hybrid">
            {t("admin.carTypes.hybrid")}
          </option>
        </FilterSelect>

        <FilterSelect
          label={t("admin.management.filterStatus")}
          value={cars.statusFilter}
          onValueChange={cars.setStatusFilter}
        >
          <option value="">
            {t("admin.management.allStatuses")}
          </option>
          <option value="active">
            {t("admin.common.available")}
          </option>
          <option value="hidden">
            {t("admin.common.hidden")}
          </option>
          <option value="bought">{t("admin.common.bought")}</option>
        </FilterSelect>
      </div>

      <LoadableContent
        loading={cars.loading}
        loadingMessage={t("admin.management.loadingCars")}
        error={cars.error}
        onRetry={() => void cars.reload()}
      >
        {cars.items.length === 0 ? (
          <EmptyState
            title={t("admin.management.noCars")}
            message={
              cars.brands.length
                ? t("admin.management.noCarsMessage")
                : t("admin.management.brandRequired")
            }
            action={
              cars.brands.length ? (
                <button
                  className="button"
                  onClick={() => setEditing(null)}
                >
                  {t("admin.pages.addCar")}
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="table-card">
            <div className="product-table product-table--head car-table">
              <span>{t("admin.management.car")}</span>
              <span>{t("admin.management.brand")}</span>
              <span>{t("admin.management.specs")}</span>
              <span>{t("admin.management.status")}</span>
              <span>{t("admin.management.actions")}</span>
            </div>

            {cars.items.map((car) => (
              <article
                className="product-table car-table"
                key={car.id}
              >
                <div className="product-cell">
                  {car.images[0] ? (
                    <img
                      src={getAssetUrl(car.images[0].image)}
                      alt=""
                    />
                  ) : (
                    <span className="category-table__placeholder">
                      <Icon name="cars" />
                    </span>
                  )}

                  <span>
                    <strong>{car.model}</strong>
                    <small>
                      {car.year} ·{" "}
                      {t(`admin.carTypes.${car.car_type}`)}
                    </small>
                  </span>
                </div>

                <span>
                  {brandNames.get(car.brand_id) ??
                    t("admin.management.unknown")}
                </span>

                <span>
                  <strong>{car.horsepower} HP</strong>
                  <small>
                    {car.engine_cc}
                    {car.is_turbo ? " cc" : ""} ·{" "}
                    {t(
                      `admin.transmissions.${car.transmission}`,
                    )}{" "}
                    · {car.mileage.toLocaleString()} km
                  </small>
                </span>

                <span className="car-status-cell">
                  <span className={`status-badge status-badge--${car.is_bought ? "bought" : "active"}`}>
                    <i />
                    {t(
                      car.is_bought
                        ? "admin.common.bought"
                        : "admin.common.available",
                    )}
                  </span>

                  {!car.is_active && (
                    <span className="status-badge status-badge--hidden">
                      <i />
                      {t("admin.common.hidden")}
                    </span>
                  )}

                  {car.is_featured && (
                    <small className="featured-badge">
                      ★ {t("admin.fields.featured")}
                    </small>
                  )}
                </span>

                <div className="row-actions">
                  <button
                    className="icon-button record-action record-action--edit"
                    title={t("admin.management.edit")}
                    aria-label={t("admin.management.edit")}
                    onClick={() => setEditing(car)}
                  >
                    <Icon name="edit" />
                  </button>

                  <button
                    className={`icon-button record-action record-action--visibility${car.is_active ? "" : " is-active"}`}
                    title={t(
                      car.is_active
                        ? "admin.management.hide"
                        : "admin.management.show",
                    )}
                    aria-label={t(
                      car.is_active
                        ? "admin.management.hide"
                        : "admin.management.show",
                    )}
                    aria-pressed={!car.is_active}
                    onClick={() => void cars.toggleVisibility(car)}
                  >
                    <Icon name={car.is_active ? "eye" : "eyeOff"} />
                  </button>

                  <button
                    className={`icon-button record-action record-action--bought${car.is_bought ? " is-active" : ""}`}
                    title={t(
                      car.is_bought
                        ? "admin.management.markAvailable"
                        : "admin.management.markBought",
                    )}
                    aria-label={t(
                      car.is_bought
                        ? "admin.management.markAvailable"
                        : "admin.management.markBought",
                    )}
                    aria-pressed={car.is_bought}
                    onClick={() => void cars.toggleBought(car)}
                  >
                    <Icon name="check" />
                  </button>

                  <button
                    className={`icon-button record-action record-action--featured${car.is_featured ? " is-active" : ""}`}
                    title={t(
                      "admin.management.toggleFeatured",
                    )}
                    aria-label={t(
                      "admin.management.toggleFeatured",
                    )}
                    aria-pressed={car.is_featured}
                    onClick={() => void cars.toggleFeatured(car)}
                  >
                    ★
                  </button>

                  <button
                    className="icon-button record-action record-action--delete"
                    title={t("admin.management.delete")}
                    aria-label={t("admin.management.delete")}
                    onClick={() => void cars.deleteCar(car)}
                  >
                    <Icon name="trash" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </LoadableContent>

      {editing !== undefined && (
        <CarFormDialog
          key={editing?.id ?? "new"}
          car={editing}
          brands={cars.brands}
          onClose={() => setEditing(undefined)}
          onSave={cars.saveCar}
        />
      )}

      {!cars.loading && !cars.error && (
        <Pagination
          page={cars.page}
          totalPages={cars.totalPages}
          totalItems={cars.totalItems}
          onChange={cars.setPage}
        />
      )}
    </section>
  )
}
