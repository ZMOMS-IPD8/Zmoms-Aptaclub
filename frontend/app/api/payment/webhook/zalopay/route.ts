export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("ZaloPay Webhook:", body);

    return Response.json({
      return_code: 1,
      return_message: "success",
    });
  } catch (error) {
    console.error("ZaloPay Webhook Error:", error);

    return Response.json(
      {
        return_code: 0,
        return_message: "failed",
      },
      { status: 500 },
    );
  }
}
