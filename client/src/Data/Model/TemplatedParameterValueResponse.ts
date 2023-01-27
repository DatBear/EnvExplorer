type TemplatedParameterValueResponse = {
  name: string;
  value: string | null;
  type: string | null;
  templateValues: Record<string, string>;
}

export default TemplatedParameterValueResponse;