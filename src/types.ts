export enum OverrideMode {
  NORMAL = "NORMAL",
  EMERGENCY = "EMERGENCY"
}

export interface CostBreakdown {
  label: string;
  amount_myr: number;
  confidence: number;
  source: string;
}

export interface TimeBreakdown {
  label: string;
  minutes_per_week: number;
  confidence: number;
  source: string;
}

export interface OptionCompared {
  option_name: string;
  monthly_cost_breakdown_myr: CostBreakdown[];
  time_cost_breakdown: TimeBreakdown[];
  estimated_monthly_total_cost_myr: number;
  estimated_monthly_time_minutes: number;
  pros: string[];
  cons: string[];
  risks_hidden_costs: string[];
}

export interface KeyNumber {
  label: string;
  value: string | number;
  unit: string;
  source: string;
  confidence: number;
}

export interface Recommendation {
  recommended_option_name: string;
  why: string[];
  expected_impact: {
    monthly_savings_myr: number;
    annual_savings_myr: number;
    weekly_time_saved_minutes: number;
  };
  action_plan_next_7_days: string[];
}

export interface Tradeoff {
  tradeoff: string;
  who_this_favors: string;
  notes: string;
}

export interface MissingInfo {
  question: string;
  why_needed: string;
  how_to_get: string;
}

export interface Script {
  purpose: string;
  message: string;
}

export interface Explanations {
  simple: string;
  detailed: string;
}

export interface Resource {
  name: string;
  why: string;
  url_or_phone: string;
}

export interface Score {
  decision_score: number;
  confidence: number;
}

export interface ExtractedSnapshot {
  income?: number;
  rent?: number;
  transport?: number;
  debt?: number;
  subscriptions?: { name: string; cost: number }[];
}

export interface AiyoResponse {
  version: string;
  decision_type: string;
  user_goal: string;
  summary_of_input: string;
  options_compared: OptionCompared[];
  key_numbers_extracted: KeyNumber[];
  recommendation: Recommendation;
  tradeoff_analysis: Tradeoff[];
  missing_info: MissingInfo[];
  copy_paste_scripts: Script[];
  explanations: Explanations;
  localized_resources: Resource[];
  score: Score;
  override_mode: OverrideMode;
}
