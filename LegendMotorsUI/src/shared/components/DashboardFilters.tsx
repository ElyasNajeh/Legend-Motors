import type { ReactNode } from "react"
import { Icon } from "./Icon"

type FilterSearchProps = {
  label: string
  placeholder: string
  value: string
  onValueChange: (value: string) => void
}

export function FilterSearch({
  label,
  placeholder,
  value,
  onValueChange,
}: FilterSearchProps) {
  return (
    <label className="search-field">
      <span><Icon name="search" /></span>
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      />
    </label>
  )
}

type FilterSelectProps = {
  label: string
  value: string
  children: ReactNode
  onValueChange: (value: string) => void
}

export function FilterSelect({
  label,
  value,
  children,
  onValueChange,
}: FilterSelectProps) {
  return (
    <span className="filter-select">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      >
        {children}
      </select>
      <Icon name="arrow" />
    </span>
  )
}
