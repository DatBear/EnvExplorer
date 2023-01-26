type TemplatedParameterValueResponse = {
  name: string;
  value: string | null;
  templateValues: Record<string, string>;
}

export default TemplatedParameterValueResponse;