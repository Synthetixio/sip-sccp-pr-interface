import Image from "next/image";

export default function Side() {
	return (
		<div className="w-[352px] m-auto">
			<div className="bg-#0B0B22 overflow-hidden flex flex-wrap flex-col">
				<div className="flex flex-wrap h-[20px] ">
					<Image
						width={27}
						height={19}
						src="/assets/logo.png"
						className="block"
						alt="Logo"
					/>
					<h1 className="ml-[13px] font-orbitron text-[14px] text-white ">
						SIP/SCCP PR
					</h1>
				</div>
				<div className="mt-[30px]">
					<p className="text-[40px] text-white leading-10 font-bold font-inter">
						SIP/SCCP PR Interface
					</p>
				</div>
				<div className="mt-[33px] w-[352px]">
					<p className="text-[14px] leading-[18px] text-white font-inter">
						This interface allows you to submit PRs of Synthetix
						SIP&#39;s/SCCP&#39;s to the github repository. You can have a look
						at the current SIP/SCCP at &nbsp;
						<a
							className="underline"
							target="_blank"
							rel="noreferrer"
							href="https://gov.synthetix.io/#"
						>
							https://gov.synthetix.io/#
						</a>
					</p>
					<p className="mt-2 font-bold text-[14px] leading-[18px] text-white font-inter">
						You&#39;ll be making PR to{" "}
						<RenderStyledBlocks>master</RenderStyledBlocks> Branch of{" "}
						<RenderStyledBlocks>SIP&#39;s/SCCP&#39;s</RenderStyledBlocks>{" "}
						Repository, owned by
						<RenderStyledBlocks>Synthetixio</RenderStyledBlocks>
					</p>
				</div>
			</div>
		</div>
	);
}

function RenderStyledBlocks(props) {
	return (
		<span className="bg-[#828295] rounded-sm mx-1 leading-[20px]  px-1">
			{props.children}
		</span>
	);
}
