import * as fs from "fs";
import { pathEq, propEq } from "ramda";
import axios from "axios";

const CIRCLE_TOKEN = process.env.CIRCLE_TOKEN;
const ARTIFACT_TOKEN = process.env.ARTIFACT_TOKEN;
const PROGRAM_NAME = "spl_token_swap.so";

const axiosConfig = {
  headers: {
    "Circle-Token": CIRCLE_TOKEN,
  },
};

const downloadConfig = {
  headers: {
    "Circle-Token": ARTIFACT_TOKEN,
  },
};
const url = "https://circleci.com/api/v2/";
const projectSlug = "project/gh/civicteam/amm/";
const branch = "feature/HE-54__Token_swap_program_upgrade"; // TODO master

const download = async (url: string) => {
  const writer = fs.createWriteStream(`/tmp/${PROGRAM_NAME}`);

  console.log(url, downloadConfig);
  const response = await axios.get(url, {
    ...downloadConfig,
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

(async () => {
  const pipelines = await axios
    .get(`${url}${projectSlug}pipeline?branch=${branch}`, axiosConfig)
    .then((response) => response.data.items);

  const scheduledPipeline = (pipelines.find(
    pathEq(["trigger", "type"], "schedule")
  ) as unknown) as Record<string, unknown>;
  console.log("Pipeline: ", scheduledPipeline.id);

  const workflow = await axios
    .get(`${url}pipeline/${scheduledPipeline.id}/workflow`, axiosConfig)
    .then((response) => response.data.items[0]);

  console.log("Workflow:", workflow.id);

  const jobs = await axios
    .get(`${url}workflow/${workflow.id}/job`, axiosConfig)
    .then((response) => response.data.items);

  const compileJob = jobs.find(propEq("name", "compileSolanaPrograms"));

  console.log("Job:", compileJob.job_number);
  const artifacts = await axios
    .get(`${url}${projectSlug}${compileJob.job_number}/artifacts`, axiosConfig)
    .then((response) => response.data.items);

  const programArtifact = artifacts.find((artifact: Record<string, string>) =>
    artifact.path.endsWith(PROGRAM_NAME)
  );

  console.log("Artifact", programArtifact.url);
  await download(programArtifact.url);
})();
