import { Parameter } from "@aws-sdk/client-ssm";

type UploadedFile = {
  templateOptions: Record<string, string>;
  parameters: Parameter[];
}

export default UploadedFile;