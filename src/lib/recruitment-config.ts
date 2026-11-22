import "server-only";
import { inspectRecruitmentReadiness } from "./recruitment-readiness";
export { recruitmentRequirements } from "./recruitment-readiness";
export function recruitmentReadiness() {
  return inspectRecruitmentReadiness(process.env);
}
export function applicationsEnabled() {
  return recruitmentReadiness().enabled;
}
