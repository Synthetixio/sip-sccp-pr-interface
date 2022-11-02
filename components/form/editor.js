import React, { useId } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function EditorContainer({
	name,
	placeholder,
	onChange,
	defaultValue,
}) {
	const id = useId();
	const [value, setValue] = React.useState(defaultValue);

	const _onChange = (value) => {
		if (onChange)
			onChange({
				target: {
					name,
					value,
				},
			});
		setValue(value);
	};

	const modules = {
		toolbar: {
			container: [
				["bold", "italic", "underline", "strike", "blockquote"],
				[{ size: ["small", false, "large", "huge"] }, { color: [] }],
				[
					{ list: "ordered" },
					{ list: "bullet" },
					{ indent: "-1" },
					{ indent: "+1" },
					{ align: [] },
					{ "code-block": true },
				],
				["link", "image"],
				["clean"],
			],
		},
		clipboard: { matchVisual: false },
	};

	const formats = [
		"header",
		"bold",
		"italic",
		"underline",
		"strike",
		"blockquote",
		"size",
		"color",
		"list",
		"bullet",
		"indent",
		"link",
		"image",
		"align",
		"code-block",
	];

	return (
		<ReactQuill
			key={id}
			// placeholder={placeholder}
			theme="snow"
			modules={modules}
			formats={formats}
			value={value}
			onChange={_onChange}
			className="editor"
			scrollingContainer={".editor"}
		/>
	);
}
