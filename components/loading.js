import React from "react";
import { ClipLoader } from "react-spinners";

function Loading() {
	return (
		<div
			style={{
				position: "fixed",
				top: "0",
				display: "grid",
				placeItems: "center",
				height: "100%",
				width: "100vw",
				backgroundColor: "black",
				opacity: "0.8",
				zIndex: "1000",
			}}
		>
			<ClipLoader color="#36d7b7" about="loading..." />
		</div>
	);
}

export default Loading;
