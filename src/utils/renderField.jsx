export function renderField(field, index, asString = false) {
  const required = field.required ? "required" : "";
  const fullClass = field.full ? " formFieldFull" : "";
  const options = (field.options || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  if (asString) {
    if (field.type === "textarea") {
      return `<div class="formField${fullClass}"><label>${field.label}</label><textarea placeholder="${field.placeholder}" ${required}></textarea></div>`;
    }

    if (field.type === "select") {
      return `<div class="formField${fullClass}"><label>${field.label}</label><select ${required}><option>${field.placeholder || field.label}</option>${options.map((o) => `<option>${o}</option>`).join("")}</select></div>`;
    }

    if (field.type === "checkbox") {
      return `<div class="formField${fullClass}"><label>${field.label}</label>${options.length ? options.map((o) => `<label class="check"><input type="checkbox"> ${o}</label>`).join("") : `<label class="check"><input type="checkbox" ${required}> ${field.placeholder || field.label}</label>`}</div>`;
    }

    return `<div class="formField${fullClass}"><label>${field.label}</label><input type="${field.type}" placeholder="${field.placeholder}" ${required}></div>`;
  }

  if (field.type === "textarea") {
    return (
      <div className={`formField ${field.full ? "formFieldFull" : ""}`} key={index}>
        <label>{field.label}</label>
        <textarea placeholder={field.placeholder} required={field.required} />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className={`formField ${field.full ? "formFieldFull" : ""}`} key={index}>
        <label>{field.label}</label>
        <select required={field.required}>
          <option>{field.placeholder || field.label}</option>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className={`formField ${field.full ? "formFieldFull" : ""}`} key={index}>
        <label>{field.label}</label>
        {options.length ? options.map((option) => (
          <label className="check" key={option}><input type="checkbox" /> {option}</label>
        )) : (
          <label className="check"><input type="checkbox" required={field.required} /> {field.placeholder || field.label}</label>
        )}
      </div>
    );
  }

  return (
    <div className={`formField ${field.full ? "formFieldFull" : ""}`} key={index}>
      <label>{field.label}</label>
      <input type={field.type} placeholder={field.placeholder} required={field.required} />
    </div>
  );
}
