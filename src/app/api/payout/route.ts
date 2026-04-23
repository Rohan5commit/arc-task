import { NextResponse } from "next/server";
import { parsePayoutPayload, readJsonBody } from "@/lib/api/schemas";
import { createPaymentAdapter } from "@/lib/payments/create-adapter";
import type { PaymentMode, PayoutApiResponse } from "@/lib/types";

export async function POST(request: Request) {
  const body = await readJsonBody(request);

  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: body.status });
  }

  const parsed = parsePayoutPayload(body.data);

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  if (parsed.data.task.status !== "verified") {
    return NextResponse.json(
      { error: "Only verified tasks can release a payout." },
      { status: 400 }
    );
  }

  try {
    const paymentMode = (process.env.PAYMENT_MODE === "arc_testnet"
      ? "arc_testnet"
      : "demo") as PaymentMode;
    const adapter = createPaymentAdapter(paymentMode);
    const receipt = await adapter.settleTaskPayout({
      task: parsed.data.task,
      payee: parsed.data.payee
    });

    const response: PayoutApiResponse = {
      taskId: parsed.data.task.id,
      receipt,
      warnings: receipt.isMock
        ? ["Server returned a demo receipt. No onchain settlement was attempted."]
        : []
    };

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("Arc testnet settlement")
        ? error.message
        : "Unable to settle payout.";

    return NextResponse.json({ error: message }, { status: 503 });
  }
}
