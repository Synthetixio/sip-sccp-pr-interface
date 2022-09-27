import React, { useEffect, useState } from "react";
import DateInput from "../components/form/date_selector";
import DropdownSelector from "../components/form/dropdown_selector";
import TextArea from "../components/form/text_area";
import TextInput from "../components/form/text_input";
import Side from "../components/side";
import Tabs from "../components/tabs";
import UserCard from "../components/user_card";
import { Transition } from "@headlessui/react";
import CustomInput from "../components/form/custom_input";
import Joi from "joi";
import axios from "axios";
import Head from "next/head";

export async function getServerSideProps(context) {
	try {
		if (
			context.query?.access_token == null ||
			context.query?.access_token === ""
		) {
			return {
				redirect: {
					permanent: false,
					destination: "/",
				},
				props: {},
			};
		}

		const ghRes = await axios({
			method: "get",
			url: `https://api.github.com/user`,
			headers: {
				Authorization: "token " + context.query?.access_token ?? "",
			},
		});

		return {
			props: {
				username: ghRes.data.login,
				avatar_url: ghRes.data.avatar_url,
				name: ghRes.data.name,
				company: ghRes.data.company,
				bio: ghRes.data.bio,
				access_token: context.query?.access_token,
			},
		};
	} catch (error) {
		console.log(error);
		return {
			redirect: {
				permanent: false,
				destination: "/",
			},
			props: {},
		};
	}
}

export default function CreatePr({
	username,
	avatar_url,
	name,
	company,
	bio,
	access_token,
}) {
	const [active, setActive] = React.useState("sip");

	const [sccp, setSccp] = useState(0);
	const [sip, setSip] = useState(0);

	useEffect(() => {
		fetch(`/api/next?access_token=${access_token}&opt=sccp`)
			.then((res) => res.text())
			.then((data) => setSccp(Number(data)));

		fetch(`/api/next?access_token=${access_token}&opt=sip`)
			.then((res) => res.text())
			.then((data) => setSip(Number(data)));
	}, [access_token]);

	return (
		<>
			<Head>
				<link rel="shortcut icon" href="/favicon.ico" />
				<title>SIP / SCCP PR Interface</title>
			</Head>
			<div>
				<div className="bg-[#0B0B22] w-full min-h-screen overflow-hidden  ">
					<div className="container m-auto my-24 flex flex-wrap px-5  flex-row gap-20 ">
						<div className="m-auto   md:mt-5">
							<Side />
							<Tabs active={active} setActive={setActive} />
						</div>
						<div className="w-full p-2 md:p-5   xl:w-[710px] ring-[1px] overflow-hidden  m-auto ring-gray-500 py-5 px-1 rounded-[15px]">
							<UserCard
								username={username}
								avatar_url={avatar_url}
								name={name}
								company={company}
								bio={bio}
							/>

							<div className="m-auto w-full  ">
								<Transition
									show={active === "sip"}
									enter="transition-opacity duration-75"
									enterFrom="opacity-0"
									enterTo="opacity-100"
									leave="transition-opacity duration-150"
									leaveFrom="opacity-100"
									leaveTo="opacity-0"
								>
									<RenderSipForm
										username={username}
										access_token={access_token}
										sip={sip}
									/>
								</Transition>

								<Transition
									show={active === "sccp"}
									enter="transition-opacity duration-75"
									enterFrom="opacity-0"
									enterTo="opacity-100"
									leave="transition-opacity duration-150"
									leaveFrom="opacity-100"
									leaveTo="opacity-0"
								>
									<RenderSccpForm
										username={username}
										access_token={access_token}
										sccp={sccp}
									/>
								</Transition>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

function RenderSipForm({ username, access_token, sip }) {
	const options = [
		{ value: "Ethereum", label: "Ethereum" },
		{
			value: "Optimism",
			label: "Optimism",
		},
		{ value: "Ethereum & Optimism", label: "Ethereum & Optimism" },
	];
	const options2 = [
		{ value: "Meta-Governance", label: "Meta-Governance" },
		{ value: "Governance", label: "Governance" },
		{
			value: "Governance & Meta-Governance",
			label: "Governance & Meta-Governance",
		},
	];

	const schema = Joi.object({
		abstract: Joi.string().required().max(1000),
		author: Joi.array()
			.items(Joi.string().required().max(50))
			.required()
			.min(1),
		configurableValues: Joi.string().required().max(200),
		createdDate: Joi.date().required(),
		implementationDate: Joi.date(),
		implementor: Joi.array().items(Joi.string().required().max(50)).min(1),
		overview: Joi.string().required().max(200),
		proposal: Joi.string().max(200),
		rationale: Joi.string().required().max(200),
		release: Joi.string().required().max(50),
		simpleSummary: Joi.string().required().max(200),
		sip: Joi.number().required().default(String(sip)),
		SIPNumbers: Joi.array().items(Joi.number()),
		title: Joi.string().required().max(50),
		username: Joi.string(),
		network: Joi.string().required(),
		testCases: Joi.string().required().max(200),
		type: Joi.string().required().max(50),
	});

	const [input, setInput] = React.useState({
		username: username ?? "fallback",
		author: [],
		SIPNumbers: [],
		implementor: [],
	});

	const handleChange = (e) => {
		setInput({
			...input,
			[e.target.name]: e.target.value,
		});
	};

	const getLastValues = () => {
		//getting all the values from the input that starts with temp
		const tempValues = Object.keys(input).filter((key) =>
			key.startsWith("temp")
		);
		//adding the values to the input
		tempValues.forEach((key) => {
			//removing the temp from the keys
			const name = key.split("-")[1];
			if (input[key] && input[key].length > 0)
				input[name] = [...input[name], input[key]];
			delete input[key];
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		getLastValues();
		//validating input
		const { error } = schema.validate(input);
		if (error) {
			console.log(error);
			alert(error);
		} else {
			console.log(input);
			const res = await fetch(`/api/sip?access_token=${access_token}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(input),
			});
			if (res.ok) {
				const data = await res.json();
				console.log(data);
				alert("PR created successfully!");
				window.open(data.data.html_url, "_blank");
			} else {
				alert("something went wrong! Please try again.");
			}
		}
	};
	return (
		<form className="flex flex-wrap gap-5 flex-col">
			<p className="text-[24px] mt-3 font-semibold font-inter text-white ">
				SIP Submission
			</p>
			<input
				onChange={handleChange}
				type="text"
				name="username"
				value={input.username}
				hidden
				required
			/>
			<TextInput
				name="sip"
				handleChange={handleChange}
				placeholder="SIP Number"
				label="SIP"
				defaultValue={sip}
			/>

			<TextInput
				name="title"
				handleChange={handleChange}
				placeholder="SIP Title"
				label="SIP Title"
			/>

			<div className="grid grid-cols-2 gap-5">
				<DropdownSelector
					handleChange={handleChange}
					name="network"
					options={options}
					label="SIP Type"
				/>
				<DropdownSelector
					name="type"
					handleChange={handleChange}
					options={options2}
					label="Type"
				/>
			</div>

			<CustomInput
				name="author"
				setValue={setInput}
				value={input}
				label="Author(s)*"
				placeholder="Author name"
			/>

			<CustomInput
				label="Implementor(s)"
				name="implementor"
				setValue={setInput}
				value={input}
				placeholder="Implementor name"
			/>

			<DateInput
				label="Implementation Date"
				name="implementationDate"
				handleChange={handleChange}
			/>

			<TextInput
				name="release"
				placeholder="Name of Release"
				handleChange={handleChange}
				label="Release name"
			/>

			<TextInput
				name="proposal"
				handleChange={handleChange}
				placeholder="Thread on https://research.synthetix.io/"
				label="Proposal Link (optional)"
			/>
			<DateInput
				name="createdDate"
				handleChange={handleChange}
				label="Created on*"
			/>

			<CustomInput
				name="SIPNumbers"
				setValue={setInput}
				value={input}
				label="SIP number(s) (optional)"
				placeholder="SIP number"
			/>

			<TextArea
				rows={5}
				name="simpleSummary"
				handleChange={handleChange}
				placeholder="If you can't explain it simply, you don't understand it well enough. Simply describe the outcome the proposed change intends to achieve. This should be non-technical and accessible to a casual community member"
				label="Simple summary*"
			/>
			<TextArea
				label="Abstract*"
				name="abstract"
				handleChange={handleChange}
				rows={8}
				placeholder="A short (~200 words) description of the proposed change, the abstract should clearly describe the proposed change. This is what will be done if the SIP is implemented, not why it should be done or how it will be done. If the SIP proposes deploying a new contract, write, 'we propose to deploy a new contract that will do x'"
			/>
			<TextArea
				name="overview"
				handleChange={handleChange}
				label="Overview*"
				rows={3}
				placeholder="This is a high level overview of how the SIP will solve the problem. The overview should clearly describe how the new feature will be implemented"
			/>
			<TextArea
				name="rationale"
				handleChange={handleChange}
				label="Rationale*"
				rows={10}
				placeholder="This is where you explain the reasoning behind how you propose to solve the problem. Why did you propose to implement the change in this way, what were the considerations and trade-offs. The rationale fleshes out what motivated the design and why particular design decisions were made. It should describe alternate designs that were considered and related work. The rationale may also provide evidence of consensus within the community, and should discuss important objections or concerns raised during discussion"
			/>
			<TextArea
				name="testCases"
				handleChange={handleChange}
				label="Test Cases*"
				placeholder="Test cases for an implementation are mandatory for SIPs but can be included with the implementation"
				rows={3}
			/>
			<TextArea
				name="configurableValues"
				handleChange={handleChange}
				label="Configurable Values*"
				rows={3}
				placeholder="Please list all values configurable via SCCP under this implementation"
			/>
			<button onClick={handleSubmit} className="submit-button">
				Submit PR
			</button>
		</form>
	);
}

function RenderSccpForm({ username, access_token, sccp }) {
	const options = [
		{ value: "Ethereum", label: "Ethereum" },
		{
			value: "Optimism",
			label: "Optimism",
		},
		{ value: "Ethereum & Optimism", label: "Ethereum & Optimism" },
	];

	const schema = Joi.object({
		abstract: Joi.string().required().max(1000),
		author: Joi.array()
			.items(Joi.string().required().max(50))
			.required()
			.min(1),
		createdDate: Joi.date().required(),
		motivation: Joi.string().max(200),
		copyright: Joi.string(),
		simpleSummary: Joi.string().required().max(200),
		sccp: Joi.number().required().default(String(sccp)),
		username: Joi.string(),
		SCCPNumbers: Joi.array().items(Joi.number()),
		title: Joi.string().required().max(50),
		network: Joi.string().required().max(50),
		updatedDate: Joi.date().required(),
	});

	const [input, setInput] = React.useState({
		username: username ?? "fallback",
		author: [],
		SCCPNumbers: [],
	});

	const handleChange = (e) => {
		setInput({
			...input,
			[e.target.name]: e.target.value,
		});
	};

	const getLastValues = () => {
		//getting all the values from the input that starts with temp
		const tempValues = Object.keys(input).filter((key) =>
			key.startsWith("temp")
		);
		//adding the values to the input
		tempValues.forEach((key) => {
			//removing the temp from the keys
			const name = key.split("-")[1];
			if (input[key] && input[key].length > 0)
				input[name] = [...input[name], input[key]];
			delete input[key];
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		getLastValues();

		const { error } = schema.validate(input);
		if (error) {
			console.log(error);
			alert(error);
		} else {
			console.log(input);
			const res = await fetch(`/api/sccp?access_token=${access_token}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(input),
			});
			if (res.ok) {
				const data = await res.json();
				console.log(data);
				alert("PR created successfully!");
				window.open(data.data.html_url, "_blank");
			} else {
				alert("something went wrong! Please try again.");
			}
		}
	};

	return (
		<form className="flex flex-wrap gap-5 flex-col">
			<p className="text-[24px] mt-3 font-semibold font-inter text-white ">
				SCCP Submission
			</p>
			<input
				onChange={handleChange}
				type="text"
				name="username"
				value={input.username}
				hidden
				required
			/>
			<TextInput
				handleChange={handleChange}
				name="sccp"
				placeholder="SCCP Number"
				label="SCCP*"
				defaultValue={sccp}
			/>
			<TextInput
				handleChange={handleChange}
				name="title"
				placeholder="SCCP Title"
				label="SCCP Title*"
			/>
			<DropdownSelector
				handleChange={handleChange}
				name="network"
				options={options}
				label="Network*"
			/>

			<CustomInput
				name="author"
				label="Author(s)*"
				setValue={setInput}
				value={input}
				placeholder="Author name"
			/>

			<DateInput
				handleChange={handleChange}
				name="createdDate"
				label="Created on*"
			/>
			<DateInput
				name="updatedDate"
				handleChange={handleChange}
				label="Updated on"
			/>

			<CustomInput
				name="SCCPNumbers"
				label="SCCP number(s) (optional)"
				placeholder="SCCP number"
				setValue={setInput}
				value={input}
			/>

			<TextArea
				rows={5}
				name="simpleSummary"
				handleChange={handleChange}
				placeholder="If you can't explain it simply, you don't understand it well enough. Simply describe the outcome the proposed change intends to achieve. This should be non-technical and accessible to a casual community member"
				label="Simple summary*"
			/>
			<TextArea
				label="Abstract*"
				rows={8}
				handleChange={handleChange}
				name="abstract"
				placeholder="A short (~200 words) description of the proposed change, the abstract should clearly describe the proposed change. This is what will be done if the SCCP is implemented, not why it should be done or how it will be done. If the SCCP proposes deploying a new contract, write, 'we propose to deploy a new contract that will do x'"
			/>
			<TextArea
				name="motivation"
				label="Motivation*"
				handleChange={handleChange}
				rows={8}
				placeholder="This is the problem statement. This is the why of the SCCP. It should clearly explain why the current state of the protocol is inadequate. It is critical that you explain why the change is needed, if the SCCP proposes changing how something is calculated, you must address why the current calculation is innaccurate or wrong. This is not the place to describe how the SCCP will address the issue!"
			/>
			<TextInput
				name="copyright"
				handleChange={handleChange}
				label="Copyright"
				placeholder="Copyright and related rights waived via [CC0](https://creativecommons.org/publicdo..."
			/>
			<button onClick={handleSubmit} className="submit-button">
				Submit PR
			</button>
		</form>
	);
}
