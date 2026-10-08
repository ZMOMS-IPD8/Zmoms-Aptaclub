import { cookies } from "next/headers";

const AUTH_API_URL = process.env.GOOGLE_AUTH_API_URL;
const AUTH_API_KEY = process.env.GOOGLE_AUTH_API_KEY;

type ValidateSessionResponse = {
  success: boolean;
  status?: string;
  message?: string;
  employee_id?: string;
  full_name?: string;
};

export async function verifyAuthSession(): Promise<{
  valid: boolean;
  employeeId?: string;
  fullName?: string;
}> {
  if (!AUTH_API_URL || !AUTH_API_KEY) {
    return {
      valid: false,
    };
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("zmoms_session")?.value;

  if (!sessionToken) {
    return {
      valid: false,
    };
  }

  try {
    const response = await fetch(AUTH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: AUTH_API_KEY,
        action: "validate_session",
        session_token: sessionToken,
      }),
      cache: "no-store",
    });

    const result = (await response.json()) as ValidateSessionResponse;

    if (!result.success) {
      return {
        valid: false,
      };
    }

    return {
      valid: true,
      employeeId: result.employee_id,
      fullName: result.full_name,
    };
  } catch {
    return {
      valid: false,
    };
  }
}
