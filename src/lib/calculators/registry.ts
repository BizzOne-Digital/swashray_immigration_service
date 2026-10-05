import type { CalculatorConfig } from "./types";
import { FSW_CONFIG } from "./fsw";
import { SINP_CONFIG } from "./sinp";
import { RNIP_WEST_KOOTENAY_CONFIG } from "./rnipWestKootenay";
import { MPNP_EOI_CONFIG, MANITOBA_PNP_CONFIG } from "./mpnpEoi";
import { ALBERTA_AAIP_CONFIG } from "./albertaAaip";
import { BC_PNP_CONFIG } from "./bcPnp";
import { SUPER_VISA_CONFIG } from "./superVisa";
import { NOVA_SCOTIA_SKILLED_WORKER_CONFIG } from "./novaScotiaSkilledWorker";

export const CALCULATOR_REGISTRY: Record<string, CalculatorConfig> = {
  [FSW_CONFIG.slug]: FSW_CONFIG,
  [SINP_CONFIG.slug]: SINP_CONFIG,
  [RNIP_WEST_KOOTENAY_CONFIG.slug]: RNIP_WEST_KOOTENAY_CONFIG,
  [MPNP_EOI_CONFIG.slug]: MPNP_EOI_CONFIG,
  [MANITOBA_PNP_CONFIG.slug]: MANITOBA_PNP_CONFIG,
  [ALBERTA_AAIP_CONFIG.slug]: ALBERTA_AAIP_CONFIG,
  [BC_PNP_CONFIG.slug]: BC_PNP_CONFIG,
  [SUPER_VISA_CONFIG.slug]: SUPER_VISA_CONFIG,
  [NOVA_SCOTIA_SKILLED_WORKER_CONFIG.slug]: NOVA_SCOTIA_SKILLED_WORKER_CONFIG,
};

export function getCalculatorConfig(slug: string): CalculatorConfig | undefined {
  return CALCULATOR_REGISTRY[slug];
}
