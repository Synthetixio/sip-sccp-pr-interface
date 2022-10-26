import axios from "axios";

export default async function handler(req, res) {
	const repo = "SIPs";
	// const repo = "typescript";
	const owner = "Synthetixio";
	// const owner = "nikhilswain";
	const baseBranch = "master";
	// const baseBranch = "main";
	if (req.method === "POST") {
		try {
			const {
				username,
				sip,
				title,
				network,
				type,
				author,
				implementor,
				SIPNumbers,
				createdDate,
				// additional fields
				simpleSummary,
				abstract,
				overview,
				rationale,
				testCases,
				configurableValues,
			} = req.body;
			if (title == null || username == null) {
				throw "Invaid Fields";
			}

			const authorStr =
				typeof author === "string" ? author : author?.join(", ");
			const implementorStr =
				typeof implementor === "string" ? implementor : implementor?.join(", ");
			const requires =
				typeof SIPNumbers === "string" ? SIPNumbers : SIPNumbers?.join(", ");

			const header = `---
sip: ${sip}
title: ${title}
network: ${network}
status: Draft
type: ${type}
author: ${authorStr}
implementor: ${implementorStr}
created: ${createdDate.split(" ")[0]}
requires: ${requires}
---
`;

			const PRtitle = `Create SIP-${sip}.md`;
			const branchName = PRtitle.replaceAll(" ", "-");
			const filePath = `content/sips/sip-${sip}.md`;

			const body = `
When opening a pull request to submit a new SIP, please use the suggested template: https://github.com/Synthetixio/SIPs/blob/master/sip-X.md

We have a GitHub bot that automatically merges some PRs. It will merge yours immediately if certain criteria are met:

The PR edits only existing Draft PRs.
The build passes.
Your Github username or email address is listed in the 'author' header of all affected PRs, inside .
If matching on email address, the email address is the one publicly listed on your GitHub profile.
`;

			const file = `${header}

# Simple Summary

${simpleSummary}

# Abstract

${abstract}

# Specification


### Overview

${overview}

### Rationale

${rationale}

### Test Cases

${testCases}


### Configurable Values (Via SCCP)

${configurableValues}

`;

			//?	fork the repo
			await axios({
				method: "post",
				url: `https://api.github.com/repos/${owner}/${repo}/forks`,
				headers: {
					Authorization:
						"token " + (req.headers?.authorization ?? req.query.access_token),
					"Content-Type": "application/json",
					Accept: "application/vnd.github+json",
				},
			}).catch((err) => {
				console.log(err?.response?.data);
			});

			//?	creata a branch in forked repo
			const newBranchAlready = await axios({
				method: "get",
				url: `https://api.github.com/repos/${username}/${repo}/git/refs/heads/${branchName}`,
				headers: {
					Authorization:
						"token " + (req.headers?.authorization ?? req.query.access_token),
					"Content-Type": "application/json",
					Accept: "application/vnd.github+json",
				},
				validateStatus: () => true,
			}).catch((err) => {
				console.log(err?.response?.data);
			});

			let newBranchData = {};

			//	check if branch already exists.
			if (newBranchAlready?.status !== 200) {
				//	get main branch "sha" hash
				const branchRes = await axios({
					method: "get",
					url: `https://api.github.com/repos/${username}/${repo}/git/refs/heads/${baseBranch}`,
					headers: {
						Authorization: "token " + req.query.access_token,
						"Content-Type": "application/json",
						Accept: "application/vnd.github+json",
					},
				}).catch((err) => {
					console.log(err?.response?.data);
				});

				const baseBranchHash = branchRes.data.object.sha;
				//	create new branch
				const newBranchRes = await axios({
					method: "post",
					url: `https://api.github.com/repos/${username}/${repo}/git/refs`,
					headers: {
						Authorization: "token " + req.query.access_token,
						Accept: "application/vnd.github+json",
					},
					data: {
						ref: `refs/heads/${branchName}`,
						sha: baseBranchHash,
					},
				});
				newBranchData = newBranchRes.data;
			} else {
				console.log("branch already exists");
				newBranchData = newBranchAlready.data;
			}

			//? create a file in that branch
			await axios({
				method: "put",
				url: `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`,
				headers: {
					Authorization:
						"token " + (req.headers?.authorization ?? req.query.access_token),
					Accept: "application/vnd.github+json",
				},
				data: {
					message: "adding appropriate file",
					content: Buffer.from(file).toString("base64"),
					branch: branchName,
				},
			});

			//?	open PR for this change
			const ghRes = await axios({
				method: "post",
				url: `https://api.github.com/repos/${owner}/${repo}/pulls`,
				headers: {
					Authorization:
						"token " + (req.headers?.authorization ?? req.query.access_token),
					"Content-Type": "application/json",
				},
				data: {
					title: PRtitle,
					body,
					head: `${username + ":" + branchName}`,
					base: baseBranch,
				},
			});

			res.json({ message: "success", data: ghRes.data });
			// res.json({ message: "success", data: "ok" });
		} catch (error) {
			console.log(error?.response?.data ?? error);
			res.status(400).send("something went wrong!");
		}
	} else {
		res.status(404).send();
	}
}
