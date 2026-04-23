const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";
const goal = "Research top 5 competitors and summarize positioning for an Arc-native product.";

async function waitForServer(timeoutMs = 60000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/dashboard`);

      if (response.ok) {
        return;
      }
    } catch {
      // ignore and retry
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Server did not become ready within ${timeoutMs}ms.`);
}

async function post(path, body, rawBody = false) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: rawBody ? body : JSON.stringify(body)
  });
  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  return { response, text, json };
}

function expect(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

await waitForServer();

const invalidJson = await post("/api/plan", "{bad-json", true);
expect(invalidJson.response.status === 400, `Expected invalid JSON to return 400, got ${invalidJson.response.status}`);

const plan = await post("/api/plan", { goal });
expect(plan.response.status === 200, `Expected /api/plan 200, got ${plan.response.status}: ${plan.text}`);
expect(Array.isArray(plan.json?.workspace?.tasks), "Plan response missing tasks array.");
expect(plan.json.workspace.tasks.length >= 4, "Plan response returned too few tasks.");

const invalidTaskOutput = await post("/api/task-output", { goal });
expect(invalidTaskOutput.response.status === 400, `Expected invalid task-output payload to return 400, got ${invalidTaskOutput.response.status}`);

const task = plan.json.workspace.tasks[0];
const taskOutput = await post("/api/task-output", { goal, task });
expect(taskOutput.response.status === 200, `Expected /api/task-output 200, got ${taskOutput.response.status}: ${taskOutput.text}`);
expect(taskOutput.json?.output?.summary, "Task output missing summary.");

const verifyPayload = {
  goal,
  task: {
    ...task,
    status: "submitted",
    output: taskOutput.json.output
  },
  decisionIntent: "approved"
};
const verify = await post("/api/verify", verifyPayload);
expect(verify.response.status === 200, `Expected /api/verify 200, got ${verify.response.status}: ${verify.text}`);
expect(verify.json?.verification?.decision === "approved", "Verification did not approve as expected.");

const payoutRejected = await post("/api/payout", { task, payee: task.assignedTo });
expect(payoutRejected.response.status === 400, `Expected unverified payout to return 400, got ${payoutRejected.response.status}`);

const payout = await post("/api/payout", {
  task: {
    ...task,
    status: "verified",
    output: taskOutput.json.output,
    verification: verify.json.verification
  },
  payee: task.assignedTo
});
expect(payout.response.status === 200, `Expected /api/payout 200, got ${payout.response.status}: ${payout.text}`);
expect(payout.json?.receipt?.isMock === true, "Expected demo payout receipt to be marked mock.");

console.log("ArcTask smoke checks passed.");
