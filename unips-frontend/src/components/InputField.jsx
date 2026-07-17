function InputField({ label, type, placeholder, value, onChange, name, autoComplete, required, minLength }) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-slate-800">
        {label}
      </label>

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className="
                      w-full
                      border
                      border-slate-300
                      rounded-xl
                      px-4
                      py-3
                      outline-none
                      text-slate-900
                      placeholder:text-slate-400
                      focus:border-teal-600
                      focus:ring-2
                      focus:ring-teal-100
                      transition
                    "
      />
    </div>
  );
}

export default InputField;
