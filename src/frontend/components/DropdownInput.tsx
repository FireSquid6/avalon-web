interface DropdownInputProps<T extends string> {
  label: string;
  value: T;
  options: readonly T[] | T[];
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
}

export function DropdownInput<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder,
  className = "",
}: DropdownInputProps<T>) {
  return (
    <div className={`form-control ${className}`}>
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <select 
        className="select select-bordered"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}