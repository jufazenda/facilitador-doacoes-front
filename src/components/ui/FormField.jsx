import Input from "./Input"

export default function FormField({ label, id, name, compact = false, required = true, labelClassName, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className={labelClassName ?? (compact ? "text-xs text-muted" : "text-sm font-semibold text-ink")}
        htmlFor={id ?? name}
      >
        {label}
      </label>
      <Input id={id ?? name} name={name} required={required} {...props} />
    </div>
  )
}
