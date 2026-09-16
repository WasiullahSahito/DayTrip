import PhoneInput from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import clsx from 'clsx'
import 'react-phone-number-input/style.css'

/**
 * A real country-code selector (flag + dial code, searchable) paired with
 * the number field, backed by react-phone-number-input — value is a proper
 * E.164 string (e.g. "+353871234567") the backend can validate directly,
 * not a hand-typed local number bolted onto a hardcoded "+353" prefix.
 *
 * Flags are rendered from the bundled SVG components (`flags` prop) rather
 * than the library's default, which fetches each flag as an <img> from a
 * third-party CDN at runtime — bundling avoids that external dependency.
 */
export default function PhoneField({ label, value, onChange, error, defaultCountry = 'IE', ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>}
      <PhoneInput
        international
        defaultCountry={defaultCountry}
        flags={flags}
        value={value}
        onChange={(v) => onChange(v || '')}
        countryCallingCodeEditable={false}
        className={clsx('lynk-phone-input', error && 'lynk-phone-input--error')}
        numberInputProps={{ className: 'lynk-phone-input__number' }}
        {...props}
      />
      {error && <span className="mt-1.5 block text-xs font-medium text-danger">{error}</span>}
    </label>
  )
}
