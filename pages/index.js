import Head from "next/head";
import Side from "../components/side";

export default function Login() {
	const githubClientId = process.env.NEXT_PUBLIC_PROD_GITHUB_CLIENT_ID;
	// const githubClientId = process.env.NEXT_PUBLIC_DEV_GITHUB_CLIENT_ID;

	return (
		<>
			<Head>
				<title>SIP / SCCP PR Interface</title>
				<link rel="shortcut icon" href="/favicon.ico" />
			</Head>
			<div>
				<div className="bg-[#0B0B22] w-full min-h-screen overflow-hidden  ">
					<div className="container m-auto mt-24 flex flex-wrap px-5 flex-row gap-20 ">
						<div className="mt-5">
							<Side />
						</div>
						<div className="w-[750px] ring-[1px] h-[650px] m-auto grid place-items-center ring-gray-500 rounded-[15px]">
							<div className="flex flex-wrap justify-center flex-col gap-5">
								<div className="m-auto">
									<img
										width="100px"
										src="data:image/png;base64,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"
									/>
								</div>
								<p className="text-white font-inter text-[18px] font-bold">
									Authorize yourself with GitHub{" "}
								</p>
								<button
									onClick={() =>
										window.open(
											`https://github.com/login/oauth/authorize?client_id=${githubClientId}&scope=user%20public_repo`,
											"_self"
										)
									}
									className="login-padding btn-gradient shadow w-min m-auto text-[14px] font-inter"
									style={{
										width: "fit-content",
										marginTop: "4em",
										color: "black",
									}}
								>
									Log In
								</button>
								<p className="text-white font-inter text-[18px] m-auto font-bold">
									or
								</p>
								<button
									onClick={() =>
										window.open("https://github.com/signup", "_self")
									}
									className="btn-login m-auto text-[14px] text-[#78edd7] duration-300 hover:text-white font-inter"
									style={{
										width: "fit-content",
									}}
								>
									Create Account
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
