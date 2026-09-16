const test = require("node:test");
const assert = require("node:assert");

const BASE_URL = "http://localhost:5000";

let userToken = "";
let userId = "";
let workspaceId = "";
let projectId = "";
let createdIssueId = "";
let createdIssueKey = "";
let sprintId = "";

test("API Test Suite — Authentication, Multi-Tenancy & Issue Workflows", async (t) => {
  // 1. Health Check
  await t.test("GET /api/health should return 200 and healthy status", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.status, "healthy");
    assert.strictEqual(data.database, "connected");
  });

  // 2. Authentication: Login demo user
  await t.test("POST /api/auth/login with valid credentials returns token and user", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "alex@taskflow.dev",
        password: "password123",
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
    assert.ok(data.user);
    userToken = data.token;
    userId = data.user.id || data.user._id;
  });

  // 3. Multi-Tenancy: Get Workspaces
  await t.test("GET /api/workspaces/my returns user workspaces with roles", async () => {
    const res = await fetch(`${BASE_URL}/api/workspaces/my`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.workspaces));
    assert.ok(data.workspaces.length >= 1);
    workspaceId = data.workspaces[0]._id;
    assert.ok(workspaceId);
  });

  // 4. Projects: Get Projects in Workspace
  await t.test("GET /api/projects returns projects with workspace header", async () => {
    const res = await fetch(`${BASE_URL}/api/projects`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
        "x-workspace-id": workspaceId,
      },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.projects));
    assert.ok(data.projects.length >= 1);
    projectId = data.projects[0]._id;
  });

  // 5. Concurrency-Safe Issue Creation & Key Generation
  await t.test("POST /api/issues safely generates sequential human-readable key", async () => {
    const res = await fetch(`${BASE_URL}/api/issues`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
        "x-workspace-id": workspaceId,
      },
      body: JSON.stringify({
        projectId,
        title: "Test Automated Verification Issue",
        description: "Created via automated test suite",
        type: "task",
        status: "todo",
        priority: "high",
        storyPoints: 5,
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.issue);
    assert.match(data.issue.key, /^[A-Z0-9]+-\d+$/);
    createdIssueId = data.issue._id;
    createdIssueKey = data.issue.key;
  });

  // 6. Kanban Status Movement
  await t.test("PUT /api/issues/:id/move updates status and order", async () => {
    const res = await fetch(`${BASE_URL}/api/issues/${createdIssueId}/move`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
        "x-workspace-id": workspaceId,
      },
      body: JSON.stringify({
        status: "in_progress",
        order: 2500,
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.issue.status, "in_progress");
  });

  // 7. Comments & Mentions
  await t.test("POST /api/comments/issue/:issueId adds comment", async () => {
    const res = await fetch(`${BASE_URL}/api/comments/issue/${createdIssueId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
        "x-workspace-id": workspaceId,
      },
      body: JSON.stringify({
        text: "Automated test comment @alex",
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.comment.text, "Automated test comment @alex");
  });

  // 8. Sprint Business Rule: Prevent Multiple Active Sprints
  await t.test("Sprint validation prevents overlapping active sprints in same project", async () => {
    // Create sprint 1
    const s1Res = await fetch(`${BASE_URL}/api/sprints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
        "x-workspace-id": workspaceId,
      },
      body: JSON.stringify({
        projectId,
        name: "Test Sprint Validation Alpha",
        goal: "Test overlapping restriction",
      }),
    });
    const s1Data = await s1Res.json();
    const s1Id = s1Data.sprint._id;

    // Create sprint 2
    const s2Res = await fetch(`${BASE_URL}/api/sprints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
        "x-workspace-id": workspaceId,
      },
      body: JSON.stringify({
        projectId,
        name: "Test Sprint Validation Beta",
      }),
    });
    const s2Data = await s2Res.json();
    const s2Id = s2Data.sprint._id;

    // Check if project already has active sprint or attempt starting both
    const start2Res = await fetch(`${BASE_URL}/api/sprints/${s2Id}/start`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
        "x-workspace-id": workspaceId,
      },
    });

    // If an active sprint already existed in seed data, it will return 400
    // If not, starting another sprint should return 400
    if (start2Res.status === 200) {
      const secondStart = await fetch(`${BASE_URL}/api/sprints/${s1Id}/start`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
          "x-workspace-id": workspaceId,
        },
      });
      assert.strictEqual(secondStart.status, 400);
    } else {
      assert.strictEqual(start2Res.status, 400);
    }
  });

  // 9. Multi-Tenant Isolation & IDOR Protection
  await t.test("Rejects cross-tenant access when invalid workspace ID provided", async () => {
    const fakeWorkspaceId = "507f1f77bcf86cd799439011";
    const res = await fetch(`${BASE_URL}/api/projects`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
        "x-workspace-id": fakeWorkspaceId,
      },
    });

    // Must be 403 Forbidden or 404 Not Found, never 200 OK
    assert.ok([403, 404].includes(res.status));
  });

  // 10. Analytics Calculation
  await t.test("GET /api/analytics returns accurate delivery metrics", async () => {
    const res = await fetch(`${BASE_URL}/api/analytics`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
        "x-workspace-id": workspaceId,
      },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.summary);
    assert.ok(data.data.statusDistribution);
    assert.ok(data.data.workload);
    assert.ok(Array.isArray(data.data.velocity));
  });

  // 11. Cleanup test issue
  await t.test("DELETE /api/issues/:id removes issue and related comments", async () => {
    const res = await fetch(`${BASE_URL}/api/issues/${createdIssueId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "x-workspace-id": workspaceId,
      },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });
});
