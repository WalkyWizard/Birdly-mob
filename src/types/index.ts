export interface BirdInfo {
  ukr_name?: string
  scientific_name?: string
  family?: string
  habitat?: string
  region?: string
  diet?: string
  size?: string
  conservation_status?: string
  interesting_facts?: string
  matched_key?: string
}

export interface VariantItem {
  species: string
  confidence: number
}

export interface ImageAnalysisResponse {
  success: boolean
  record_id?: number
  file_name?: string
  predicted_species: string
  confidence: number
  variants: VariantItem[]
  bird_info?: BirdInfo
}

export interface AudioAnalysisResponse {
  success: boolean
  record_id?: number
  file_name?: string
  predicted_species: string
  confidence: number
  is_reliable: boolean
  status_description: string
  variants: VariantItem[]
  bird_info?: BirdInfo
}

export interface MultimodalAnalysisResponse {
  success: boolean
  record_id?: number
  image_result: ImageAnalysisResponse
  audio_result: AudioAnalysisResponse
  verdict: string
  reliability_note: string
  is_match: boolean
  match_level: string
}

export interface HistoryRecord {
  id: number
  analysis_type: string
  image_name?: string
  predicted_species: string
  confidence: number
  analysis_date: string
  description?: string
  scientific_name?: string
  family?: string
  habitat?: string
  region?: string
  diet?: string
  size?: string
  conservation_status?: string
  interesting_facts?: string
  audio_name?: string
  audio_predicted_species?: string
  audio_confidence?: number
  top3_json?: string
  additional_info?: string
}

export interface ComparisonRow {
  parameter: string
  bird1_value: string
  bird2_value: string
  is_identical: boolean
}

export interface CompareResponse {
  bird1_name: string
  bird2_name: string
  same_family: boolean
  comparison_rows: ComparisonRow[]
}

export interface SpeciesOption {
  key: string
  ukr_name: string
  scientific_name: string
}

export interface BirdsMetadata {
  families: string[]
  habitats: string[]
  diets: string[]
  species: SpeciesOption[]
}