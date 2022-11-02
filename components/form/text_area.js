import dynamic from "next/dynamic";

const EditorWrapper = dynamic(() => import("./editor"), {
	ssr: false,
});

export default function TextArea(props) {
	const { label, placeholder, name, handleChange, defaultValue } = props;

	return (
		<div>
			<label className="font-inter text-gray-500 text-[12px]">{label}</label>
			<EditorWrapper
				name={name}
				placeholder={placeholder}
				onChange={handleChange}
				defaultValue={defaultValue}
			/>
		</div>
	);
}
