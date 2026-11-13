const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

interface ContactDetails {
  name: string;
  email: string;
}

interface SubmissionResponse {
  success: boolean;
  message: string;
  data?: {
    referenceId: string;
  };
  errors?: {
    field: string;
    message: string;
  }[];
}

export async function submitProject<TAnswers extends object>(
  payload: {
    serviceCategory: string;
    answers: TAnswers;
    contact: ContactDetails;
  }
): Promise<{ referenceId: string }> {
  const response = await fetch(
    `${API_BASE_URL}/api/projects`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const result: SubmissionResponse = await response
    .json()
    .catch(() => ({
      success: false,
      message: "The server returned an invalid response.",
    }));

  if (!response.ok) {
    const validationMessage = result.errors
      ?.map((error) => error.message)
      .join(", ");

    throw new Error(
      validationMessage || result.message || "Submission failed."
    );
  }

  if (!result.data?.referenceId) {
    throw new Error("The server did not return a project reference ID.");
  }

  return result.data;
}