import certifiedIcon from "@/assets/site_assets/certified-icon.png"
import ccIcon from "@/assets/site_assets/cc-icon.png"
import supportIcon from "@/assets/site_assets/customer-suppport-icon.png"
import engineIcon from "@/assets/site_assets/engine-icon.png"
import fuelIcon from "@/assets/site_assets/fuel-icon.png"
import mileageIcon from "@/assets/site_assets/milage-icon.png"
import paymentIcon from "@/assets/site_assets/payment-icon.png"
import transmissionIcon from "@/assets/site_assets/transmission-icon.png"
import warrantyIcon from "@/assets/site_assets/trusted=warranty-icon.png"
import turboIcon from "@/assets/site_assets/turbo-icon.png"
import yearIcon from "@/assets/site_assets/year-icon.png"

export type CarAssetIconName =
  | "cc"
  | "engine"
  | "fuel"
  | "inspection"
  | "mileage"
  | "payment"
  | "support"
  | "transmission"
  | "turbo"
  | "warranty"
  | "year"

const icons: Record<CarAssetIconName, string> = {
  cc: ccIcon,
  engine: engineIcon,
  fuel: fuelIcon,
  inspection: certifiedIcon,
  mileage: mileageIcon,
  payment: paymentIcon,
  support: supportIcon,
  transmission: transmissionIcon,
  turbo: turboIcon,
  warranty: warrantyIcon,
  year: yearIcon,
}

export function CarAssetIcon({
  name,
  className,
}: {
  name: CarAssetIconName
  className?: string
}) {
  return (
    <img
      className={["car-asset-icon", className].filter(Boolean).join(" ")}
      src={icons[name]}
      alt=""
      aria-hidden="true"
      width="48"
      height="48"
    />
  )
}
