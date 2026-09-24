import styles from "./components.module.css";

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

export type SegmentedControlProps<T extends string> = {
  label: string;
  value: T;
  options: readonly SegmentOption<T>[];
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`${styles.segmented} ${className ?? ""}`}
      role="group"
      aria-label={label}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            className={`${styles.segment} ${
              active ? styles.segmentActive : ""
            }`}
            type="button"
            aria-pressed={active}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
