
export interface TextInputProps {
  state: string;
  onChange?: (s: string) => void;
  label: string;
  placeholder?: string;
}

export function TextInput(props: TextInputProps) {
  return (
    <fieldset className="fieldset w-[16rem]">
      <legend className="fieldset-legend">{props.label}</legend>
      <input type="text" className="input" placeholder={props.placeholder} value={props.state} onChange={(e) => {
        if (props.onChange !== undefined) {
          props.onChange(e.target.value);
        }
      }} />
    </fieldset>
  )
}
