type FieldProps = {
  label: string
  value: string | number
  type?: string
  onChange: (value: string) => void
}

export function Field({ label, value, type = 'text', onChange }: FieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} type={type} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

export function ReadonlyField({ label, value }: { label: string; value: string | number }) {
  return (
    <label className="field readonly-field">
      <span>{label}</span>
      <input value={value} readOnly />
    </label>
  )
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: T[]
  onChange: (value: T) => void
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  )
}

export function parseRecord(value: string): Record<string, string> | null {
  try {
    const parsed = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    return Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, String(v)]))
  } catch {
    return null
  }
}

export function parseArray<T>(value: string): T[] | null {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? (parsed as T[]) : null
  } catch {
    return null
  }
}
